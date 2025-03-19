package com.example.portalegresso.backend.controller;


import java.util.List;

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

    //GET

    // -> CURSOS
    @GetMapping("/listar/cursos")
    public ResponseEntity<?> listarTodosCursos(){
        try{
            List<Curso> cursos = consultasService.listarTodosCursos();
            return new ResponseEntity<>(cursos, HttpStatus.OK);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
   
    @GetMapping("/listar/cursos/nivel")
    public ResponseEntity<?> listarPorFiltros(String nivel) {
        try {
            List<Curso> cursos = consultasService.listarPorFiltros(nivel);
            return new ResponseEntity<>(cursos, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // -> DEPOIMENTOS

    @GetMapping("/listar/depoimentos")
    public ResponseEntity<?> listarDepoimentosRecentes(){
        try{
            List<Depoimento> depoimentos = consultasService.consultarRecentes();
            return new ResponseEntity<>(depoimentos, HttpStatus.OK);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/listar/depoimentos/limite")
    public ResponseEntity<?> listarDepoimentosRecentesComLimite(Integer limite){
        try{
            List<Depoimento> depoimentos = consultasService.consultarRecentes(limite);
            return new ResponseEntity<>(depoimentos, HttpStatus.OK);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    
    @GetMapping("/listar/depoimentos/ano")//OK
    public ResponseEntity<?> listarDepoimentosPorAno(Integer ano) {
        try {
            List<Depoimento> depoimentos = consultasService.consultarPorAno(ano);
            return new ResponseEntity<>(depoimentos, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/listar/cargos")
    public ResponseEntity<?> listarCargos(){
        try{
            List<Cargo> cargos = consultasService.listarCargos();
            return new ResponseEntity<>(cargos, HttpStatus.OK);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    // -> EGRESSOS

    @GetMapping("/listar/egressos")
    public ResponseEntity<?> listarEgressos() {
        try{
            List<Egresso> egressos = consultasService.listarEgressos();
            return new ResponseEntity<>(egressos, HttpStatus.OK);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    

    @GetMapping("/listar/egressos/nome")
    public ResponseEntity<?> listarEgressosPorNome(String nome){
        try{
            List<Egresso> egressos = consultasService.consultarEgressosPorNome(nome);
            return new ResponseEntity<>(egressos, HttpStatus.OK);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    //TODO: verificar pesquisa por cargo esta correta
    @GetMapping("/listar/egressos/cargo")
    public ResponseEntity<?> listarEgressosPorCargo(String cargo){
        try{
            List<Egresso> egressos = consultasService.consultarEgressosPorCargo(cargo);
            return new ResponseEntity<>(egressos, HttpStatus.OK);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/listar/egressos/curso")
    public ResponseEntity<?> listarEgressosPorCurso(String curso){
        try{
            List<Egresso> egressos = consultasService.consultarEgressosPorCurso(curso);
            return new ResponseEntity<>(egressos, HttpStatus.OK);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/listar/egressos/ano_inicio")
    public ResponseEntity<?> listarEgressosPorAnoInicioCurso(Integer ano){
        try{
            List<Egresso> egressos = consultasService.consultarEgressosPorAnoInicio(ano);
            return new ResponseEntity<>(egressos, HttpStatus.OK);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/listar/egressos/ano_fim")
    public ResponseEntity<?> listarEgressosPorAnoFimCurso(Integer ano){
        try{
            List<Egresso> egressos = consultasService.consultarEgressosPorAnoFim(ano);
            return new ResponseEntity<>(egressos, HttpStatus.OK);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/listar/egressos/nomes")
    public ResponseEntity<?> listarTodosNomesEgressos() {
        try {
            List<String> nomes = consultasService.listarTodosNomesEgressos();
            return new ResponseEntity<>(nomes, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


    @GetMapping("/listar/cursoegresso")
    public ResponseEntity<?> listarCursoEgresso() {
        try {
            List<CursoEgresso> cursoEgresso = consultasService.listarCursoEgresso();
            return new ResponseEntity<>(cursoEgresso, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/listar/coordenadores")
    public ResponseEntity<?> listarCoordenadores() {
        try {
            List<Coordenador> cursos = consultasService.listarCoordenadores();
            return new ResponseEntity<>(cursos, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    

    

}
