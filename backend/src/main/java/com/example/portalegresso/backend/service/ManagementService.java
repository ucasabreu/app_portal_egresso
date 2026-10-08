package com.example.portalegresso.backend.service;

import java.time.Instant;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.example.portalegresso.backend.auth.*;
import com.example.portalegresso.backend.dto.*;
import com.example.portalegresso.backend.model.entidades.*;
import com.example.portalegresso.backend.model.repository.*;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManagementService {
    private final CursoRepositorio cursos;
    private final CoordenadorRepositorio coordenadores;
    private final EgressoRepositorio egressos;
    private final DestaqueEgressoRepositorio destaques;
    private final RascunhoDestaqueRepositorio rascunhos;
    private final CursoEgressoRepositorio formacoes;
    private final CoordenadorService coordenadorService;
    private final PasswordHasher passwords;
    private final Validator validator;

    @Transactional
    public Curso editCourse(Integer id, CursoDTO dto) {
        var course = cursos.findById(id).orElseThrow(ManagementService::missing);
        var responsible = coordenadores.findById(dto.getId_coordenador() == null ? -1 : dto.getId_coordenador()).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um responsável disponível."));
        if (!"coordenador".equals(responsible.getTipo()) && !"geral".equals(responsible.getTipo()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione uma conta de coordenação.");
        if (dto.getNome().isBlank() || dto.getNivel().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Preencha nome e nível do curso.");
        if (cursos.findAll().stream().anyMatch(c -> !Objects.equals(c.getId_curso(), id) && c.getNome().equalsIgnoreCase(dto.getNome().trim())))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um curso com esse nome.");
        course.setNome(dto.getNome().trim()); course.setNivel(dto.getNivel().trim()); course.setCoordenador(responsible);
        return cursos.save(course);
    }

    @Transactional
    public DestaqueEgresso editHighlight(Long id, DestaqueEgressoDTO dto) {
        var story = destaques.findById(id).orElseThrow(ManagementService::missing);
        // Ownership, graduate and original publication date are immutable in this operation.
        story.setTitulo(dto.getTitulo()); story.setNoticia(dto.getNoticia());
        story.setFeitoDestaque(dto.getFeitoDestaque()); story.setImagem(dto.getImagem());
        return destaques.save(story);
    }

    public java.util.List<RascunhoDestaque> drafts(SessionUser user) { return rascunhos.findOwned(user.id()); }
    public RascunhoDestaque draft(Long id, SessionUser user) {
        var draft = rascunhos.findById(id).orElseThrow(ManagementService::missing);
        if (!Objects.equals(draft.getCoordenador().getId_coordenador(), user.id()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Este rascunho pertence a outra conta.");
        return draft;
    }

    @Transactional
    public RascunhoDestaque saveDraft(Long id, RascunhoDTO dto, SessionUser user) {
        var draft = id == null ? RascunhoDestaque.builder()
                .coordenador(coordenadores.findById(user.id()).orElseThrow(ManagementService::missing)).build() : draft(id, user);
        if (id != null && !Objects.equals(draft.getVersao(), dto.versao()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O rascunho mudou em outra sessão. Reabra antes de salvar.");
        Egresso person = dto.id_egresso() == null ? null : egressos.findById(dto.id_egresso()).orElseThrow(ManagementService::missing);
        if (person != null && !user.admin() && !formacoes.existsForCoordinator(person.getId_egresso(), user.id()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Selecione um egresso dos seus cursos.");
        draft.setEgresso(person); draft.setTitulo(dto.titulo()); draft.setNoticia(dto.noticia());
        draft.setImagem(dto.imagem()); draft.setFeitoDestaque(dto.feitoDestaque()); draft.setAtualizadoEm(Instant.now());
        return rascunhos.saveAndFlush(draft);
    }

    @Transactional
    public DestaqueEgresso publishDraft(Long id, Long version, SessionUser user) {
        var draft = draft(id, user);
        if (!Objects.equals(version, draft.getVersao()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O rascunho mudou. Confira a versão atual antes de publicar.");
        if (draft.getEgresso() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione o egresso antes de publicar.");
        if (!user.admin() && !formacoes.existsForCoordinator(draft.getEgresso().getId_egresso(), user.id()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "O egresso não está mais associado aos seus cursos.");
        var dto = DestaqueEgressoDTO.builder().titulo(draft.getTitulo()).noticia(draft.getNoticia())
                .feitoDestaque(draft.getFeitoDestaque()).imagem(draft.getImagem()).build();
        var errors = validator.validate(dto);
        if (!errors.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                errors.iterator().next().getMessage());
        var saved = coordenadorService.salvarDestaque(DestaqueEgresso.builder().coordenador(draft.getCoordenador())
                .egresso(draft.getEgresso()).titulo(dto.getTitulo()).noticia(dto.getNoticia())
                .imagem(dto.getImagem()).feitoDestaque(dto.getFeitoDestaque()).build());
        rascunhos.delete(draft);
        return saved;
    }

    @Transactional
    public void deleteDraft(Long id, SessionUser user) { rascunhos.delete(draft(id, user)); }

    @Transactional
    public void password(Integer id, String password) {
        var person = egressos.findById(id).orElseThrow(ManagementService::missing);
        person.setSenha(passwords.encode(password)); egressos.save(person);
    }

    private static ResponseStatusException missing() { return new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro não encontrado."); }
}
