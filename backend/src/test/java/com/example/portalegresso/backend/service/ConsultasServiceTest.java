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
    public void deveRetornarListaVaziaQuandoNaoHouverCursos() {
        when(cursoRepositorio.findAll()).thenReturn(new ArrayList<>());

        Assertions.assertTrue(consultasService.listarTodosCursos().isEmpty(), "Nenhum curso encontrado.");
    }

    @Test
    public void deveRetornarListaVaziaQuandoNivelNaoEncontrarCursos() {

        Assertions.assertTrue(consultasService.listarPorFiltros("nivel").isEmpty(), "Não há cursos cadastrados.");
    }


    @Test
    public void deveGerarErroQuandoNivelDoCursoForVazio() {

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.listarPorFiltros(""), "Nível do curso não pode ser vazio.");
    }

    @Test
    public void deveListarCursosQuandoFiltrosSaoValidos() {
        List<Curso> cursos = new ArrayList<>();
        cursos.add(new Curso());
        when(cursoRepositorio.filtrarCursosPorNivel("nivel")).thenReturn(cursos);

        List<Curso> resultado = consultasService.listarPorFiltros("nivel");

        Assertions.assertFalse(resultado.isEmpty());
    }


    @Test
    public void deveRetornarListaVaziaQuandoNaoHouverDepoimentos() {

        Assertions.assertTrue(consultasService.consultarRecentes(10).isEmpty(), "Não há depoimentos cadastrados.");
    }

    @Test
    public void deveGerarErroQuandoLimiteForInvalido() {

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarRecentes(-1), "Valor limite deve ser válido.");
    }

    @Test
    public void deveRetornarDepoimentosRecentesComLimite() {
        List<Depoimento> depoimentos = new ArrayList<>();
        depoimentos.add(new Depoimento());
        Pageable pageable = PageRequest.of(0, 10);
        when(depoimentoRepositorio.findRecentes(pageable)).thenReturn(depoimentos);

        List<Depoimento> resultado = consultasService.consultarRecentes(10);

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveRetornarDepoimentosRecentesSemLimite() {
        List<Depoimento> depoimentos = new ArrayList<>();
        depoimentos.add(new Depoimento());
        when(depoimentoRepositorio.findAllByOrderByDataDesc()).thenReturn(depoimentos);

        List<Depoimento> resultado = consultasService.consultarRecentes();

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveGerarErroQuandoAnoForInvalido() {

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarPorAno(0), "o ano deve ser maior que zero.");
    }

    @Test
    public void deveRetornarDepoimentosPorAno() {
        List<Depoimento> depoimentos = new ArrayList<>();
        depoimentos.add(new Depoimento());
        when(depoimentoRepositorio.findByAno(2021)).thenReturn(depoimentos);

        List<Depoimento> resultado = consultasService.consultarPorAno(2021);

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveRetornarListaVaziaQuandoNomeNaoEncontrarEgressos() {

        Assertions.assertTrue(consultasService.consultarEgressosPorNome("nome").isEmpty(), "Não há egressos cadastrados.");
    }

    @Test
    public void deveGerarErroQuandoNomeDoEgressoForVazio() {

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarEgressosPorNome(""), "Nome não pode ser vazio.");
    }

    @Test
    public void deveRetornarEgressosPorNome() {
        List<Egresso> egressos = new ArrayList<>();
        egressos.add(new Egresso());
        when(egressoRepositorio.findByNomeContainingIgnoreCase("nome")).thenReturn(egressos);

        List<Egresso> resultado = consultasService.consultarEgressosPorNome("nome");

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveRetornarListaVaziaQuandoCargoNaoEncontrarEgressos() {

        Assertions.assertTrue(consultasService.consultarEgressosPorCargo("cargo").isEmpty(), "Não há cargos cadastrados.");
    }

    @Test
    public void deveGerarErroQuandoCargoForVazio() {

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarEgressosPorCargo(""), "Cargo não pode ser vazio.");
    }

    @Test
    public void deveRetornarEgressosPorCargo() {
        List<Egresso> egressos = new ArrayList<>();
        egressos.add(new Egresso());
        when(cargoRepositorio.findEgressosByCargoDescricao("cargo")).thenReturn(egressos);

        List<Egresso> resultado = consultasService.consultarEgressosPorCargo("cargo");

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveGerarErroQuandoCursoForVazio() {

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarEgressosPorCurso(""), "Curso não pode ser vazio.");
    }

    @Test
    public void deveRetornarEgressosPorCurso() {
        List<Egresso> egressos = new ArrayList<>();
        egressos.add(new Egresso());
        when(cursoEgressoRepositorio.findEgressosByCursoNome("curso")).thenReturn(egressos);

        List<Egresso> resultado = consultasService.consultarEgressosPorCurso("curso");

        Assertions.assertFalse(resultado.isEmpty());
    }

    @Test
    public void deveGerarErroQuandoAnoForInvalidoParaEgressos() {

        Assertions.assertThrows(RegraNegocioRunTime.class, () -> consultasService.consultarEgressosPorAnoInicio(0), "O ano deve ser maior que zero.");
    }

    @Test
    public void deveRetornarEgressosPorAno() {
        List<Egresso> egressos = new ArrayList<>();
        egressos.add(new Egresso());
        when(cursoEgressoRepositorio.findEgressosByAnoInicio(2021)).thenReturn(egressos);

        List<Egresso> resultado = consultasService.consultarEgressosPorAnoInicio(2021);

        Assertions.assertFalse(resultado.isEmpty());
    }

}
