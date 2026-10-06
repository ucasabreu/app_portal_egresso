package com.example.portalegresso.backend.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.portalegresso.backend.service.ConsultasService;
import com.example.portalegresso.backend.model.repository.*;

class ConsultasEmptyContractTest {
    private MockMvc mvc;
    private CursoRepositorio courses;

    @BeforeEach
    void setup() {
        var service = new ConsultasService();
        courses = mock(CursoRepositorio.class);
        ReflectionTestUtils.setField(service, "cursoRepositorio", courses);
        ReflectionTestUtils.setField(service, "egressoRepositorio", mock(EgressoRepositorio.class));
        ReflectionTestUtils.setField(service, "cargoRepositorio", mock(CargoRepositorio.class));
        ReflectionTestUtils.setField(service, "cursoEgressoRepositorio", mock(CursoEgressoRepositorio.class));
        ReflectionTestUtils.setField(service, "depoimentoRepositorio", mock(DepoimentoRepositorio.class));
        ReflectionTestUtils.setField(service, "coordenadorRepositorio", mock(CoordenadorRepositorio.class));
        var controller = new ConsultasController();
        ReflectionTestUtils.setField(controller, "consultasService", service);
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    static Stream<String> validQueries() {
        return Stream.of("cursos", "cursos/nivel?nivel=Graduação", "depoimentos", "depoimentos/limite?limite=3",
                "depoimentos/ano?ano=2026", "cargos", "egressos", "egressos/nome?nome=Ana",
                "egressos/cargo?cargo=Analista", "egressos/curso?curso=Computação", "egressos/ano_inicio?ano=2020",
                "egressos/ano_fim?ano=2024", "egressos/nomes", "cursoegresso", "coordenadores");
    }

    @ParameterizedTest
    @MethodSource("validQueries")
    void deveRetornar200ComColecaoVaziaParaConsultaValida(String query) throws Exception {
        mvc.perform(get("/api/consultas/listar/" + query)).andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    static Stream<String> invalidQueries() {
        return Stream.of("cursos/nivel", "cursos/nivel?nivel= ", "depoimentos/limite", "depoimentos/limite?limite=0",
                "depoimentos/limite?limite=101", "depoimentos/limite?limite=abc", "depoimentos/ano?ano=0",
                "egressos/nome?nome= ", "egressos/cargo", "egressos/curso", "egressos/ano_inicio", "egressos/ano_fim?ano=-1");
    }

    @ParameterizedTest
    @MethodSource("invalidQueries")
    void deveManter400ParaParametrosInvalidosMesmoComBancoVazio(String query) throws Exception {
        mvc.perform(get("/api/consultas/listar/" + query)).andExpect(status().isBadRequest());
    }

    @Test
    void naoDeveOcultarFalhaDoRepositorioComoListaVazia() {
        when(courses.findAll()).thenThrow(new IllegalStateException("Banco indisponível"));
        org.junit.jupiter.api.Assertions.assertThrows(jakarta.servlet.ServletException.class,
                () -> mvc.perform(get("/api/consultas/listar/cursos")));
    }
}
