package com.example.portalegresso.backend.controller;

import com.example.portalegresso.backend.model.entidades.*;
import com.example.portalegresso.backend.service.ConsultasService;
import com.example.portalegresso.backend.service.RegraNegocioRunTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class ConsultasControllerTest {

    @InjectMocks
    private ConsultasController consultasController;

    private ConsultasService consultasService;

    @BeforeEach
    public void setup() {
        consultasService = mock(ConsultasService.class);
        consultasController = new ConsultasController();
        consultasController.consultasService = consultasService;
        MockitoAnnotations.openMocks(this);
    }

    // Exemplo CURSOS
    @Test
    public void testListarTodosCursos_Sucesso() {
        List<Curso> cursos = Arrays.asList(new Curso(), new Curso());
        when(consultasService.listarTodosCursos()).thenReturn(cursos);

        ResponseEntity<?> response = consultasController.listarTodosCursos();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(cursos, response.getBody());
    }

    @Test
    public void testListarTodosCursos_Erro() {
        when(consultasService.listarTodosCursos()).thenThrow(new RegraNegocioRunTime("Erro cursos"));

        ResponseEntity<?> response = consultasController.listarTodosCursos();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erro cursos", response.getBody());
    }

    // Exemplo DEPOIMENTOS
    @Test
    public void testListarDepoimentosRecentes_Sucesso() {
        List<Depoimento> depoimentos = Arrays.asList(new Depoimento(), new Depoimento());
        when(consultasService.consultarRecentes()).thenReturn(depoimentos);

        ResponseEntity<?> response = consultasController.listarDepoimentosRecentes();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(depoimentos, response.getBody());
    }

    @Test
    public void testListarDepoimentosRecentes_Erro() {
        when(consultasService.consultarRecentes()).thenThrow(new RegraNegocioRunTime("Erro depoimentos"));

        ResponseEntity<?> response = consultasController.listarDepoimentosRecentes();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erro depoimentos", response.getBody());
    }

    // Exemplo EGRESSOS
    @Test
    public void testListarEgressos_Sucesso() {
        List<Egresso> egressos = Arrays.asList(new Egresso(), new Egresso());
        when(consultasService.listarEgressos()).thenReturn(egressos);

        ResponseEntity<?> response = consultasController.listarEgressos();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(egressos, response.getBody());
    }

    @Test
    public void testListarEgressos_Erro() {
        when(consultasService.listarEgressos()).thenThrow(new RegraNegocioRunTime("Erro egressos"));

        ResponseEntity<?> response = consultasController.listarEgressos();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erro egressos", response.getBody());
    }

    // Exemplo CARGOS
    @Test
    public void testListarCargos_Sucesso() {
        List<Cargo> cargos = Arrays.asList(new Cargo(), new Cargo());
        when(consultasService.listarCargos()).thenReturn(cargos);

        ResponseEntity<?> response = consultasController.listarCargos();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(cargos, response.getBody());
    }

    @Test
    public void testListarCargos_Erro() {
        when(consultasService.listarCargos()).thenThrow(new RegraNegocioRunTime("Erro cargos"));

        ResponseEntity<?> response = consultasController.listarCargos();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erro cargos", response.getBody());
    }

    // Exemplo COORDENADORES
    @Test
    public void testListarCoordenadores_Sucesso() {
        List<Coordenador> coordenadores = Arrays.asList(new Coordenador(), new Coordenador());
        when(consultasService.listarCoordenadores()).thenReturn(coordenadores);

        ResponseEntity<?> response = consultasController.listarCoordenadores();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(coordenadores, response.getBody());
    }

    @Test
    public void testListarCoordenadores_Erro() {
        when(consultasService.listarCoordenadores()).thenThrow(new RegraNegocioRunTime("Erro coordenadores"));

        ResponseEntity<?> response = consultasController.listarCoordenadores();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erro coordenadores", response.getBody());
    }

    // Exemplo FILTROS por nome de egresso
    @Test
    public void testListarEgressosPorNome_Sucesso() {
        List<Egresso> egressos = Arrays.asList(new Egresso(), new Egresso());
        when(consultasService.consultarEgressosPorNome("Lucas")).thenReturn(egressos);

        ResponseEntity<?> response = consultasController.listarEgressosPorNome("Lucas");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(egressos, response.getBody());
    }

    @Test
    public void testListarEgressosPorNome_Erro() {
        when(consultasService.consultarEgressosPorNome("Lucas"))
                .thenThrow(new RegraNegocioRunTime("Egresso não encontrado"));

        ResponseEntity<?> response = consultasController.listarEgressosPorNome("Lucas");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Egresso não encontrado", response.getBody());
    }


    @Test
    void listarEgressosPorCargo_DeveRetornarListaEgressos() {
        List<Egresso> egressosMock = Arrays.asList(new Egresso(), new Egresso());
        when(consultasService.consultarEgressosPorCargo("Engenheiro")).thenReturn(egressosMock);

        ResponseEntity<?> response = consultasController.listarEgressosPorCargo("Engenheiro");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(egressosMock, response.getBody());
    }

    @Test
    void listarEgressosPorCargo_DeveRetornarErro() {
        when(consultasService.consultarEgressosPorCargo("Engenheiro")).thenThrow(new RegraNegocioRunTime("Erro ao buscar por cargo"));

        ResponseEntity<?> response = consultasController.listarEgressosPorCargo("Engenheiro");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void listarEgressosPorCurso_DeveRetornarListaEgressos() {
        List<Egresso> egressosMock = Arrays.asList(new Egresso(), new Egresso());
        when(consultasService.consultarEgressosPorCurso("Sistemas")).thenReturn(egressosMock);

        ResponseEntity<?> response = consultasController.listarEgressosPorCurso("Sistemas");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(egressosMock, response.getBody());
    }

    @Test
    void listarEgressosPorCurso_DeveRetornarErro() {
        when(consultasService.consultarEgressosPorCurso("Sistemas")).thenThrow(new RegraNegocioRunTime("Erro ao buscar por curso"));

        ResponseEntity<?> response = consultasController.listarEgressosPorCurso("Sistemas");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void listarEgressosPorAnoInicioCurso_DeveRetornarListaEgressos() {
        List<Egresso> egressosMock = Arrays.asList(new Egresso(), new Egresso());
        when(consultasService.consultarEgressosPorAnoInicio(2020)).thenReturn(egressosMock);

        ResponseEntity<?> response = consultasController.listarEgressosPorAnoInicioCurso(2020);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(egressosMock, response.getBody());
    }

    @Test
    void listarEgressosPorAnoInicioCurso_DeveRetornarErro() {
        when(consultasService.consultarEgressosPorAnoInicio(2020)).thenThrow(new RegraNegocioRunTime("Erro ao buscar por ano início"));

        ResponseEntity<?> response = consultasController.listarEgressosPorAnoInicioCurso(2020);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void listarEgressosPorAnoFimCurso_DeveRetornarListaEgressos() {
        List<Egresso> egressosMock = Arrays.asList(new Egresso(), new Egresso());
        when(consultasService.consultarEgressosPorAnoFim(2022)).thenReturn(egressosMock);

        ResponseEntity<?> response = consultasController.listarEgressosPorAnoFimCurso(2022);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(egressosMock, response.getBody());
    }

    @Test
    void listarEgressosPorAnoFimCurso_DeveRetornarErro() {
        when(consultasService.consultarEgressosPorAnoFim(2022)).thenThrow(new RegraNegocioRunTime("Erro ao buscar por ano fim"));

        ResponseEntity<?> response = consultasController.listarEgressosPorAnoFimCurso(2022);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void listarDepoimentosPorAno_DeveRetornarListaDepoimentos() {
        List<Depoimento> depoimentosMock = Arrays.asList(new Depoimento(), new Depoimento());
        when(consultasService.consultarPorAno(2023)).thenReturn(depoimentosMock);

        ResponseEntity<?> response = consultasController.listarDepoimentosPorAno(2023);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(depoimentosMock, response.getBody());
    }

    @Test
    void listarDepoimentosPorAno_DeveRetornarErro() {
        when(consultasService.consultarPorAno(2023)).thenThrow(new RegraNegocioRunTime("Erro ao buscar depoimentos por ano"));

        ResponseEntity<?> response = consultasController.listarDepoimentosPorAno(2023);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
