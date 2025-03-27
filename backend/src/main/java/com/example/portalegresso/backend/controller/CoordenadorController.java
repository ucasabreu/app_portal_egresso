package com.example.portalegresso.backend.controller;

import java.util.List;
import java.util.Map;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.portalegresso.backend.dto.CoordenadorDTO;
import com.example.portalegresso.backend.dto.CursoDTO;
import com.example.portalegresso.backend.dto.DestaqueEgressoDTO;
import com.example.portalegresso.backend.model.entidades.Coordenador;
import com.example.portalegresso.backend.model.entidades.Curso;
import com.example.portalegresso.backend.model.entidades.CursoEgresso;
import com.example.portalegresso.backend.model.entidades.DestaqueEgresso;
import com.example.portalegresso.backend.model.entidades.Egresso;
import com.example.portalegresso.backend.model.repository.CargoRepositorio;
import com.example.portalegresso.backend.service.CoordenadorService;
import com.example.portalegresso.backend.service.RegraNegocioRunTime;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/coordenadores")
@CrossOrigin(origins = "*", allowedHeaders = "*")

public class CoordenadorController {

    private final CargoRepositorio cargoRepositorio;
    private final CoordenadorService coordenadorService;

    @Autowired
    public CoordenadorController(CargoRepositorio cargoRepositorio, CoordenadorService coordenadorService) {
        this.cargoRepositorio = cargoRepositorio;
        this.coordenadorService = coordenadorService;
    }

    // POST
    @PostMapping("/salvar/coordenador") // OK
    public ResponseEntity<?> salvar(@RequestBody @Valid CoordenadorDTO dto) {
        Coordenador coordenador = Coordenador.builder()
                // .id_coordenador(dto.getId_coordenador())
                .login(dto.getLogin())
                .senha(dto.getSenha())
                .tipo(dto.getTipo())
                .build();

        try {
            Coordenador salvo = coordenadorService.salvar(coordenador);
            return new ResponseEntity<>(salvo, HttpStatus.CREATED);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/autenticar/coordenador") // ok
    public ResponseEntity<?> autenticar(@RequestBody @Valid CoordenadorDTO dto) {
        try {
            coordenadorService.efetuarLogin(dto.getLogin(), dto.getSenha());
            return ResponseEntity.ok(true);
        } catch (RegraNegocioRunTime e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id_coord}/egresso/{id_egresso}/destaque")
    public ResponseEntity<?> salvarDestaque(@PathVariable("id_egresso") Integer idEgresso,
            @PathVariable("id_coord") Integer idCoord, @RequestBody @Valid DestaqueEgressoDTO dto) {
        DestaqueEgresso destaque = DestaqueEgresso.builder()
                .egresso(Egresso.builder().id_egresso(idEgresso).build())
                .coordenador(Coordenador.builder().id_coordenador(idCoord).build())
                .titulo(dto.getTitulo())
                .noticia(dto.getNoticia())
                .imagem(dto.getImagem())
                .feitoDestaque(dto.getFeitoDestaque())
                .build();
        try {
            DestaqueEgresso salvo = coordenadorService.salvarDestaque(destaque);
            return new ResponseEntity<>(salvo, HttpStatus.CREATED);

        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

    }

    
    @PostMapping("/salvar/curso") // ok
    public ResponseEntity<?> salvarCurso(@RequestBody @Valid CursoDTO dto) {
        Curso curso = Curso.builder()
                .nome(dto.getNome())
                .nivel(dto.getNivel())
                .coordenador(Coordenador.builder().id_coordenador(dto.getId_coordenador()).build())
                .build();

        try {
            Curso salvo = coordenadorService.salvar(curso);
            return new ResponseEntity<>(salvo, HttpStatus.CREATED);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

    }

    // PUT
    @PutMapping("/atribuir/curso")
    public ResponseEntity<?> atribuirCoordenadorAoCurso(@RequestBody Map<String, Integer> payload) {
        Integer idCurso = payload.get("id_curso");
        Integer idCoordenador = payload.get("id_coordenador");

        try {
            coordenadorService.atribuirCoordenador(idCurso, idCoordenador);
            return ResponseEntity.ok("Coordenador atribuído com sucesso.");
        } catch (RegraNegocioRunTime e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/destaque/atribuir/{idDestaque}/{idCoordenador}")
    public ResponseEntity<?> atribuirCoordenadorParaDestaque(
            @PathVariable Long idDestaque,
            @PathVariable Integer idCoordenador) {
        try {
            DestaqueEgresso destaqueAtualizado = coordenadorService.atribuirCoordenadorAoDestaque(idDestaque,
                    idCoordenador);
            return ResponseEntity.ok(destaqueAtualizado);
        } catch (RegraNegocioRunTime e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/buscar/coordenador")
    public ResponseEntity<?> buscarCoordenadorPorSenha(@RequestParam("login") String login,
            @RequestParam("senha") String senha) {
        try {
            Coordenador coordenador = coordenadorService.buscarCoordenadorPorLoginESenha(login, senha);
            return new ResponseEntity<>(coordenador, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // GET
    @GetMapping("/buscar/coordenador/{id}")
    public ResponseEntity<?> buscarCoordenador(@PathVariable("id") Integer idCoordenador) {
        try {
            Coordenador coordenador = coordenadorService.buscarCoordenadorPorId(idCoordenador);
            return new ResponseEntity<>(coordenador, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/buscar/destaque/{id}")
    public ResponseEntity<?> buscarDestaque(@PathVariable("id") Long idDestaque) {
        try {
            DestaqueEgresso destaque = coordenadorService.buscarDestaquePorId(idDestaque);
            return new ResponseEntity<>(destaque, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/destaque/listar")
    public ResponseEntity<List<DestaqueEgresso>> listarDestaques(
            @RequestParam(value = "nome", required = false) String nome) {

        List<DestaqueEgresso> destaques = (nome != null && !nome.isEmpty())
                ? coordenadorService.buscarDestaquesPorNomeOuCurso(nome)
                : coordenadorService.listarDestaques();

        return ResponseEntity.ok(destaques); // Sempre retorna 200 com lista (vazia ou não)
    }

    @GetMapping("/destaque/egresso/{idEgresso}")
    public ResponseEntity<?> listarDestaquesPorEgresso(@PathVariable("idEgresso") Integer idEgresso) {
        try {
            List<DestaqueEgresso> destaques = coordenadorService.buscarDestaquesPorEgresso(idEgresso);
            return new ResponseEntity<>(destaques, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/coordenador/{id}/egressos_curso")
    public ResponseEntity<?> buscarEgressosPorCursoId(@PathVariable("id") Integer idCurso) {
        try {
            List<CursoEgresso> cursoEgresso = coordenadorService.buscarEgressosPorCursoId(idCurso);
            return new ResponseEntity<>(cursoEgresso, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // DELETE
    @DeleteMapping("/deletar/coordenador/{id}") // ok
    public ResponseEntity<?> remover(@PathVariable("id") Integer idCoordenador) {
        try {
            Coordenador coor = Coordenador.builder().id_coordenador(idCoordenador).build();
            coordenadorService.remover(coor);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

    }

    @DeleteMapping("/deletar/curso/{id}") // ok
    public ResponseEntity<?> removerCurso(@PathVariable("id") Integer idCurso) {
        try {
            Curso curso = Curso.builder().id_curso(idCurso).build();
            coordenadorService.remover(curso);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/deletar/destaque/{id}")
    public ResponseEntity<?> removerDestaque(@PathVariable("id") Long idDestaque) {
        try {
            DestaqueEgresso destaque = DestaqueEgresso.builder().id(idDestaque).build();
            coordenadorService.remover(destaque);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

}
