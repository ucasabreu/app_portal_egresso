package com.example.portalegresso.backend.service;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.portalegresso.backend.model.entidades.Coordenador;
import com.example.portalegresso.backend.model.entidades.Curso;
import com.example.portalegresso.backend.model.entidades.CursoEgresso;
import com.example.portalegresso.backend.model.repository.CoordenadorRepositorio;
import com.example.portalegresso.backend.model.repository.CursoEgressoRepositorio;
import com.example.portalegresso.backend.model.repository.CursoRepositorio;

import jakarta.transaction.Transactional;

@Service
public class CoordenadorService {

    @Autowired
    CoordenadorRepositorio coordenadorRepositorio;

    @Autowired
    CursoRepositorio cursoRepositorio;

    @Autowired
    CursoEgressoRepositorio cursoEgressoRepositorio;

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

    private void verificarCurso(Curso curso) {
        if (curso == null) {
            throw new RegraNegocioRunTime("Um curso válido deve ser informado.");
        }

        if ((curso.getNome() == null) || (curso.getNome().isEmpty())) {
            throw new RegraNegocioRunTime("Um nome deve ser infomado.");
        }

        if(cursoRepositorio.existsByNome(curso.getNome())){
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
        buscarCursoPorId(curso.getId_curso());
        cursoRepositorio.deleteById(curso.getId_curso());
    }

    public void remover(Coordenador coordenador) {
        Coordenador coordenadorExistente = buscarCoordenadorPorId(coordenador.getId_coordenador());

        // Remover todos os cursos relacionados ao coordenador
        List<Curso> cursos = cursoRepositorio.findByCoordenador(coordenadorExistente);
        for (Curso curso : cursos) {
            cursoRepositorio.delete(curso);
        }

        // Deletar dados do coordenador
        coordenadorRepositorio.deleteById(coordenador.getId_coordenador());
    }

    /*
     * Funcões para buscar
     */

    public Coordenador buscarCoordenadorPorId(Integer id) {
        return coordenadorRepositorio.findById(id)
                .orElseThrow(() -> new RegraNegocioRunTime("Coordenador não encontrado com o ID: " + id));
    }

    public Curso buscarCursoPorId(Integer id) {
        return cursoRepositorio.findById(id)
                .orElseThrow(() -> new RegraNegocioRunTime("Curso não encontrado com o ID: " + id));
    }

    public Coordenador buscarCoordenadorPorLoginESenha(String login,String senha) {
        if (senha == null || senha.isEmpty()) {
            throw new RegraNegocioRunTime("Senha deve ser informada.");
        }

        return coordenadorRepositorio.findByLoginAndSenha(login,senha)
                .orElseThrow(() -> new RegraNegocioRunTime("Coordenador não encontrado com o login e senha fornecido."));
    }

    public List<CursoEgresso> buscarEgressosPorCursoId(Integer id) {
        Curso curso = buscarCursoPorId(id);
        return cursoEgressoRepositorio.findCursoEgressoByCursoId(curso.getId_curso());
    }
}
