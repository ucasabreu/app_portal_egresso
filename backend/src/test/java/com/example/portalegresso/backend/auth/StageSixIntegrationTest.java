package com.example.portalegresso.backend.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.example.portalegresso.backend.model.entidades.*;
import com.example.portalegresso.backend.model.repository.*;
import com.fasterxml.jackson.databind.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:portal_security;MODE=PostgreSQL;DB_CLOSE_DELAY=-1", "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop"})
@ActiveProfiles("demo")
@AutoConfigureMockMvc
@Transactional
class StageSixIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired EgressoRepositorio egressos;
    @Autowired CoordenadorRepositorio coordenadores;
    @Autowired CursoRepositorio cursos;
    @Autowired CursoEgressoRepositorio formacoes;
    @Autowired DestaqueEgressoRepositorio destaques;
    @Autowired RascunhoDestaqueRepositorio rascunhos;
    @Autowired PasswordHasher passwords;
    @Autowired CargoRepositorio cargos;
    @Autowired DepoimentoRepositorio depoimentos;
    @Autowired PasswordMigration migration;
    @Autowired jakarta.persistence.EntityManager persistence;
    record Account(MockHttpSession session, String token) {}

    Account anonymous() throws Exception {
        var session = new MockHttpSession();
        String token = json.readTree(mvc.perform(get("/api/auth/csrf").session(session)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("token").asText();
        return new Account(session, token);
    }
    Account login(String identifier) throws Exception {
        Account before = anonymous(); String priorId = before.session.getId();
        mvc.perform(post("/api/auth/login").session(before.session).header("X-CSRF-TOKEN", before.token)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("login", identifier, "senha", "demo123"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.senha").doesNotExist());
        assertNotEquals(priorId, before.session.getId());
        String token = json.readTree(mvc.perform(get("/api/auth/csrf").session(before.session)).andReturn().getResponse().getContentAsString()).get("token").asText();
        assertNotEquals(before.token, token);
        return new Account(before.session, token);
    }
    String body(Object values) throws Exception { return json.writeValueAsString(values); }
    Egresso ana() { return egressos.findByEmail("ana@example.com").orElseThrow(); }
    Coordenador coord() { return coordenadores.findByLogin("coord.demo").orElseThrow(); }

    @Test void sessionsRotatePersistAndLogoutRevokesAccess() throws Exception {
        var account = login("coord.demo");
        mvc.perform(get("/api/auth/me").session(account.session)).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("coordenador"));
        mvc.perform(post("/api/auth/logout").session(account.session).header("X-CSRF-TOKEN", account.token)).andExpect(status().isNoContent());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/gestao/painel")).andExpect(status().isUnauthorized());
    }

    @Test void protectsLoginAndEveryMutationAgainstMissingCsrfAndAnonymousAccess() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body(Map.of("login", "admin.demo", "senha", "demo123"))))
                .andExpect(status().isForbidden());
        var anon = anonymous();
        mvc.perform(delete("/api/egressos/deletar/egresso/{id}", ana().getId_egresso()).session(anon.session).header("X-CSRF-TOKEN", anon.token)).andExpect(status().isUnauthorized());
        var admin = login("admin.demo");
        mvc.perform(delete("/api/egressos/deletar/egresso/{id}", ana().getId_egresso()).session(admin.session)).andExpect(status().isForbidden());
        assertEquals(4, egressos.count());
    }

    @Test void legacyCredentialRoutesAreRetiredAndPublicEndpointsNeverExposeHashes() throws Exception {
        mvc.perform(get("/api/coordenadores/buscar/coordenador").param("login", "admin.demo").param("senha", "demo123")).andExpect(status().isGone());
        mvc.perform(get("/api/consultas/listar/egressos")).andExpect(status().isOk()).andExpect(jsonPath("$[0].senha").doesNotExist());
        var admin = login("admin.demo");
        mvc.perform(get("/api/consultas/listar/coordenadores").session(admin.session)).andExpect(status().isOk()).andExpect(jsonPath("$[0].senha").doesNotExist());
        assertTrue(coordenadores.findAll().stream().allMatch(c -> passwords.isEncoded(c.getSenha())));
        assertTrue(egressos.findAll().stream().allMatch(e -> passwords.isEncoded(e.getSenha())));
    }

    @Test void graduateCanEditOwnProfileWithoutLosingPasswordButCannotEditAnother() throws Exception {
        var account = login("ana@example.com");
        var person = ana(); String hash = person.getSenha();
        var values = Map.of("nome", "Ana Atualizada", "email", "ana@example.com", "descricao", "Apresentação atualizada");
        mvc.perform(put("/api/egressos/atualizar/egresso/{id}", person.getId_egresso()).session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON).content(body(values)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.senha").doesNotExist());
        assertEquals(hash, egressos.findById(person.getId_egresso()).orElseThrow().getSenha());
        mvc.perform(put("/api/egressos/atualizar/egresso/{id}", egressos.findByEmail("bruno@example.com").orElseThrow().getId_egresso()).session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON).content(body(values))).andExpect(status().isForbidden());
        mvc.perform(post("/api/coordenadores/salvar/coordenador").session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON).content(body(Map.of("login", "invasor", "senha", "senhaSegura", "tipo", "geral")))).andExpect(status().isForbidden());
    }

    @Test void publicRegistrationCreatesOnlyGraduateAccountAndStartsSession() throws Exception {
        var account = anonymous();
        mvc.perform(post("/api/auth/register").session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON)
                .content(body(Map.of("nome", "Pessoa Nova", "email", "nova@example.com", "senha", "senhaSegura123", "role", "geral", "tipo", "geral"))))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.role").value("egresso")).andExpect(jsonPath("$.senha").doesNotExist());
        assertTrue(passwords.matches("senhaSegura123", egressos.findByEmail("nova@example.com").orElseThrow().getSenha()));
        assertEquals(2, coordenadores.count());
        mvc.perform(get("/api/auth/me").session(account.session)).andExpect(status().isOk()).andExpect(jsonPath("$.login").value("nova@example.com"));
    }

    @Test void coordinatorCannotManageOtherAccountsOrCourses() throws Exception {
        var account = login("coord.demo");
        mvc.perform(post("/api/coordenadores/salvar/curso").session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON)
                .content(body(Map.of("nome", "Curso Indevido", "nivel", "Graduação", "id_coordenador", coord().getId_coordenador())))).andExpect(status().isForbidden());
        mvc.perform(get("/api/coordenadores/buscar/coordenador/{id}", coordenadores.findByLogin("admin.demo").orElseThrow().getId_coordenador()).session(account.session)).andExpect(status().isForbidden());
        mvc.perform(get("/api/consultas/listar/coordenadores").session(account.session)).andExpect(status().isForbidden());
    }

    @Test void courseEditingPreservesFormationsAndMovesResponsibility() throws Exception {
        var admin = login("admin.demo");
        var course = cursos.findAll().get(0); var responsible = coordenadores.findByLogin("admin.demo").orElseThrow();
        mvc.perform(put("/api/coordenadores/atualizar/curso/{id}", course.getId_curso()).session(admin.session).header("X-CSRF-TOKEN", admin.token).contentType(MediaType.APPLICATION_JSON)
                .content(body(Map.of("nome", "Computação Aplicada", "nivel", "Graduação", "id_coordenador", responsible.getId_coordenador())))).andExpect(status().isOk()).andExpect(jsonPath("$.coordenador.login").value("admin.demo"));
        assertEquals(4, formacoes.count());
        mvc.perform(put("/api/coordenadores/atualizar/curso/{id}", course.getId_curso()).session(admin.session).header("X-CSRF-TOKEN", admin.token).contentType(MediaType.APPLICATION_JSON)
                .content(body(Map.of("nome", "Computação Aplicada", "nivel", "Graduação", "id_coordenador", -1)))).andExpect(status().isBadRequest());
    }

    @Test void highlightEditingPreservesDateAuthorAndOwnerAndMissingArticleReturns404() throws Exception {
        var account = login("coord.demo"); var story = destaques.findAll().get(0); var date = story.getDataPublicacao(); var graduate = story.getEgresso().getId_egresso();
        mvc.perform(put("/api/coordenadores/atualizar/destaque/{id}", story.getId()).session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON)
                .content(body(Map.of("titulo", "Conquista Atualizada", "noticia", "Novo conteúdo", "feitoDestaque", "Nova conquista", "id_egresso", -1, "id_coordenador", -1))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.titulo").value("Conquista Atualizada"));
        assertEquals(date, destaques.findById(story.getId()).orElseThrow().getDataPublicacao());
        assertEquals(graduate, destaques.findById(story.getId()).orElseThrow().getEgresso().getId_egresso());
        mvc.perform(get("/api/coordenadores/buscar/destaque/999999")).andExpect(status().isNotFound());
    }

    @Test void draftsStayPrivateDetectConflictsAndPublishAtomically() throws Exception {
        var account = login("coord.demo");
        String path = "/api/gestao/rascunhos";
        JsonNode created = json.readTree(mvc.perform(post(path).session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON)
                .content(body(Map.of("id_egresso", ana().getId_egresso(), "titulo", "Título incompleto")))).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        long id = created.get("id").asLong(), version = created.get("versao").asLong();
        assertEquals(4, destaques.count());
        mvc.perform(get(path)).andExpect(status().isUnauthorized());
        var other = login("admin.demo");
        mvc.perform(get(path + "/" + id).session(other.session)).andExpect(status().isForbidden());
        mvc.perform(post(path + "/" + id + "/publicar").session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON).content(body(Map.of("versao", version))))
                .andExpect(status().isBadRequest());
        assertEquals(1, rascunhos.count()); assertEquals(4, destaques.count());
        var values = Map.of("id_egresso", ana().getId_egresso(), "titulo", "Conquista Publicada", "noticia", "Notícia completa", "feitoDestaque", "Projeto apresentado", "versao", version);
        JsonNode updated = json.readTree(mvc.perform(put(path + "/" + id).session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON).content(body(values)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        assertTrue(updated.get("versao").asLong() > version);
        mvc.perform(put(path + "/" + id).session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON).content(body(values))).andExpect(status().isConflict());
        mvc.perform(post(path + "/" + id + "/publicar").session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON).content(body(Map.of("versao", updated.get("versao").asLong()))))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.titulo").value("Conquista Publicada"));
        assertEquals(0, rascunhos.count()); assertEquals(5, destaques.count());
        mvc.perform(post(path + "/" + id + "/publicar").session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON).content(body(Map.of("versao", updated.get("versao").asLong()))))
                .andExpect(status().isNotFound());
    }

    @Test void directoryCombinesFiltersAndPaginatesWithoutDuplicatingMultipleFormations() throws Exception {
        var person = ana(); var course = cursos.findAll().get(0);
        formacoes.saveAndFlush(CursoEgresso.builder().egresso(person).curso(course).ano_inicio(2016).ano_fim(2020).build());
        mvc.perform(get("/api/publico/egressos").param("nome", "Ana").param("cargo", "Backend").param("anoInicio", "2016").param("tamanho", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1)).andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].cursos.length()").value(2)).andExpect(jsonPath("$.items[0].cargos[0].descricao").value("Desenvolvedora Backend"))
                .andExpect(jsonPath("$.items[0].senha").doesNotExist());
        mvc.perform(get("/api/publico/egressos").param("tamanho", "2").param("pagina", "2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(4)).andExpect(jsonPath("$.page").value(2)).andExpect(jsonPath("$.first").value(3));
        mvc.perform(get("/api/publico/egressos").param("nome", "Ausente")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(0)).andExpect(jsonPath("$.last").value(0));
        mvc.perform(get("/api/publico/egressos").param("tamanho", "101")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/publico/egressos").param("anoInicio", "1800")).andExpect(status().isBadRequest());
    }

    @Test void galleryPaginatesAndDashboardReturnsOnlyCurrentAccountsCourses() throws Exception {
        mvc.perform(get("/api/publico/destaques").param("tamanho", "2").param("pagina", "999"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(4)).andExpect(jsonPath("$.page").value(2)).andExpect(jsonPath("$.items[0].noticia").doesNotExist());
        var account = login("coord.demo");
        mvc.perform(get("/api/gestao/painel").session(account.session)).andExpect(status().isOk()).andExpect(jsonPath("$.cursos.length()").value(3))
                .andExpect(jsonPath("$.stats.egressos").value(4)).andExpect(jsonPath("$.coordenadores.length()").value(0));
        cursos.findAll().forEach(course -> { course.setCoordenador(coordenadores.findByLogin("admin.demo").orElseThrow()); cursos.save(course); });
        mvc.perform(get("/api/gestao/painel").session(account.session)).andExpect(status().isOk()).andExpect(jsonPath("$.cursos.length()").value(0)).andExpect(jsonPath("$.stats.egressos").value(0));
    }

    @Test void corsRejectsUntrustedOriginsAndPasswordHasherRejectsPlaintext() throws Exception {
        mvc.perform(options("/api/auth/login").header("Origin", "https://untrusted.example").header("Access-Control-Request-Method", "POST")).andExpect(status().isForbidden());
        mvc.perform(options("/api/auth/login").header("Origin", "http://localhost:5180").header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5180"));
        String first = passwords.encode("senhaSegura123"), second = passwords.encode("senhaSegura123");
        assertNotEquals(first, second); assertTrue(passwords.matches("senhaSegura123", first));
        assertFalse(passwords.matches("incorreta", first)); assertFalse(passwords.matches("senhaSegura123", "senhaSegura123"));
    }

    @Test void graduateCannotDeleteAnotherPersonsCareerTestimonialOrFormation() throws Exception {
        var account = login("ana@example.com");
        var other = egressos.findByEmail("bruno@example.com").orElseThrow();
        var job = cargos.findAll().stream().filter(c -> c.getEgresso().getId_egresso().equals(other.getId_egresso())).findFirst().orElseThrow();
        var testimonial = depoimentos.findAll().stream().filter(d -> d.getEgresso().getId_egresso().equals(other.getId_egresso())).findFirst().orElseThrow();
        var formation = formacoes.findAll().stream().filter(f -> f.getEgresso().getId_egresso().equals(other.getId_egresso())).findFirst().orElseThrow();
        for (String path : java.util.List.of("/api/egressos/deletar/cargo/" + job.getId_cargo(),
                "/api/egressos/deletar/depoimento/" + testimonial.getId_depoimento(),
                "/api/egressos/deletar/curso_egresso/" + formation.getId_curso_egresso()))
            mvc.perform(delete(path).session(account.session).header("X-CSRF-TOKEN", account.token)).andExpect(status().isForbidden());
        assertTrue(cargos.existsById(job.getId_cargo())); assertTrue(depoimentos.existsById(testimonial.getId_depoimento()));
        assertTrue(formacoes.existsById(formation.getId_curso_egresso()));
    }

    @Test void coordinatorCannotForgeAnotherAuthorAndLosesAccessWhenCourseMoves() throws Exception {
        var account = login("coord.demo"); var admin = coordenadores.findByLogin("admin.demo").orElseThrow();
        var values = body(Map.of("titulo", "Conquista Nova", "noticia", "Texto completo", "feitoDestaque", "Projeto apresentado"));
        mvc.perform(post("/api/coordenadores/{id_coord}/egresso/{id_egresso}/destaque", admin.getId_coordenador(), ana().getId_egresso())
                .session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON).content(values)).andExpect(status().isForbidden());
        cursos.findAll().forEach(course -> { course.setCoordenador(admin); cursos.saveAndFlush(course); });
        mvc.perform(post("/api/coordenadores/{id_coord}/egresso/{id_egresso}/destaque", coord().getId_coordenador(), ana().getId_egresso())
                .session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON).content(values)).andExpect(status().isForbidden());
        var formation = formacoes.findAll().get(0);
        mvc.perform(delete("/api/egressos/deletar/curso_egresso/{id}", formation.getId_curso_egresso()).session(account.session).header("X-CSRF-TOKEN", account.token)).andExpect(status().isForbidden());
        assertEquals(4, destaques.count()); assertEquals(4, formacoes.count());
    }

    @Test void oldCsrfCannotLogoutNewSessionAndGeneralCoordinatorCannotDeleteOwnAccount() throws Exception {
        var before = anonymous();
        mvc.perform(post("/api/auth/login").session(before.session).header("X-CSRF-TOKEN", before.token).contentType(MediaType.APPLICATION_JSON)
                .content(body(Map.of("login", "admin.demo", "senha", "demo123")))).andExpect(status().isOk());
        mvc.perform(post("/api/auth/logout").session(before.session).header("X-CSRF-TOKEN", before.token)).andExpect(status().isForbidden());
        var token = json.readTree(mvc.perform(get("/api/auth/csrf").session(before.session)).andReturn().getResponse().getContentAsString()).get("token").asText();
        mvc.perform(delete("/api/coordenadores/deletar/coordenador/{id}", coordenadores.findByLogin("admin.demo").orElseThrow().getId_coordenador())
                .session(before.session).header("X-CSRF-TOKEN", token)).andExpect(status().isForbidden());
        mvc.perform(get("/api/auth/me").session(before.session)).andExpect(status().isOk());
    }

    @Test void failedLoginIsRateLimitedAndPasswordMigrationIsIdempotent() throws Exception {
        var account = anonymous();
        for (int i = 0; i < 10; i++)
            mvc.perform(post("/api/auth/login").session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON)
                    .content(body(Map.of("login", "conta.inexistente", "senha", "incorreta")))).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON)
                .content(body(Map.of("login", "conta.inexistente", "senha", "incorreta")))).andExpect(status().isTooManyRequests());
        String prior = coord().getSenha();
        var realPerson = egressos.saveAndFlush(Egresso.builder().nome("Perfil Real").email("real@example.org").build());
        migration.run(null);
        assertEquals(prior, coord().getSenha());
        assertNull(egressos.findById(realPerson.getId_egresso()).orElseThrow().getSenha());
    }

    @Test void deletingProfileOrAccountRemovesRelatedDraftsAndRevokesDeletedAccountsSession() throws Exception {
        var admin = login("admin.demo");
        mvc.perform(post("/api/gestao/rascunhos").session(admin.session).header("X-CSRF-TOKEN", admin.token).contentType(MediaType.APPLICATION_JSON)
                .content(body(Map.of("id_egresso", ana().getId_egresso(), "titulo", "Rascunho Temporário")))).andExpect(status().isCreated());
        // Real HTTP requests use separate persistence contexts; simulate that boundary.
        persistence.flush(); persistence.clear();
        mvc.perform(delete("/api/egressos/deletar/egresso/{id}", ana().getId_egresso()).session(admin.session).header("X-CSRF-TOKEN", admin.token)).andExpect(status().isNoContent());
        persistence.flush();
        assertEquals(0, rascunhos.count()); assertEquals(3, egressos.count());
        var author = coordenadores.saveAndFlush(Coordenador.builder().login("rascunho.demo").tipo("coordenador").senha(passwords.encode("demo123")).build());
        var account = login("rascunho.demo");
        mvc.perform(post("/api/gestao/rascunhos").session(account.session).header("X-CSRF-TOKEN", account.token).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isCreated());
        persistence.flush(); persistence.clear();
        mvc.perform(delete("/api/coordenadores/deletar/coordenador/{id}", author.getId_coordenador()).session(admin.session).header("X-CSRF-TOKEN", admin.token)).andExpect(status().isNoContent());
        persistence.flush();
        assertEquals(0, rascunhos.count());
        mvc.perform(get("/api/auth/me").session(account.session)).andExpect(status().isUnauthorized());
    }

    @Test void legacyCoordinatorWithInvalidRoleCannotImpersonateGraduateAndRoleChangesRevokeSession() throws Exception {
        coordenadores.saveAndFlush(Coordenador.builder().login("antigo.role").tipo("egresso").senha(passwords.encode("demo123")).build());
        var anonymous = anonymous();
        mvc.perform(post("/api/auth/login").session(anonymous.session).header("X-CSRF-TOKEN", anonymous.token).contentType(MediaType.APPLICATION_JSON)
                .content(body(Map.of("login", "antigo.role", "senha", "demo123")))).andExpect(status().isUnauthorized());
        var account = login("coord.demo"); var coordinator = coord(); coordinator.setTipo("egresso"); coordenadores.saveAndFlush(coordinator);
        mvc.perform(get("/api/auth/me").session(account.session)).andExpect(status().isUnauthorized());
    }
}
