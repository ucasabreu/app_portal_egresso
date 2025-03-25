package com.example.portalegresso.backend.controller;

import com.example.portalegresso.backend.dto.*;
import com.example.portalegresso.backend.model.entidades.*;
import com.example.portalegresso.backend.service.EgressoService;
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
public class EgressoControllerTest {

        @InjectMocks
        private EgressoController egressoController;

        @Mock
        private EgressoService egressoService;

        private MockMvc mockMvc;
        private ObjectMapper objectMapper;
        private Egresso egresso;
        private Depoimento depoimento;
        private Cargo cargo;
        private CursoEgresso cursoEgresso;

        @BeforeEach
        public void setup() {
                MockitoAnnotations.openMocks(this);
                egressoController.egressoService = egressoService; // CORREÇÃO: Injeta o mock
                mockMvc = MockMvcBuilders.standaloneSetup(egressoController).build();
                objectMapper = new ObjectMapper();

                egresso = Egresso.builder()
                                .id_egresso(1)
                                .nome("Lucas")
                                .email("lucas@email.com")
                                .build();

                depoimento = Depoimento.builder()
                                .id_depoimento(1)
                                .texto("Depoimento Teste")
                                .egresso(egresso)
                                .build();

                cargo = Cargo.builder()
                                .id_cargo(1)
                                .descricao("Desenvolvedor")
                                .egresso(egresso)
                                .build();

                cursoEgresso = CursoEgresso.builder()
                                .id_curso_egresso(1)
                                .egresso(egresso)
                                .ano_inicio(2018)
                                .ano_fim(2022)
                                .build();
        }

        // Cadastro de Egresso
        @Test
        public void testSalvarEgresso() throws Exception {
                when(egressoService.salvar(any(Egresso.class))).thenReturn(egresso);
                EgressoDTO dto = new EgressoDTO("Lucas", "lucas@email.com", "Descrição", "foto.png", "linkedin",
                                "insta", "curriculo");

                mockMvc.perform(post("/api/egressos/salvar/egresso")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.nome").value("Lucas"));
        }

        // Cadastro de Egresso - Email duplicado
        @Test
        public void testSalvarEgressoFalha() throws Exception {
                // Simula a exceção lançada pela service
                when(egressoService.salvar(any(Egresso.class)))
                                .thenThrow(new RegraNegocioRunTime("O email informado já está em uso por outro egresso."));

                EgressoDTO dto = new EgressoDTO(
                                "Lucas",
                                "lucas@email.com",
                                "Descrição",
                                "foto.png",
                                "https://www.linkedin.com/in/lucas",
                                "https://www.instagram.com/lucas",
                                "curriculo");

                mockMvc.perform(post("/api/egressos/salvar/egresso")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                               // .andDo(print()) // Exibe o resultado no console
                                .andExpect(status().isBadRequest()) // Espera o 400 do GlobalExceptionHandler
                                .andExpect(content().string("O email informado já está em uso por outro egresso.")); // Verifica a mensagem exata da
                                                                                      // exception
        }

        // Cadastro de depoimento
        @Test
        public void testSalvarDepoimento() throws Exception {
                when(egressoService.salvar(any(Depoimento.class))).thenReturn(depoimento);
                DepoimentoDTO dto = new DepoimentoDTO(1, "Depoimento Teste");

                mockMvc.perform(post("/api/egressos/salvar/egresso/1/salvar_depoimento")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.texto").value("Depoimento Teste"));
        }

        // Cadastro de depoimento - Erro
        @Test
        public void testSalvarDepoimentoFalha() throws Exception {
                when(egressoService.salvar(any(Depoimento.class)))
                                .thenThrow(new RegraNegocioRunTime("Erro ao salvar depoimento"));

                DepoimentoDTO dto = new DepoimentoDTO(1, "Depoimento Teste");

                mockMvc.perform(post("/api/egressos/salvar/egresso/1/salvar_depoimento")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isBadRequest())
                                .andExpect(content().string("Erro ao salvar depoimento"));
        }

        // Cadastro de cargo
        @Test
        public void testSalvarCargo() throws Exception {
                when(egressoService.salvar(any(Cargo.class))).thenReturn(cargo);
                CargoDTO dto = new CargoDTO(1, "Desenvolvedor", "Empresa X", 2020, 2023);

                mockMvc.perform(post("/api/egressos/salvar/egresso/1/salvar_cargo")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.descricao").value("Desenvolvedor"));
        }

        // Cadastro de curso egresso
        @Test
        public void testSalvarCursoEgresso() throws Exception {
                when(egressoService.salvar(any(CursoEgresso.class))).thenReturn(cursoEgresso);
                CursoEgressoDTO dto = new CursoEgressoDTO(1, 2, 2018, 2022);

                mockMvc.perform(post("/api/egressos/salvar/egresso/1/curso/2/curso_egresso")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.ano_inicio").value(2018));
        }

        // Buscar Egresso por nome
        @Test
        public void testBuscarEgressoPorNome() throws Exception {
                when(egressoService.buscarEgressoPorNome("Lucas")).thenReturn(List.of(egresso));

                mockMvc.perform(get("/api/egressos/buscar/egresso?nome=Lucas"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)));
        }

        // Buscar Egresso por ID
        @Test
        public void testBuscarEgressoPorId() throws Exception {
                when(egressoService.buscarEgressoPorId(1)).thenReturn(egresso);

                mockMvc.perform(get("/api/egressos/buscar/egresso/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.nome").value("Lucas"));
        }

        // Buscar egresso não encontrado
        @Test
        public void testBuscarEgressoPorIdFalha() throws Exception {
                when(egressoService.buscarEgressoPorId(99))
                                .thenThrow(new RegraNegocioRunTime("Egresso não encontrado"));

                mockMvc.perform(get("/api/egressos/buscar/egresso/99"))
                                .andExpect(status().isBadRequest())
                                .andExpect(content().string("Egresso não encontrado"));
        }

        // Buscar depoimentos por egresso
        @Test
        public void testBuscarDepoimentosPorEgresso() throws Exception {
                when(egressoService.buscarDepoimentosPorEgressoId(1)).thenReturn(List.of(depoimento));

                mockMvc.perform(get("/api/egressos/egresso/1/depoimentos"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)));
        }

        // Deletar Egresso
        @Test
        public void testRemoverEgresso() throws Exception {
                doNothing().when(egressoService).remover(any(Egresso.class));

                mockMvc.perform(delete("/api/egressos/deletar/egresso/1"))
                                .andExpect(status().isNoContent());
        }

        // Deletar Depoimento
        @Test
        public void testRemoverDepoimento() throws Exception {
                doNothing().when(egressoService).remover(any(Depoimento.class));

                mockMvc.perform(delete("/api/egressos/deletar/depoimento/1"))
                                .andExpect(status().isNoContent());
        }

        // Deletar Cargo
        @Test
        public void testRemoverCargo() throws Exception {
                doNothing().when(egressoService).remover(any(Cargo.class));

                mockMvc.perform(delete("/api/egressos/deletar/cargo/1"))
                                .andExpect(status().isNoContent());
        }

        // Deletar CursoEgresso
        @Test
        public void testRemoverCursoEgresso() throws Exception {
                doNothing().when(egressoService).remover(any(CursoEgresso.class));

                mockMvc.perform(delete("/api/egressos/deletar/curso_egresso/1"))
                                .andExpect(status().isNoContent());
        }
}
