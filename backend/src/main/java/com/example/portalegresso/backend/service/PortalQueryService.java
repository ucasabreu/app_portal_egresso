package com.example.portalegresso.backend.service;

import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.example.portalegresso.backend.auth.SessionUser;
import com.example.portalegresso.backend.model.entidades.*;
import com.example.portalegresso.backend.model.repository.*;
import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PortalQueryService {
    private final EgressoRepositorio egressos;
    private final CursoRepositorio cursos;
    private final CursoEgressoRepositorio formacoes;
    private final CargoRepositorio cargos;
    private final CoordenadorRepositorio coordenadores;
    private final DestaqueEgressoRepositorio destaques;
    public record Results<T>(List<T> items, long total, int page, int pages, int size, long first, long last) {}
    public record CourseCard(Integer id_curso, String nome, String nivel) {}
    public record FormationCard(Integer id_curso_egresso, CourseCard curso, Integer ano_inicio, Integer ano_fim) {}
    public record JobCard(Integer id_cargo, String descricao, String local, Integer ano_inicio, Integer ano_fim) {}
    public record GraduateCard(Integer id_egresso, String nome, String email, String descricao, String foto,
                               List<FormationCard> cursos, List<JobCard> cargos) {}

    public Results<GraduateCard> directory(String nome, String curso, String cargo, Integer start, Integer end,
                                           int page, int size, String order) {
        validatePage(page, size); validateYear(start); validateYear(end);
        if (!Set.of("nome-asc", "nome-desc").contains(order)) throw invalid("Ordenação inválida.");
        Sort sort = Sort.by(new Sort.Order(order.equals("nome-desc") ? Sort.Direction.DESC : Sort.Direction.ASC, "nome").ignoreCase())
                .and(Sort.by("id_egresso"));
        Page<Egresso> result = egressos.directory(text(nome), text(curso), text(cargo), start, end, PageRequest.of(page - 1, size, sort));
        if (page > Math.max(1, result.getTotalPages()))
            result = egressos.directory(text(nome), text(curso), text(cargo), start, end, PageRequest.of(Math.max(0, result.getTotalPages() - 1), size, sort));
        List<Integer> ids = result.getContent().stream().map(Egresso::getId_egresso).toList();
        List<CursoEgresso> formations = ids.isEmpty() ? List.of() : formacoes.forGraduates(ids);
        List<Cargo> jobs = ids.isEmpty() ? List.of() : cargos.forGraduates(ids);
        List<GraduateCard> cards = result.getContent().stream().map(e -> new GraduateCard(e.getId_egresso(), e.getNome(), e.getEmail(), e.getDescricao(), e.getFoto(),
                formations.stream().filter(f -> Objects.equals(f.getEgresso().getId_egresso(), e.getId_egresso()))
                        .map(f -> new FormationCard(f.getId_curso_egresso(), new CourseCard(f.getCurso().getId_curso(), f.getCurso().getNome(), f.getCurso().getNivel()), f.getAno_inicio(), f.getAno_fim())).toList(),
                jobs.stream().filter(j -> Objects.equals(j.getEgresso().getId_egresso(), e.getId_egresso()))
                        .map(j -> new JobCard(j.getId_cargo(), j.getDescricao(), j.getLocal(), j.getAno_inicio(), j.getAno_fim())).toList())).toList();
        return envelope(result, cards);
    }

    public Results<Map<String, Object>> gallery(String name, int page, int size, String order) {
        validatePage(page, size);
        if (!Set.of("recentes", "antigos").contains(order)) throw invalid("Ordenação inválida.");
        Sort.Direction direction = order.equals("antigos") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, "dataPublicacao", "id");
        Page<DestaqueEgresso> result = destaques.gallery(text(name), PageRequest.of(page - 1, size, sort));
        if (page > Math.max(1, result.getTotalPages()))
            result = destaques.gallery(text(name), PageRequest.of(Math.max(0, result.getTotalPages() - 1), size, sort));
        return envelope(result, result.getContent().stream().map(this::storyCard).toList());
    }

    public Map<String, Object> dashboard(SessionUser user) {
        var person = coordenadores.findById(user.id()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Conta indisponível."));
        List<Curso> available = cursos.managedCourses(user.admin() ? null : user.id());
        List<Integer> ids = available.stream().map(Curso::getId_curso).toList();
        List<CursoEgresso> links = ids.isEmpty() ? List.of() : formacoes.forCourses(ids);
        List<Map<String, Object>> rows = available.stream().map(course -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id_curso", course.getId_curso()); row.put("nome", course.getNome()); row.put("nivel", course.getNivel()); row.put("coordenador", course.getCoordenador());
            row.put("egressos", links.stream().filter(link -> Objects.equals(link.getCurso().getId_curso(), course.getId_curso())).map(link -> {
                Map<String, Object> graduate = new LinkedHashMap<>(); graduate.put("idVinculo", link.getId_curso_egresso()); graduate.put("id", link.getEgresso().getId_egresso());
                graduate.put("nome", link.getEgresso().getNome()); graduate.put("email", link.getEgresso().getEmail()); graduate.put("anoInicio", link.getAno_inicio()); graduate.put("anoFim", link.getAno_fim());
                return graduate;
            }).toList());
            return row;
        }).toList();
        return Map.of("coordenador", person, "coordenadores", user.admin() ? coordenadores.findAll().stream().filter(c -> !Objects.equals(c.getId_coordenador(), user.id())).toList() : List.of(),
                "cursos", rows, "destaques", user.admin() ? List.of() : destaques.managedHighlights(user.id()), "sections", Map.of(),
                "stats", Map.of("cursos", available.size(), "egressos", links.stream().map(link -> link.getEgresso().getId_egresso()).distinct().count()));
    }

    private Map<String, Object> storyCard(DestaqueEgresso story) {
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("id", story.getId()); card.put("titulo", story.getTitulo()); card.put("feitoDestaque", story.getFeitoDestaque()); card.put("imagem", story.getImagem()); card.put("dataPublicacao", story.getDataPublicacao());
        card.put("egresso", Map.of("id_egresso", story.getEgresso().getId_egresso(), "nome", story.getEgresso().getNome()));
        card.put("coordenador", Map.of("id_coordenador", story.getCoordenador().getId_coordenador(), "login", story.getCoordenador().getLogin()));
        return card;
    }
    private <T> Results<T> envelope(Page<?> source, List<T> items) {
        long first = source.getTotalElements() == 0 ? 0 : (long) source.getNumber() * source.getSize() + 1;
        return new Results<>(items, source.getTotalElements(), source.getNumber() + 1, Math.max(1, source.getTotalPages()), source.getSize(), first, source.getTotalElements() == 0 ? 0 : Math.min(first + items.size() - 1, source.getTotalElements()));
    }
    private void validatePage(int page, int size) { if (page < 1 || size < 1 || size > 100) throw invalid("Informe página positiva e tamanho entre 1 e 100."); }
    private void validateYear(Integer year) { if (year != null && (year < 1900 || year > 2100)) throw invalid("Informe um ano entre 1900 e 2100."); }
    private String text(String value) { if (value == null) return ""; if (value.length() > 200) throw invalid("A busca deve ter até 200 caracteres."); return value.trim(); }
    private ResponseStatusException invalid(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
