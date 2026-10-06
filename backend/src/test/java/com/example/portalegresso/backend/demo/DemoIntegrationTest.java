package com.example.portalegresso.backend.demo;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.example.portalegresso.backend.model.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:portal_demo_test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@ActiveProfiles("demo")
@AutoConfigureMockMvc
@Transactional
class DemoIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired DemoDataInitializer initializer;
    @Autowired CoordenadorRepositorio coordenadores;
    @Autowired CursoRepositorio cursos;
    @Autowired EgressoRepositorio egressos;
    @Autowired CursoEgressoRepositorio vinculos;
    @Autowired CargoRepositorio cargos;
    @Autowired DepoimentoRepositorio depoimentos;
    @Autowired DestaqueEgressoRepositorio destaques;

    @Autowired org.springframework.web.context.WebApplicationContext context;
    @org.junit.jupiter.api.BeforeEach
    void autenticarAdministradorParaOperacoesDeGestao() throws Exception {
        var session = new org.springframework.mock.web.MockHttpSession();
        String token = json.readTree(mvc.perform(get("/api/auth/csrf").session(session)).andReturn().getResponse().getContentAsString()).get("token").asText();
        mvc.perform(post("/api/auth/login").session(session).header("X-CSRF-TOKEN", token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"login\":\"admin.demo\",\"senha\":\"demo123\"}")).andExpect(status().isOk());
        token = json.readTree(mvc.perform(get("/api/auth/csrf").session(session)).andReturn().getResponse().getContentAsString()).get("token").asText();
        mvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup(context)
                .defaultRequest(get("/").session(session).header("X-CSRF-TOKEN", token)).build();
    }

    @Test
    void deveCarregarDadosFicticiosRelacionados() {
        assertEquals(2, coordenadores.count());
        assertEquals(3, cursos.count());
        assertEquals(4, egressos.count());
        assertEquals(4, vinculos.count());
        assertEquals(4, cargos.count());
        assertEquals(4, depoimentos.count());
        assertEquals(4, destaques.count());
        assertTrue(cursos.findAll().stream().allMatch(c -> c.getCoordenador().getLogin().equals("coord.demo")));
        assertTrue(egressos.findAll().stream().allMatch(e -> e.getEmail().endsWith("@example.com")));
        assertTrue(depoimentos.findAll().stream().allMatch(d -> d.getData() != null));
    }

    @Test
    void devePreservarEdicoesAoReexecutarInicializador() {
        var egresso = egressos.findAll().get(0);
        egresso.setNome("Nome editado durante a apresentação");
        egressos.saveAndFlush(egresso);
        initializer.run(new DefaultApplicationArguments());
        assertEquals(4, egressos.count());
        assertEquals(2, coordenadores.count());
        assertEquals("Nome editado durante a apresentação", egressos.findById(egresso.getId_egresso()).orElseThrow().getNome());
    }

    @Test
    void deveAutenticarAmbasContasSemRetornarSenha() throws Exception {
        for (var conta : Map.of("admin.demo", "geral", "coord.demo", "coordenador").entrySet()) {
            var session = new org.springframework.mock.web.MockHttpSession();
            String token = json.readTree(mvc.perform(get("/api/auth/csrf").session(session)).andReturn().getResponse().getContentAsString()).get("token").asText();
            mvc.perform(post("/api/auth/login").session(session).header("X-CSRF-TOKEN", token)
                    .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("login", conta.getKey(), "senha", "demo123"))))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.role").value(conta.getValue()))
                    .andExpect(jsonPath("$.senha").doesNotExist());
        }
    }

    @Test
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    void deveResponderSaudeConsultasEFiltros() throws Exception {
        mvc.perform(get("/api/demo/health")).andExpect(status().isOk()).andExpect(jsonPath("$.mode").value("demo"));
        for (String recurso : new String[]{"cursos", "egressos", "depoimentos", "cargos", "coordenadores"}) {
            mvc.perform(get("/api/consultas/listar/" + recurso))
                    .andExpect(status().isOk()).andExpect(jsonPath("$[0]").exists());
        }
        mvc.perform(get("/api/coordenadores/destaque/listar"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].titulo").isNotEmpty());
        Integer id = egressos.findAll().get(0).getId_egresso();
        mvc.perform(get("/api/egressos/egresso/{id}/cursos_egresso", id))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].curso.nome").isNotEmpty());
        mvc.perform(get("/api/consultas/listar/egressos/nome").param("nome", "Ana"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].nome").value("Ana Martins"));
    }

    @Test
    void deveCadastrarEditarEExcluirEgressoComDependentes() throws Exception {
        Map<String, Object> perfil = new java.util.HashMap<>(Map.of(
                "nome", "Pessoa Teste", "email", "crud@example.com", "descricao", "Perfil de teste",
                "foto", "/demo/avatar.svg", "linkedin", "", "instagram", "", "curriculo", "/demo/curriculo.html"));
        JsonNode criado = json.readTree(mvc.perform(post("/api/egressos/salvar/egresso")
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(perfil)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        int id = criado.get("id_egresso").asInt();
        int curso = cursos.findAll().get(0).getId_curso();
        mvc.perform(post("/api/egressos/salvar/egresso/{id}/salvar_depoimento", id)
                .contentType(MediaType.APPLICATION_JSON).content("{\"texto\":\"Depoimento de teste\"}"))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/egressos/salvar/egresso/{id}/salvar_cargo", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"descricao\":\"Desenvolvimento\",\"local\":\"Empresa Teste\",\"ano_inicio\":2023,\"ano_fim\":2024}"))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/egressos/salvar/egresso/{id}/curso/{curso}/curso_egresso", id, curso)
                .contentType(MediaType.APPLICATION_JSON).content("{\"ano_inicio\":2018,\"ano_fim\":2022}"))
                .andExpect(status().isCreated());
        int coordenador = coordenadores.findAll().get(0).getId_coordenador();
        mvc.perform(post("/api/coordenadores/{coordenador}/egresso/{egresso}/destaque", coordenador, id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"titulo\":\"Conquista Teste\",\"noticia\":\"Notícia temporária\",\"feitoDestaque\":\"Projeto exemplo\"}"))
                .andExpect(status().isCreated());
        assertEquals(5, destaques.count());
        perfil.put("nome", "Pessoa Atualizada");
        perfil.put("foto", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=");
        mvc.perform(put("/api/egressos/atualizar/egresso/{id}", id)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(perfil)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nome").value("Pessoa Atualizada"));
        mvc.perform(get("/api/egressos/buscar/egresso/{id}", id))
                .andExpect(status().isOk()).andExpect(jsonPath("$.email").value("crud@example.com"));
        perfil.put("email", "ana@example.com");
        mvc.perform(put("/api/egressos/atualizar/egresso/{id}", id)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(perfil)))
                .andExpect(status().isBadRequest());
        mvc.perform(delete("/api/egressos/deletar/egresso/{id}", id)).andExpect(status().isNoContent());
        assertEquals(4, egressos.count());
        assertEquals(4, cargos.count());
        assertEquals(4, depoimentos.count());
        assertEquals(4, destaques.count());
        assertEquals(4, vinculos.count());
        mvc.perform(get("/api/egressos/buscar/egresso/{id}", id)).andExpect(status().isBadRequest());
    }
    @Test
    void deveRejeitarImagensInvalidasAntesDeGravarPerfilOuDestaque() throws Exception {
        var profile = Map.of("nome", "Pessoa Teste", "email", "image-test@example.com", "foto", "data:image/svg+xml;base64,PHN2Zz4=");
        mvc.perform(post("/api/egressos/salvar/egresso").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(profile))).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.foto").exists());
        var coordinator = coordenadores.findAll().get(0).getId_coordenador();
        var graduate = egressos.findAll().get(0).getId_egresso();
        mvc.perform(post("/api/coordenadores/{coordinator}/egresso/{graduate}/destaque", coordinator, graduate)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("titulo", "Conquista", "noticia", "Notícia",
                        "feitoDestaque", "Projeto", "imagem", "javascript:alert(1)"))))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.imagem").exists());
        assertEquals(4, egressos.count());
        assertEquals(4, destaques.count());
    }

    @Test
    void deveDesvincularFormacaoSemExcluirPerfilOuSeusOutrosRegistros() throws Exception {
        var association = vinculos.findAll().get(0);
        int graduate = association.getEgresso().getId_egresso();
        mvc.perform(delete("/api/egressos/deletar/curso_egresso/{id}", association.getId_curso_egresso()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/egressos/buscar/egresso/{id}", graduate)).andExpect(status().isOk());
        assertEquals(3, vinculos.count());
        assertEquals(4, egressos.count());
        assertEquals(4, cargos.count());
        assertEquals(4, depoimentos.count());
        assertEquals(4, destaques.count());
    }

    @Test
    void deveImpedirExclusaoDeCursoComFormacoesEPreservarConta() throws Exception {
        var course = vinculos.findAll().get(0).getCurso();
        mvc.perform(delete("/api/coordenadores/deletar/curso/{id}", course.getId_curso()))
                .andExpect(status().isBadRequest());
        assertEquals(3, cursos.count());
        assertEquals(2, coordenadores.count());
        assertEquals(4, vinculos.count());
    }

}
