package com.example.portalegresso.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.example.portalegresso.backend.auth.*;
import com.example.portalegresso.backend.dto.*;
import com.example.portalegresso.backend.service.ManagementService;
import lombok.RequiredArgsConstructor;
import static com.example.portalegresso.backend.auth.PortalAccess.Policy.*;

@RestController
@RequiredArgsConstructor
public class ManagementController {
    private final ManagementService management;
    private final SessionService sessions;
    public record Password(@NotBlank @Size(min = 8, max = 128) String senha) {}
    public record Revision(@NotNull Long versao) {}

    @PutMapping("/api/coordenadores/atualizar/curso/{id}")
    @PortalAccess(ADMIN)
    public Object editCourse(@PathVariable Integer id, @Valid @RequestBody CursoDTO dto) { return management.editCourse(id, dto); }

    @PutMapping("/api/coordenadores/atualizar/destaque/{id}")
    @PortalAccess(HIGHLIGHT)
    public Object editHighlight(@PathVariable Long id, @Valid @RequestBody DestaqueEgressoDTO dto) { return management.editHighlight(id, dto); }

    @GetMapping("/api/gestao/rascunhos")
    @PortalAccess(COORDINATOR)
    public Object drafts(HttpServletRequest request) { return management.drafts(sessions.current(request)); }

    @GetMapping("/api/gestao/rascunhos/{id}")
    @PortalAccess(COORDINATOR)
    public Object draft(@PathVariable Long id, HttpServletRequest request) { return management.draft(id, sessions.current(request)); }

    @PostMapping("/api/gestao/rascunhos")
    @PortalAccess(COORDINATOR)
    public ResponseEntity<?> save(@Valid @RequestBody RascunhoDTO dto, HttpServletRequest request) {
        return ResponseEntity.status(201).body(management.saveDraft(null, dto, sessions.current(request)));
    }

    @PutMapping("/api/gestao/rascunhos/{id}")
    @PortalAccess(COORDINATOR)
    public Object update(@PathVariable Long id, @Valid @RequestBody RascunhoDTO dto, HttpServletRequest request) {
        return management.saveDraft(id, dto, sessions.current(request));
    }

    @PostMapping("/api/gestao/rascunhos/{id}/publicar")
    @PortalAccess(COORDINATOR)
    public ResponseEntity<?> publish(@PathVariable Long id, @Valid @RequestBody Revision dto, HttpServletRequest request) {
        return ResponseEntity.status(201).body(management.publishDraft(id, dto.versao(), sessions.current(request)));
    }

    @DeleteMapping("/api/gestao/rascunhos/{id}")
    @PortalAccess(COORDINATOR)
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        management.deleteDraft(id, sessions.current(request)); return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/gestao/egressos/{id}/senha")
    @PortalAccess(ADMIN)
    public ResponseEntity<Void> password(@PathVariable Integer id, @Valid @RequestBody Password dto) {
        management.password(id, dto.senha()); return ResponseEntity.noContent().build();
    }
}
