package com.example.portalegresso.backend.controller;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import com.example.portalegresso.backend.auth.*;
import com.example.portalegresso.backend.service.PortalQueryService;
import lombok.RequiredArgsConstructor;
import static com.example.portalegresso.backend.auth.PortalAccess.Policy.*;

@RestController
@RequiredArgsConstructor
public class PortalQueryController {
    private final PortalQueryService queries;
    private final SessionService sessions;

    @GetMapping("/api/publico/egressos")
    public Object directory(@RequestParam(defaultValue = "") String nome, @RequestParam(defaultValue = "") String curso,
                            @RequestParam(defaultValue = "") String cargo, @RequestParam(required = false) Integer anoInicio,
                            @RequestParam(required = false) Integer anoFim, @RequestParam(defaultValue = "1") int pagina,
                            @RequestParam(defaultValue = "6") int tamanho, @RequestParam(defaultValue = "nome-asc") String ordem) {
        return queries.directory(nome, curso, cargo, anoInicio, anoFim, pagina, tamanho, ordem);
    }

    @GetMapping("/api/publico/destaques")
    public Object gallery(@RequestParam(defaultValue = "") String nome, @RequestParam(defaultValue = "1") int pagina,
                          @RequestParam(defaultValue = "6") int tamanho, @RequestParam(defaultValue = "recentes") String ordem) {
        return queries.gallery(nome, pagina, tamanho, ordem);
    }

    @GetMapping("/api/gestao/painel")
    @PortalAccess(COORDINATOR)
    public Object dashboard(HttpServletRequest request) { return queries.dashboard(sessions.current(request)); }
}
