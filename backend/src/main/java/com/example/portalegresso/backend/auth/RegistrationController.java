package com.example.portalegresso.backend.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.example.portalegresso.backend.dto.EgressoDTO;
import com.example.portalegresso.backend.model.entidades.Egresso;
import com.example.portalegresso.backend.service.EgressoService;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;
import static com.example.portalegresso.backend.auth.PortalAccess.Policy.*;

@RestController
@RequiredArgsConstructor
public class RegistrationController {
    private final EgressoService egressos;
    private final PasswordHasher passwords;
    private final SessionService sessions;

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class Registration extends EgressoDTO {
        @NotBlank @Size(min = 8, max = 128)
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
        private String senha;
    }

    @PostMapping("/api/auth/register")
    @PortalAccess(PUBLIC)
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<SessionUser> register(@Valid @RequestBody Registration dto, HttpServletRequest request) {
        Egresso person = egressos.salvar(Egresso.builder().nome(dto.getNome()).email(dto.getEmail())
                .descricao(dto.getDescricao()).foto(dto.getFoto()).linkedin(dto.getLinkedin())
                .instagram(dto.getInstagram()).curriculo(dto.getCurriculo()).senha(passwords.encode(dto.getSenha())).build());
        return ResponseEntity.status(HttpStatus.CREATED).body(sessions.login(request, person.getEmail(), dto.getSenha()));
    }
}
