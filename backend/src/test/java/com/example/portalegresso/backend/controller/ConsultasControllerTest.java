package com.example.portalegresso.backend.controller;

import com.example.portalegresso.backend.model.entidades.*;
import com.example.portalegresso.backend.service.ConsultasService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
public class ConsultasControllerTest {

    @InjectMocks
    private ConsultasController consultasController;

    @Mock
    private ConsultasService consultasService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private Curso curso;
    private Egresso egresso;
    private Coordenador coordenador;
    private CursoEgresso cursoEgresso;
    private Depoimento depoimento;
    private Cargo cargo;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(consultasController).build();
        objectMapper = new ObjectMapper();

        coordenador = Coordenador.builder().id_coordenador(1).login("maria").build();
        curso = Curso.builder().id_curso(1).nome("Engenharia").nivel("Superior").coordenador(coordenador).build();
        egresso = Egresso.builder().id_egresso(1).nome("Lucas").email("lucas@email.com").build();
        cursoEgresso = new CursoEgresso();
        cursoEgresso.setCurso(curso);
        cursoEgresso.setEgresso(egresso);
        cursoEgresso.setAno_inicio(2010);
        cursoEgresso.setAno_fim(2014);

        depoimento = Depoimento.builder().id_depoimento(1).egresso(egresso).texto("Depoimento teste").build();
        cargo = Cargo.builder().id_cargo(1).descricao("Desenvolvedor").local("Empresa X").ano_inicio(2010).ano_fim(2014).egresso(egresso).build();
    }

    @Test
    void testListarTodosCursos_sucesso() throws Exception {
        when(consultasService.listarTodosCursos()).thenReturn(List.of(curso));

        mockMvc.perform(get("/api/consultas/listar/cursos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Engenharia"));
    }

    @Test
    void testListarTodosCursos_vazio() throws Exception {
        when(consultasService.listarTodosCursos()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/consultas/listar/cursos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Nenhum curso encontrado."));
    }

    @Test
    void testListarDepoimentosRecentes_sucesso() throws Exception {
        when(consultasService.consultarRecentes()).thenReturn(List.of(depoimento));

        mockMvc.perform(get("/api/consultas/listar/depoimentos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].texto").value("Depoimento teste"));
    }

    @Test
    void testListarDepoimentosRecentes_vazio() throws Exception {
        when(consultasService.consultarRecentes()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/consultas/listar/depoimentos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Nenhum depoimento encontrado."));
    }

    @Test
    void testListarCargos_sucesso() throws Exception {
        when(consultasService.listarCargos()).thenReturn(List.of(cargo));

        mockMvc.perform(get("/api/consultas/listar/cargos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descricao").value("Desenvolvedor"));
    }

    @Test
    void testListarEgressosPorCurso_sucesso() throws Exception {
        when(consultasService.consultarEgressosPorCurso("Engenharia")).thenReturn(List.of(egresso));

        mockMvc.perform(get("/api/consultas/listar/egressos/curso?curso=Engenharia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Lucas"));
    }

    @Test
    void testListarCursoEgresso_sucesso() throws Exception {
        when(consultasService.listarCursoEgresso()).thenReturn(List.of(cursoEgresso));

        mockMvc.perform(get("/api/consultas/listar/cursoegresso"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void testListarCursoEgresso_vazio() throws Exception {
        when(consultasService.listarCursoEgresso()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/consultas/listar/cursoegresso"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Nenhum egresso matriculado em curso encontrado."));
    }

    @Test
    void testListarCoordenadores_vazio() throws Exception {
        when(consultasService.listarCoordenadores()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/consultas/listar/coordenadores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Nenhum cordenador encontrado."));
    }

    @Test
    void testListarEgressosPorNome_vazio() throws Exception {
        when(consultasService.consultarEgressosPorNome("Lucas")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/consultas/listar/egressos/nome?nome=Lucas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Nenhum egresso encontrado."));
    }
}
