package com.example.portalegresso.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.portalegresso.backend.model.entidades.Coordenador;
import com.example.portalegresso.backend.model.entidades.Curso;
import com.example.portalegresso.backend.model.entidades.CursoEgresso;
import com.example.portalegresso.backend.model.entidades.DestaqueEgresso;
import com.example.portalegresso.backend.model.entidades.Egresso;
import com.example.portalegresso.backend.model.repository.CoordenadorRepositorio;
import com.example.portalegresso.backend.model.repository.CursoEgressoRepositorio;
import com.example.portalegresso.backend.model.repository.CursoRepositorio;
import com.example.portalegresso.backend.model.repository.DestaqueEgressoRepositorio;
import com.example.portalegresso.backend.model.repository.EgressoRepositorio;

import jakarta.transaction.Transactional;

@Service
public class CoordenadorService {

    @Autowired
    CoordenadorRepositorio coordenadorRepositorio;

    @Autowired
    CursoRepositorio cursoRepositorio;

    @Autowired
    CursoEgressoRepositorio cursoEgressoRepositorio;

    @Autowired
    DestaqueEgressoRepositorio destaqueEgressoRepositorio;

    @Autowired
    private EgressoRepositorio egressoRepositorio;

    public boolean efetuarLogin(String login, String senha) {
        if ((login == null) || (login.isEmpty()))
            throw new RegraNegocioRunTime("Login deve ser informado.");
        if ((senha == null) || (senha.isEmpty()))
            throw new RegraNegocioRunTime("Senha deve ser informada.");

        Optional<Coordenador> coord = coordenadorRepositorio.findByLogin(login);

        if (!coord.isPresent())
            throw new RegraNegocioRunTime("Erro de autenticação. Login não encontrado.");
        if (!coord.get().getSenha().equals(senha))
            throw new RegraNegocioRunTime("Erro de autenticação. Senha incorreta.");

        return true;
    }

    /*
     * Funcões para salvar
     */
    @Transactional
    public Coordenador salvar(Coordenador coordenador) {
        verificarCoordenador(coordenador);
        return coordenadorRepositorio.save(coordenador);
    }

    public Curso salvar(Curso curso) {
        verificarCurso(curso);
        return cursoRepositorio.save(curso);
    }

    /*
     * Funcões para atualizar
     */

    public Curso atualizar(Curso curso) {
        buscarCoordenadorPorId(curso.getId_curso());
        verificarCurso(curso);
        if (!cursoRepositorio.existsById(curso.getId_curso())) {
            throw new RegraNegocioRunTime("Curso não encontrado para atualização.");
        }
        return cursoRepositorio.save(curso);
    }

    // ✅ Salvar um novo destaque
    public DestaqueEgresso salvarDestaque(DestaqueEgresso destaque) {
        buscarCoordenadorPorId(destaque.getCoordenador().getId_coordenador());
        buscarEgressoPorId(destaque.getEgresso().getId_egresso());

        verificarDestaqueEgresso(destaque);

        return destaqueEgressoRepositorio.save(destaque);
    }

    // ✅ Editar um destaque existente
    public DestaqueEgresso editarDestaque(DestaqueEgresso destaque) {
        buscarDestaquePorId(destaque.getId());
        return destaqueEgressoRepositorio.save(destaque);
    }
    /*
     * Funcões de verificação
     */

    private void verificarCoordenador(Coordenador coordenador) {
        if (coordenador == null) {
            throw new RegraNegocioRunTime("Um usuário válido deve ser informado.");
        }

        if ((coordenador.getLogin() == null) || (coordenador.getLogin().isEmpty())) {
            throw new RegraNegocioRunTime("Login deve ser informado.");
        }

        boolean teste = coordenadorRepositorio.existsByLogin(coordenador.getLogin());

        if (teste) {
            throw new RegraNegocioRunTime("Login informado já existe");
        }

        if ((coordenador.getSenha() == null) || (coordenador.getSenha().isEmpty())) {
            throw new RegraNegocioRunTime("Usuario deve possuir senha.");
        }

        if (coordenador.getTipo() == null) {
            throw new RegraNegocioRunTime("Tipo de usuário deve ser informado.");
        }

    }

    private void verificarDestaqueEgresso(DestaqueEgresso destaque) {
        if (destaque == null) {
            throw new RegraNegocioRunTime("Destaque não pode ser nulo.");
        }

        if (destaque.getEgresso() == null || destaque.getEgresso().getId_egresso() == null) {
            throw new RegraNegocioRunTime("Um egresso válido deve ser selecionado para o destaque.");
        }

        if (destaque.getTitulo() == null || destaque.getTitulo().trim().isEmpty()) {
            throw new RegraNegocioRunTime("O título do destaque deve ser informado.");
        }

        if (destaque.getNoticia() == null || destaque.getNoticia().trim().isEmpty()) {
            throw new RegraNegocioRunTime("O texto da notícia deve ser informado.");
        }

    }

    private void verificarCurso(Curso curso) {
        if (curso == null) {
            throw new RegraNegocioRunTime("Um curso válido deve ser informado.");
        }

        if ((curso.getNome() == null) || (curso.getNome().isEmpty())) {
            throw new RegraNegocioRunTime("Um nome deve ser infomado.");
        }

        if (cursoRepositorio.existsByNome(curso.getNome())) {
            throw new RegraNegocioRunTime("Nome do curso já existe.");
        }

        if ((curso.getNivel() == null) || (curso.getNivel().isEmpty())) {
            throw new RegraNegocioRunTime("Um nivel deve ser informado.");
        }

        if ((curso.getCoordenador() == null || (curso.getCoordenador().getId_coordenador() == null))) {

            throw new RegraNegocioRunTime("Um coordenador válido deve ser associado.");
        }

        if (!coordenadorRepositorio.existsById(curso.getCoordenador().getId_coordenador())) {
            throw new RegraNegocioRunTime("Coordenador não encontrado.");
        }
    }

    /*
     * Funcões para remover
     */

    public void remover(Curso curso) {
        Curso cursoExistente = buscarCursoPorId(curso.getId_curso());

        // 1. Remover vínculos de curso_egresso
        List<CursoEgresso> vinculos = cursoEgressoRepositorio.findByCurso(cursoExistente);
        cursoEgressoRepositorio.deleteAll(vinculos);

        // 2. Agora sim, deletar o curso
        cursoRepositorio.deleteById(curso.getId_curso());
    }

    public void remover(Coordenador coordenador) {
        Coordenador coordenadorExistente = buscarCoordenadorPorId(coordenador.getId_coordenador());

        // 1. Desvincular coordenador dos cursos (mas manter os cursos no banco)
        List<Curso> cursos = cursoRepositorio.findByCoordenador(coordenadorExistente);
        for (Curso curso : cursos) {
            curso.setCoordenador(null);

        }
        cursoRepositorio.saveAll(cursos);

        // 2. Desvincular coordenador dos destaques (mas manter os destaques no banco)
        List<DestaqueEgresso> destaques = destaqueEgressoRepositorio.findByCoordenador(coordenadorExistente);
        for (DestaqueEgresso destaque : destaques) {
            destaque.setCoordenador(null);

        }

        destaqueEgressoRepositorio.saveAll(destaques);

        // 3. Deletar coordenador
        coordenadorRepositorio.deleteById(coordenadorExistente.getId_coordenador());
    }

    // ✅ Excluir um destaque
    public void remover(DestaqueEgresso destaque) {
        buscarDestaquePorId(destaque.getId());
        destaqueEgressoRepositorio.delete(destaque);
    }

    /*
     * Funcões para buscar
     */

    public Coordenador buscarCoordenadorPorId(Integer id) {
        return coordenadorRepositorio.findById(id)
                .orElseThrow(() -> new RegraNegocioRunTime("Coordenador não encontrado com o ID: " + id));
    }

    // ✅ Buscar destaque por ID
    public DestaqueEgresso buscarDestaquePorId(Long id) {
        return destaqueEgressoRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Destaque não encontrado para o ID:" + id));
    }

    public List<DestaqueEgresso> buscarDestaquesPorEgresso(Integer idEgresso) {
        Optional<Egresso> egressoOpt = egressoRepositorio.findById(idEgresso);
        if (egressoOpt.isEmpty()) {
            throw new RegraNegocioRunTime("Egresso não encontrado.");
        }
        return destaqueEgressoRepositorio.findByEgresso(egressoOpt.get());
    }

    public Curso buscarCursoPorId(Integer id) {
        return cursoRepositorio.findById(id)
                .orElseThrow(() -> new RegraNegocioRunTime("Curso não encontrado com o ID: " + id));
    }

    public Egresso buscarEgressoPorId(Integer id) {
        return egressoRepositorio.findById(id)
                .orElseThrow(() -> new RegraNegocioRunTime("Egresso não encontrado com ID: " + id));
    }

    public Coordenador buscarCoordenadorPorLoginESenha(String login, String senha) {
        if (senha == null || senha.isEmpty()) {
            throw new RegraNegocioRunTime("Senha deve ser informada.");
        }

        return coordenadorRepositorio.findByLoginAndSenha(login, senha)
                .orElseThrow(
                        () -> new RegraNegocioRunTime("Coordenador não encontrado com o login e senha fornecido."));
    }

    public List<DestaqueEgresso> buscarDestaquesPorNomeOuCurso(String nomeOuCurso) {
        if (nomeOuCurso == null || nomeOuCurso.isEmpty()) {
            throw new RegraNegocioRunTime("O termo de busca não pode ser vazio.");
        }

        return destaqueEgressoRepositorio.buscarPorNomeOuCurso(nomeOuCurso);

    }

    public List<DestaqueEgresso> listarDestaques() {
        return destaqueEgressoRepositorio.findAll();
    }

    public List<CursoEgresso> buscarEgressosPorCursoId(Integer id) {
        if (id == null) {
            throw new RegraNegocioRunTime("ID não pode ser nulo.");
        }
        Curso curso = buscarCursoPorId(id);

        return cursoEgressoRepositorio.findCursoEgressoByCursoId(curso.getId_curso());
    }
}
