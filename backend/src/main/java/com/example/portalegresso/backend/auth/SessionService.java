package com.example.portalegresso.backend.auth;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.example.portalegresso.backend.model.repository.CoordenadorRepositorio;
import com.example.portalegresso.backend.model.repository.EgressoRepositorio;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SessionService {
    public static final String USER = "portal.user";
    private static final String CSRF = "portal.csrf";
    private final CoordenadorRepositorio coordenadores;
    private final EgressoRepositorio egressos;
    private final PasswordHasher passwords;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();
    private String dummyPassword;
    private record Attempts(int count, long expires) {}

    @jakarta.annotation.PostConstruct
    void prepareDummyPassword() { dummyPassword = passwords.encode(java.util.UUID.randomUUID().toString()); }

    public String csrf(HttpServletRequest request) {
        HttpSession session = request.getSession();
        synchronized (session) {
            if (session.getAttribute(CSRF) == null) {
                byte[] bytes = new byte[32]; random.nextBytes(bytes);
                session.setAttribute(CSRF, Base64.getUrlEncoder().withoutPadding().encodeToString(bytes));
            }
            return (String) session.getAttribute(CSRF);
        }
    }

    public void verifyCsrf(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String supplied = request.getHeader("X-CSRF-TOKEN");
        Object expected = session == null ? null : session.getAttribute(CSRF);
        if (!(expected instanceof String token) || supplied == null || supplied.length() > 100
                || !MessageDigest.isEqual(token.getBytes(StandardCharsets.UTF_8), supplied.getBytes(StandardCharsets.UTF_8)))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "A sessão de segurança expirou. Atualize a página e tente novamente.");
    }

    public SessionUser current(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Object value = session == null ? null : session.getAttribute(USER);
        if (value instanceof SessionUser saved) {
            SessionUser current = saved.coordinator()
                    ? coordenadores.findById(saved.id()).filter(c -> "geral".equals(c.getTipo()) || "coordenador".equals(c.getTipo())).map(c -> new SessionUser(c.getId_coordenador(), c.getTipo(), c.getLogin(), c.getLogin())).orElse(null)
                    : "egresso".equals(saved.role()) ? egressos.findById(saved.id()).map(e -> new SessionUser(e.getId_egresso(), "egresso", e.getEmail(), e.getNome())).orElse(null) : null;
            if (current != null && (current.coordinator() || "egresso".equals(current.role()))) return current;
            session.invalidate();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre na sua conta para continuar.");
    }

    public SessionUser login(HttpServletRequest request, String login, String password) {
        String identifier = login.trim();
        String key = request.getRemoteAddr() + ":" + identifier.toLowerCase(java.util.Locale.ROOT);
        long now = System.currentTimeMillis();
        synchronized (attempts) {
            attempts.entrySet().removeIf(item -> item.getValue().expires() < now);
            Attempts prior = attempts.get(key);
            if (prior != null && prior.count() >= 10)
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Muitas tentativas. Tente novamente em 15 minutos.");
            if (attempts.size() >= 10_000 && prior == null)
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Aguarde antes de tentar novamente.");
            attempts.put(key, new Attempts(prior == null ? 1 : prior.count() + 1, prior == null ? now + 900_000 : prior.expires()));
        }
        SessionUser user = null;
        if (identifier.contains("@")) {
            var person = egressos.findByEmailIgnoreCase(identifier);
            String hash = person.map(p -> p.getSenha() == null ? dummyPassword : p.getSenha()).orElse(dummyPassword);
            if (passwords.matches(password, hash) && person.isPresent()) {
                var graduate = person.get(); user = new SessionUser(graduate.getId_egresso(), "egresso", graduate.getEmail(), graduate.getNome());
            }
        } else {
            var person = coordenadores.findByLogin(identifier);
            if (passwords.matches(password, person.map(p -> p.getSenha() == null ? dummyPassword : p.getSenha()).orElse(dummyPassword)) && person.isPresent()) {
                var coordinator = person.get();
                var candidate = new SessionUser(coordinator.getId_coordenador(), coordinator.getTipo(), coordinator.getLogin(), coordinator.getLogin());
                if (candidate.coordinator()) user = candidate;
            }
        }
        if (user == null || !(user.coordinator() || "egresso".equals(user.role())))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login ou senha incorretos.");
        attempts.remove(key);
        request.getSession();
        request.changeSessionId();
        request.getSession().setAttribute(USER, user);
        request.getSession().removeAttribute(CSRF);
        return user;
    }
}
