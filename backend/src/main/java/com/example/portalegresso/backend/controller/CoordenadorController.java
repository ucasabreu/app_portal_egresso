package com.example.portalegresso.backend.controller;

import java.util.List;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.portalegresso.backend.dto.CoordenadorDTO;
import com.example.portalegresso.backend.dto.CursoDTO;
import com.example.portalegresso.backend.model.entidades.Coordenador;
import com.example.portalegresso.backend.model.entidades.Curso;
import com.example.portalegresso.backend.model.entidades.CursoEgresso;
import com.example.portalegresso.backend.model.repository.CargoRepositorio;
import com.example.portalegresso.backend.service.CoordenadorService;
import com.example.portalegresso.backend.service.RegraNegocioRunTime;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RequestMapping("/api/coordenadores")
@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")

public class CoordenadorController {

    private final CargoRepositorio cargoRepositorio;
    @Autowired
    CoordenadorService coordenadorService;

    CoordenadorController(CargoRepositorio cargoRepositorio) {
        this.cargoRepositorio = cargoRepositorio;
    }

    // POST
    @PostMapping("/salvar/coordenador") // OK
    public ResponseEntity<?> salvar(@RequestBody CoordenadorDTO dto) {
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
    public ResponseEntity<?> autenticar(@RequestBody CoordenadorDTO dto) {
        try {
            coordenadorService.efetuarLogin(dto.getLogin(), dto.getSenha());
            return ResponseEntity.ok(true);
        } catch (RegraNegocioRunTime e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/salvar/curso") // ok
    public ResponseEntity<?> salvarCurso(@RequestBody CursoDTO dto) {
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

    @GetMapping("/buscar/coordenador")
    public ResponseEntity<?> buscarCoordenadorPorSenha(@RequestParam("login") String login, @RequestParam("senha") String senha) {
        try {
            Coordenador coordenador = coordenadorService.buscarCoordenadorPorLoginESenha(login, senha);
            return new ResponseEntity<>(coordenador, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    

    //GET
    @GetMapping("/buscar/coordenador/{id}")
    public ResponseEntity<?> buscarCoordenador(@PathVariable("id") Integer idCoordenador) {
        try {
            Coordenador coordenador = coordenadorService.buscarCoordenadorPorId(idCoordenador);
            return new ResponseEntity<>(coordenador, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/coordenador/{id}/egressos_curso")
    public ResponseEntity<?> buscarEgressosPorCursoId(@PathVariable("id") Integer idCurso){
        try{
            List<CursoEgresso> cursoEgresso = coordenadorService.buscarEgressosPorCursoId(idCurso);
            return new ResponseEntity<>(cursoEgresso, HttpStatus.OK);
        }
        catch(RegraNegocioRunTime e){
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

}
