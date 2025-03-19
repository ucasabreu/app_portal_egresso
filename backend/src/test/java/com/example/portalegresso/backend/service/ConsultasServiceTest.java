package com.example.portalegresso.backend.service;

import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.portalegresso.backend.model.entidades.Curso;
import com.example.portalegresso.backend.model.entidades.Depoimento;
import com.example.portalegresso.backend.model.entidades.Egresso;
import com.example.portalegresso.backend.model.repository.CargoRepositorio;
import com.example.portalegresso.backend.model.repository.CursoEgressoRepositorio;
import com.example.portalegresso.backend.model.repository.CursoRepositorio;
import com.example.portalegresso.backend.model.repository.DepoimentoRepositorio;
import com.example.portalegresso.backend.model.repository.EgressoRepositorio;



public class ConsultasServiceTest {

    @InjectMocks
    ConsultasService consultasService;

    @Mock
    CursoRepositorio cursoRepositorio;

    @Mock
    DepoimentoRepositorio depoimentoRepositorio;

    @Mock
    EgressoRepositorio egressoRepositorio;

    @Mock
    CursoEgressoRepositorio cursoEgressoRepositorio;

    @Mock
    CargoRepositorio cargoRepositorio;

    /*      Teste de Funcionalidades
    
            -> deveListarCursos
     *      -> deveListarCursosPorFiltros
     *      -> deveConsultarDepoimentosRecentes
     *      -> deveConsultarDepoimentosRecentesPorUmLimite
     *      -> deveConsultarDepoimentosRecentesPorAno
     *      -> deveConsultarEgressosPorNome
     *      -> deveConsultarEgressosPorCargo
     *      -> deveConsultarEgressosPorAno
     * 
     */ 

     public ConsultasServiceTest() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void deveGerarErroAoListarTodosCursosQuandoNaoHouverCursos() {
        when(cursoRepositorio.findAll()).thenReturn(new ArrayList<>());

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.listarTodosCursos(), "Nenhum curso encontrado.");
    }

    @Test
    public void deveGerarErroQuandoNaoHouverCursosCadastrados() {
        when(cursoRepositorio.count()).thenReturn(0L);

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.listarPorFiltros("nivel"), "Não há cursos cadastrados.");
    }


    @Test
    public void deveGerarErroQuandoNivelDoCursoForVazio() {
        when(cursoRepositorio.count()).thenReturn(1L);

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.listarPorFiltros(""), "Nível do curso não pode ser vazio.");
    }

    @Test
    public void deveListarCursosQuandoFiltrosSaoValidos() {
        when(cursoRepositorio.count()).thenReturn(1L);
        List<Curso> cursos = new ArrayList<>();
        cursos.add(new Curso());
        when(cursoRepositorio.filtrarCursosPorNivel("nivel")).thenReturn(cursos);

        List<Curso> resultado = consultasService.listarPorFiltros("nivel");

        Assertions.assertFalse(resultado.isEmpty());
    }


    @Test
    public void deveGerarErroQuandoNaoHouverDepoimentosCadastrados() {
        when(depoimentoRepositorio.count()).thenReturn(0L);

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarRecentes(10), "Não há depoimentos cadastrados.");
    }

    @Test
    public void deveGerarErroQuandoLimiteForInvalido() {
        when(depoimentoRepositorio.count()).thenReturn(1L);

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarRecentes(-1), "Valor limite deve ser válido.");
    }

    @Test
    public void deveRetornarDepoimentosRecentesComLimite() {
        when(depoimentoRepositorio.count()).thenReturn(1L);
        List<Depoimento> depoimentos = new ArrayList<>();
        depoimentos.add(new Depoimento());
        Pageable pageable = PageRequest.of(0, 10);
        when(depoimentoRepositorio.findRecentes(pageable)).thenReturn(depoimentos);

        List<Depoimento> resultado = consultasService.consultarRecentes(10);

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveRetornarDepoimentosRecentesSemLimite() {
        when(depoimentoRepositorio.count()).thenReturn(1L);
        List<Depoimento> depoimentos = new ArrayList<>();
        depoimentos.add(new Depoimento());
        when(depoimentoRepositorio.findAllByOrderByDataDesc()).thenReturn(depoimentos);

        List<Depoimento> resultado = consultasService.consultarRecentes();

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveGerarErroQuandoAnoForInvalido() {
        when(depoimentoRepositorio.count()).thenReturn(1L);

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarPorAno(0), "o ano deve ser maior que zero.");
    }

    @Test
    public void deveRetornarDepoimentosPorAno() {
        when(depoimentoRepositorio.count()).thenReturn(1L);
        List<Depoimento> depoimentos = new ArrayList<>();
        depoimentos.add(new Depoimento());
        when(depoimentoRepositorio.findByAno(2021)).thenReturn(depoimentos);

        List<Depoimento> resultado = consultasService.consultarPorAno(2021);

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveGerarErroQuandoNaoHouverEgressosCadastrados() {
        when(egressoRepositorio.count()).thenReturn(0L);

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarEgressosPorNome("nome"), "Não há egressos cadastrados.");
    }

    @Test
    public void deveGerarErroQuandoNomeDoEgressoForVazio() {
        when(egressoRepositorio.count()).thenReturn(1L);

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarEgressosPorNome(""), "Nome não pode ser vazio.");
    }

    @Test
    public void deveRetornarEgressosPorNome() {
        when(egressoRepositorio.count()).thenReturn(1L);
        List<Egresso> egressos = new ArrayList<>();
        egressos.add(new Egresso());
        when(egressoRepositorio.findByNomeContainingIgnoreCase("nome")).thenReturn(egressos);

        List<Egresso> resultado = consultasService.consultarEgressosPorNome("nome");

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveGerarErroQuandoNaoHouverCargosCadastrados() {
        when(cargoRepositorio.count()).thenReturn(0L);

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarEgressosPorCargo("cargo"), "Não há cargos cadastrados.");
    }

    @Test
    public void deveGerarErroQuandoCargoForVazio() {
        when(cargoRepositorio.count()).thenReturn(1L);
        when(egressoRepositorio.count()).thenReturn(1L);

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarEgressosPorCargo(""), "Cargo não pode ser vazio.");
    }

    @Test
    public void deveRetornarEgressosPorCargo() {
        when(cargoRepositorio.count()).thenReturn(1L);
        when(egressoRepositorio.count()).thenReturn(1L);
        List<Egresso> egressos = new ArrayList<>();
        egressos.add(new Egresso());
        when(cargoRepositorio.findEgressosByCargoDescricao("cargo")).thenReturn(egressos);

        List<Egresso> resultado = consultasService.consultarEgressosPorCargo("cargo");

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveGerarErroQuandoCursoForVazio() {
        when(egressoRepositorio.count()).thenReturn(1L);

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarEgressosPorCurso(""), "Curso não pode ser vazio.");
    }

    @Test
    public void deveRetornarEgressosPorCurso() {
        when(egressoRepositorio.count()).thenReturn(1L);
        List<Egresso> egressos = new ArrayList<>();
        egressos.add(new Egresso());
        when(cursoEgressoRepositorio.findEgressosByCursoNome("curso")).thenReturn(egressos);

        List<Egresso> resultado = consultasService.consultarEgressosPorCurso("curso");

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveGerarErroQuandoAnoForInvalidoParaEgressos() {
        when(egressoRepositorio.count()).thenReturn(1L);

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarEgressosPorAnoInicio(0), "O ano deve ser maior que zero.");
    }

    @Test
    public void deveRetornarEgressosPorAno() {
        when(egressoRepositorio.count()).thenReturn(1L);
        List<Egresso> egressos = new ArrayList<>();
        egressos.add(new Egresso());
        when(cursoEgressoRepositorio.findEgressosByAnoInicio(2021)).thenReturn(egressos);

        List<Egresso> resultado = consultasService.consultarEgressosPorAnoInicio(2021);

        Assertions.assertFalse(resultado.isEmpty());
    }

}
