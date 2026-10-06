package com.example.portalegresso.backend.auth;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import static com.example.portalegresso.backend.auth.PortalAccess.Policy.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final SessionService sessions;
    public record Credentials(@NotBlank @Size(max = 254) String login, @NotBlank @Size(max = 128) String senha) {}

    @GetMapping("/csrf")
    public Map<String, String> csrf(HttpServletRequest request) { return Map.of("token", sessions.csrf(request)); }

    @PostMapping("/login")
    @PortalAccess(PUBLIC)
    public SessionUser login(@Valid @RequestBody Credentials credentials, HttpServletRequest request) {
        return sessions.login(request, credentials.login(), credentials.senha());
    }

    @GetMapping("/me")
    @PortalAccess(SESSION)
    public SessionUser me(HttpServletRequest request) { return sessions.current(request); }

    @PostMapping("/logout")
    @PortalAccess(PUBLIC)
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        if (request.getSession(false) != null) request.getSession(false).invalidate();
        return ResponseEntity.noContent().build();
    }
}
