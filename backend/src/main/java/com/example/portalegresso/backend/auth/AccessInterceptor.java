package com.example.portalegresso.backend.auth;

import java.util.Map;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.example.portalegresso.backend.model.repository.*;
import lombok.RequiredArgsConstructor;

/** Authorization uses matched controller variables, never a raw URL supplied by the client. */
@Component
@RequiredArgsConstructor
public class AccessInterceptor implements HandlerInterceptor {
    private final SessionService sessions;
    private final CargoRepositorio cargos;
    private final DepoimentoRepositorio depoimentos;
    private final CursoEgressoRepositorio formacoes;
    private final DestaqueEgressoRepositorio destaques;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod method) || "OPTIONS".equals(request.getMethod())) return true;
        response.setHeader("Cache-Control", "no-store");
        if (request.getDispatcherType() == jakarta.servlet.DispatcherType.ERROR) return true;
        boolean write = !java.util.Set.of("GET", "HEAD").contains(request.getMethod());
        if (write) sessions.verifyCsrf(request);
        PortalAccess access = method.getMethodAnnotation(PortalAccess.class);
        if (access == null) {
            if (write) throw forbidden(); // New write endpoints must opt into an explicit policy.
            return true;
        }
        if (access.value() == PortalAccess.Policy.PUBLIC) return true;
        SessionUser user = sessions.current(request);
        @SuppressWarnings("unchecked")
        Map<String, String> vars = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        String id = vars.getOrDefault("id", vars.get("id_egresso"));
        boolean allowed = switch (access.value()) {
            case SESSION -> true;
            case ADMIN -> user.admin();
            case ADMIN_OTHER_COORDINATOR -> user.admin() && !same(user.id(), id);
            case COORDINATOR -> user.coordinator();
            case SELF_COORDINATOR -> user.admin() || user.coordinator() && same(user.id(), id);
            case PROFILE -> user.admin() || "egresso".equals(user.role()) && same(user.id(), id);
            case CARGO -> user.admin() || "egresso".equals(user.role()) && cargos.findById(integer(id))
                    .map(c -> Objects.equals(c.getEgresso().getId_egresso(), user.id())).orElseThrow(AccessInterceptor::missing);
            case DEPOIMENTO -> user.admin() || "egresso".equals(user.role()) && depoimentos.findById(integer(id))
                    .map(d -> Objects.equals(d.getEgresso().getId_egresso(), user.id())).orElseThrow(AccessInterceptor::missing);
            case FORMATION -> formation(user, integer(id));
            case CREATE_HIGHLIGHT -> user.admin() || user.coordinator() && same(user.id(), vars.get("id_coord"))
                    && formacoes.existsForCoordinator(integer(vars.get("id_egresso")), user.id());
            case HIGHLIGHT -> user.admin() || user.coordinator() && destaques.findById(longId(id))
                    .map(d -> Objects.equals(d.getCoordenador().getId_coordenador(), user.id())).orElseThrow(AccessInterceptor::missing);
            default -> false;
        };
        if (!allowed) throw forbidden();
        return true;
    }

    private boolean formation(SessionUser user, Integer id) {
        if (user.admin()) return true;
        var formation = formacoes.findById(id).orElseThrow(AccessInterceptor::missing);
        return "egresso".equals(user.role()) ? Objects.equals(formation.getEgresso().getId_egresso(), user.id())
                : user.coordinator() && Objects.equals(formation.getCurso().getCoordenador().getId_coordenador(), user.id());
    }
    private static boolean same(Integer id, String value) { return Objects.equals(id, integer(value)); }
    private static Integer integer(String value) {
        try { int id = Integer.parseInt(value); if (id > 0) return id; }
        catch (NumberFormatException ignored) { }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um identificador válido.");
    }
    private static Long longId(String value) {
        try { long id = Long.parseLong(value); if (id > 0) return id; }
        catch (NumberFormatException ignored) { }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um identificador válido.");
    }
    private static ResponseStatusException forbidden() { return new ResponseStatusException(HttpStatus.FORBIDDEN, "Sua conta não tem permissão para esta ação."); }
    private static ResponseStatusException missing() { return new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro não encontrado."); }
}
