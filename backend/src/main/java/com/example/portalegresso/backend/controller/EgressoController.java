package com.example.portalegresso.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.portalegresso.backend.dto.CargoDTO;
import com.example.portalegresso.backend.dto.CursoEgressoDTO;
import com.example.portalegresso.backend.dto.DepoimentoDTO;
import com.example.portalegresso.backend.dto.EgressoDTO;
import com.example.portalegresso.backend.model.entidades.Cargo;
import com.example.portalegresso.backend.model.entidades.Curso;
import com.example.portalegresso.backend.model.entidades.CursoEgresso;
import com.example.portalegresso.backend.model.entidades.Depoimento;
import com.example.portalegresso.backend.model.entidades.Egresso;
import com.example.portalegresso.backend.model.repository.CargoRepositorio;
import com.example.portalegresso.backend.service.EgressoService;
import com.example.portalegresso.backend.service.RegraNegocioRunTime;

import jakarta.validation.Valid;

import java.util.List;

@RequestMapping("/api/egressos")
@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")

public class EgressoController {

    private final CargoRepositorio cargoRepositorio;
    @Autowired
    EgressoService egressoService;


    EgressoController(CargoRepositorio cargoRepositorio) {
        this.cargoRepositorio = cargoRepositorio;
    }


    // POST
    /*
     * -> POST /api/egressos/salvar/egresso
     * -> POST /api/egressos/salvar/depoimento
     * -> POST /api/egressos/salvar/cargo
     * 
     */

    @PostMapping("/salvar/egresso") //ok
    public ResponseEntity<?> salvar(@RequestBody @Valid EgressoDTO dto){
        Egresso egresso = Egresso.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .descricao(dto.getDescricao())
                .foto(dto.getFoto())
                .linkedin(dto.getLinkedin())
                .instagram(dto.getInstagram())
                .curriculo(dto.getCurriculo())
                .build();
        
        try{
            Egresso salvo = egressoService.salvar(egresso);
            return new ResponseEntity<>(salvo, HttpStatus.CREATED);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/salvar/egresso/{id}/salvar_depoimento")//ok
    public ResponseEntity<?> salvarDepoimento(@PathVariable("id") Integer idEgresso, @RequestBody @Valid DepoimentoDTO dto) {
        Depoimento depoimento = Depoimento.builder()
                .egresso(Egresso.builder().id_egresso(idEgresso).build())
                .texto(dto.getTexto())
                .build();
        try {
            Depoimento salvo = egressoService.salvar(depoimento);
            return new ResponseEntity<>(salvo, HttpStatus.CREATED);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/salvar/egresso/{id}/salvar_cargo") //OK
    public ResponseEntity<?> salvarCargo(@PathVariable("id") Integer idEgresso ,@RequestBody @Valid CargoDTO dto){
        Cargo cargo = Cargo.builder()
                    .egresso(Egresso.builder().id_egresso(idEgresso).build())
                    .descricao(dto.getDescricao())
                    .local(dto.getLocal())
                    .ano_inicio(dto.getAno_inicio())
                    .ano_fim(dto.getAno_fim())
                    .build();  
                    
        try{
            Cargo salvo = egressoService.salvar(cargo);
            return new ResponseEntity<>(salvo, HttpStatus.CREATED);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/salvar/egresso/{id_egresso}/curso/{id_curso}/curso_egresso")
    public ResponseEntity<?> salvarCursoEgresso(@PathVariable("id_egresso") Integer idEgresso, @PathVariable("id_curso") Integer idCurso, @RequestBody @Valid CursoEgressoDTO dto) {
        CursoEgresso cursoEgresso = CursoEgresso.builder()
                .egresso(Egresso.builder().id_egresso(idEgresso).build())
                .curso(Curso.builder().id_curso(idCurso).build())
                .ano_inicio(dto.getAno_inicio())
                .ano_fim(dto.getAno_fim())
                .build();
        try {
            CursoEgresso salvo = egressoService.salvar(cursoEgresso);
            return new ResponseEntity<>(salvo, HttpStatus.CREATED);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    // GET

    @GetMapping("/buscar/egresso")
    public ResponseEntity<?> buscarEgressoPorNome(@RequestParam String nome) {
        try {
            List<Egresso> egressos = egressoService.buscarEgressoPorNome(nome);
            return new ResponseEntity<>(egressos, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/buscar/egresso/{id}")
    public ResponseEntity<?> buscarEgressoPorId(@PathVariable("id") Integer id) {
        try {
            Egresso egresso = egressoService.buscarEgressoPorId(id);
            return new ResponseEntity<>(egresso, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/egresso/{id}/depoimentos")
    public ResponseEntity<?> buscarDepoimentosPorEgressoId(@PathVariable("id") Integer id) {
        try {
            List<Depoimento> depoimentos = egressoService.buscarDepoimentosPorEgressoId(id);
            return new ResponseEntity<>(depoimentos, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/egresso/{id}/cargos")
    public ResponseEntity<?> buscarCargosPorEgressoId(@PathVariable("id") Integer id) {
        try {
            List<Cargo> cargos = egressoService.buscarCargosPorEgressoId(id);
            return new ResponseEntity<>(cargos, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/egresso/{id}/cursos_egresso")
    public ResponseEntity<?> buscarCursosPorEgressoId(@PathVariable("id") Integer id) {
        try {
            List<CursoEgresso> cursosEgresso = egressoService.buscarCursosPorEgressoId(id);
            return new ResponseEntity<>(cursosEgresso, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/egresso/{id}/cursos")
    public ResponseEntity<?> buscarCursosId(@PathVariable("id") Integer id) {
        try {
            Curso curso = egressoService.buscarCursoPorId(id);
            return new ResponseEntity<>(curso, HttpStatus.OK);
        } catch (RegraNegocioRunTime e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // DELETE
    /*
     * -> DELETE /api/egressos/deletar/egresso
     * -> DELETE /api/egressos/deletar/depoimento
     * -> DELETE /api/egressos/deletar/cargo
     */

    @DeleteMapping("/deletar/egresso/{id}")//OK
    public ResponseEntity<?> removerEgresso(@PathVariable("id") Integer idEgresso){
        try{
            Egresso egresso = Egresso.builder().id_egresso(idEgresso).build();
            egressoService.remover(egresso);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/deletar/depoimento/{id}")//ok
    public ResponseEntity<?> removerDepoimento(@PathVariable("id") Integer idDepoimento){
        try{
            Depoimento depoimento = Depoimento.builder().id_depoimento(idDepoimento).build();
            egressoService.remover(depoimento);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    @DeleteMapping("/deletar/cargo/{id}")//ok
    public ResponseEntity<?> removerCargo(@PathVariable("id") Integer idCargo){
        try{
            Cargo cargo = Cargo.builder().id_cargo(idCargo).build();
            egressoService.remover(cargo);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/deletar/curso_egresso/{id}")//ok
    public ResponseEntity<?> removerCursoEgresso(@PathVariable("id") Integer idCursoEgresso){
        try{
            CursoEgresso cursoEgresso = CursoEgresso.builder().id_curso_egresso(idCursoEgresso).build();
            egressoService.remover(cursoEgresso);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch(RegraNegocioRunTime e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
