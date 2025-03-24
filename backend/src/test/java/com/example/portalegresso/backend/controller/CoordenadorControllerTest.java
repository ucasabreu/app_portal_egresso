package com.example.portalegresso.backend.controller;

import com.example.portalegresso.backend.dto.CoordenadorDTO;
import com.example.portalegresso.backend.dto.CursoDTO;
import com.example.portalegresso.backend.dto.DestaqueEgressoDTO;
import com.example.portalegresso.backend.model.entidades.*;
import com.example.portalegresso.backend.service.CoordenadorService;
import com.example.portalegresso.backend.service.RegraNegocioRunTime;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
public class CoordenadorControllerTest {

    @Mock
    private CoordenadorService coordenadorService;

    @InjectMocks
    private CoordenadorController coordenadorController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private Coordenador coordenador;
    private Curso curso;
    private DestaqueEgresso destaque;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(coordenadorController).build();
        objectMapper = new ObjectMapper();

        coordenador = Coordenador.builder()
                .id_coordenador(1)
                .login("admin")
                .senha("1234")
                .tipo("coordenador")
                .build();

        curso = Curso.builder()
                .id_curso(1)
                .nome("Engenharia")
                .nivel("Superior")
                .coordenador(coordenador)
                .build();

        destaque = DestaqueEgresso.builder()
                .id(1L)
                .titulo("Destaque Teste")
                .noticia("Notícia Teste")
                .feitoDestaque("Feito Teste")
                .egresso(Egresso.builder().id_egresso(1).nome("Lucas").build())
                .coordenador(coordenador)
                .build();
    }

    // Sucesso - Salvar coordenador
    @Test
    public void testSalvarCoordenador() throws Exception {
        when(coordenadorService.salvar(any(Coordenador.class))).thenReturn(coordenador);

        CoordenadorDTO dto = new CoordenadorDTO("admin", "1234", "coordenador");

        mockMvc.perform(post("/api/coordenadores/salvar/coordenador")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.login").value("admin"));
    }

    // Falha - Login existente
    @Test
    public void testSalvarCoordenadorFalha() throws Exception {
        when(coordenadorService.salvar(any(Coordenador.class))).thenThrow(new RegraNegocioRunTime("Login já existe"));

        CoordenadorDTO dto = new CoordenadorDTO("admin", "1234", "coordenador");

        mockMvc.perform(post("/api/coordenadores/salvar/coordenador")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Login já existe"));
    }

    // Sucesso - Autenticação
    @Test
    public void testAutenticarCoordenador() throws Exception {
        when(coordenadorService.efetuarLogin("admin", "1234")).thenReturn(true);
    
        CoordenadorDTO dto = new CoordenadorDTO("admin", "1234", "coordenador");
    
        mockMvc.perform(post("/api/coordenadores/autenticar/coordenador")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    // Falha - Autenticação inválida
    @Test
    public void testAutenticarCoordenadorFalha() throws Exception {
        doThrow(new RegraNegocioRunTime("Login ou senha inválidos"))
                .when(coordenadorService).efetuarLogin("admin", "wrong");

        CoordenadorDTO dto = new CoordenadorDTO("admin", "wrong", "coordenador");

        mockMvc.perform(post("/api/coordenadores/autenticar/coordenador")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Login ou senha inválidos"));
    }

    // Sucesso - Salvar curso
    @Test
    public void testSalvarCurso() throws Exception {
        when(coordenadorService.salvar(any(Curso.class))).thenReturn(curso);
        CursoDTO cursoDTO = new CursoDTO("Engenharia", "Superior", 1);

        mockMvc.perform(post("/api/coordenadores/salvar/curso")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cursoDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Engenharia"));
    }

    // Sucesso - Salvar destaque
    @Test
    public void testSalvarDestaque() throws Exception {
        when(coordenadorService.salvarDestaque(any())).thenReturn(destaque);

        DestaqueEgressoDTO dto = new DestaqueEgressoDTO(
                1L, 1, 1, "Destaque Teste", "Notícia Teste", null, "Feito Teste"
        );

        mockMvc.perform(post("/api/coordenadores/1/egresso/1/destaque")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Destaque Teste"));
    }

    // Falha - salvar destaque com erro
    @Test
    public void testSalvarDestaqueFalha() throws Exception {
        when(coordenadorService.salvarDestaque(any())).thenThrow(new RegraNegocioRunTime("Egresso não encontrado"));

        DestaqueEgressoDTO dto = new DestaqueEgressoDTO(1L, 99, 1, "Falha", "Erro", null, "Feito Falha");

        mockMvc.perform(post("/api/coordenadores/1/egresso/99/destaque")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Egresso não encontrado"));
    }

    // Buscar coordenador
    @Test
    public void testBuscarCoordenador() throws Exception {
        when(coordenadorService.buscarCoordenadorPorId(1)).thenReturn(coordenador);

        mockMvc.perform(get("/api/coordenadores/buscar/coordenador/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login").value("admin"));
    }

    // Falha buscar coordenador inexistente
    @Test
    public void testBuscarCoordenadorFalha() throws Exception {
        when(coordenadorService.buscarCoordenadorPorId(99))
                .thenThrow(new RegraNegocioRunTime("Coordenador não encontrado"));

        mockMvc.perform(get("/api/coordenadores/buscar/coordenador/99"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Coordenador não encontrado"));
    }

    // Buscar destaque por ID
    @Test
    public void testBuscarDestaque() throws Exception {
        when(coordenadorService.buscarDestaquePorId(1L)).thenReturn(destaque);

        mockMvc.perform(get("/api/coordenadores/buscar/destaque/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Destaque Teste"));
    }

    // Listar destaques geral
    @Test
    public void testListarDestaques() throws Exception {
        when(coordenadorService.listarDestaques()).thenReturn(List.of(destaque));

        mockMvc.perform(get("/api/coordenadores/destaque/listar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    // Listar destaques filtrados
    @Test
    public void testListarDestaquesComFiltro() throws Exception {
        when(coordenadorService.buscarDestaquesPorNomeOuCurso("Engenharia")).thenReturn(List.of(destaque));

        mockMvc.perform(get("/api/coordenadores/destaque/listar?nome=Engenharia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    // Listar por egresso
    @Test
    public void testListarDestaquesPorEgresso() throws Exception {
        when(coordenadorService.buscarDestaquesPorEgresso(1)).thenReturn(List.of(destaque));

        mockMvc.perform(get("/api/coordenadores/destaque/egresso/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    // Remoção coordenador
    @Test
    public void testRemoverCoordenador() throws Exception {
        doNothing().when(coordenadorService).remover(any(Coordenador.class));

        mockMvc.perform(delete("/api/coordenadores/deletar/coordenador/1"))
                .andExpect(status().isNoContent());
    }

    // Remoção curso
    @Test
    public void testRemoverCurso() throws Exception {
        doNothing().when(coordenadorService).remover(any(Curso.class));

        mockMvc.perform(delete("/api/coordenadores/deletar/curso/1"))
                .andExpect(status().isNoContent());
    }

    // Remoção destaque
    @Test
    public void testRemoverDestaque() throws Exception {
        doNothing().when(coordenadorService).remover(any(DestaqueEgresso.class));

        mockMvc.perform(delete("/api/coordenadores/deletar/destaque/1"))
                .andExpect(status().isNoContent());
    }
}
