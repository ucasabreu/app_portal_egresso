package com.example.portalegresso.backend.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.portalegresso.backend.model.entidades.Cargo;
import com.example.portalegresso.backend.model.entidades.Coordenador;
import com.example.portalegresso.backend.model.entidades.Curso;
import com.example.portalegresso.backend.model.entidades.CursoEgresso;
import com.example.portalegresso.backend.model.entidades.Depoimento;
import com.example.portalegresso.backend.model.entidades.Egresso;
import com.example.portalegresso.backend.service.ConsultasService;
import com.example.portalegresso.backend.service.RegraNegocioRunTime;

@RequestMapping("/api/consultas")
@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")

public class ConsultasController {
    @Autowired
    ConsultasService consultasService;

    // GET
    // -> CURSOS
    @GetMapping("/listar/cursos")
    public ResponseEntity<?> listarTodosCursos() {
        List<Curso> cursos = consultasService.listarTodosCursos();

        if (cursos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum curso encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(cursos, HttpStatus.OK);
    }

    @GetMapping("/listar/cursos/nivel")
    public ResponseEntity<?> listarPorFiltros(String nivel) {
        List<Curso> cursos = consultasService.listarPorFiltros(nivel);
        
        if (cursos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum curso encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(cursos, HttpStatus.OK);
    }

    // -> DEPOIMENTOS

    @GetMapping("/listar/depoimentos")
    public ResponseEntity<?> listarDepoimentosRecentes() {
        List<Depoimento> depoimentos = consultasService.consultarRecentes();

        if (depoimentos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum depoimento encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(depoimentos, HttpStatus.OK);
    }

    @GetMapping("/listar/depoimentos/limite")
    public ResponseEntity<?> listarDepoimentosRecentesComLimite(Integer limite) {

        List<Depoimento> depoimentos = consultasService.consultarRecentes(limite);
        
        if (depoimentos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum depoimento encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(depoimentos, HttpStatus.OK);
    }

    @GetMapping("/listar/depoimentos/ano") // OK
    public ResponseEntity<?> listarDepoimentosPorAno(Integer ano) {
        List<Depoimento> depoimentos = consultasService.consultarPorAno(ano);
        
        if (depoimentos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum depoimento encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(depoimentos, HttpStatus.OK);
    }

    @GetMapping("/listar/cargos")
    public ResponseEntity<?> listarCargos() {
        List<Cargo> cargos = consultasService.listarCargos();
        
        if (cargos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum cargo encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(cargos, HttpStatus.OK);
    }

    // -> EGRESSOS

    @GetMapping("/listar/egressos")
    public ResponseEntity<?> listarEgressos() {
        List<Egresso> egressos = consultasService.listarEgressos();
        
        if (egressos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum egresso encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(egressos, HttpStatus.OK);
    }

    @GetMapping("/listar/egressos/nome")
    public ResponseEntity<?> listarEgressosPorNome(String nome) {
        List<Egresso> egressos = consultasService.consultarEgressosPorNome(nome);
        
        if (egressos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum egresso encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(egressos, HttpStatus.OK);
    }

    // TODO: verificar pesquisa por cargo esta correta
    @GetMapping("/listar/egressos/cargo")
    public ResponseEntity<?> listarEgressosPorCargo(String cargo) {
        List<Egresso> egressos = consultasService.consultarEgressosPorCargo(cargo);

        if (egressos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum egresso encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(egressos, HttpStatus.OK);
    }

    @GetMapping("/listar/egressos/curso")
    public ResponseEntity<?> listarEgressosPorCurso(String curso) {
        List<Egresso> egressos = consultasService.consultarEgressosPorCurso(curso);

        if (egressos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum egresso encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(egressos, HttpStatus.OK);
    }

    @GetMapping("/listar/egressos/ano_inicio")
    public ResponseEntity<?> listarEgressosPorAnoInicioCurso(Integer ano) {
        List<Egresso> egressos = consultasService.consultarEgressosPorAnoInicio(ano);
        
        if (egressos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum egresso encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(egressos, HttpStatus.OK);
    }

    @GetMapping("/listar/egressos/ano_fim")
    public ResponseEntity<?> listarEgressosPorAnoFimCurso(Integer ano) {
        List<Egresso> egressos = consultasService.consultarEgressosPorAnoFim(ano);
        
        if (egressos.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum egresso encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(egressos, HttpStatus.OK);
    }

    @GetMapping("/listar/egressos/nomes")
    public ResponseEntity<?> listarTodosNomesEgressos() {
        List<String> nomes = consultasService.listarTodosNomesEgressos();

        if (nomes.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum egresso encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(nomes, HttpStatus.OK);
    }

    @GetMapping("/listar/cursoegresso")
    public ResponseEntity<?> listarCursoEgresso() {
        List<CursoEgresso> cursoEgresso = consultasService.listarCursoEgresso();

        if (cursoEgresso.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum egresso matriculado em curso encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(cursoEgresso, HttpStatus.OK);
    }

    @GetMapping("/listar/coordenadores")
    public ResponseEntity<?> listarCoordenadores() {
        List<Coordenador> coordenadores = consultasService.listarCoordenadores();
        
        if (coordenadores.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Nenhum cordenador encontrado.");
            response.put("data", Collections.emptyList());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        return new ResponseEntity<>(coordenadores, HttpStatus.OK);
    }

}
