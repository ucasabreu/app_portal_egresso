package com.example.portalegresso.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.portalegresso.backend.model.entidades.Cargo;
import com.example.portalegresso.backend.model.entidades.Coordenador;
import com.example.portalegresso.backend.model.entidades.Curso;
import com.example.portalegresso.backend.model.entidades.CursoEgresso;
import com.example.portalegresso.backend.model.entidades.Depoimento;
import com.example.portalegresso.backend.model.entidades.Egresso;
import com.example.portalegresso.backend.model.repository.CargoRepositorio;
import com.example.portalegresso.backend.model.repository.CoordenadorRepositorio;
import com.example.portalegresso.backend.model.repository.CursoEgressoRepositorio;
import com.example.portalegresso.backend.model.repository.CursoRepositorio;
import com.example.portalegresso.backend.model.repository.DepoimentoRepositorio;
import com.example.portalegresso.backend.model.repository.EgressoRepositorio;


@Service
public class ConsultasService {

    @Autowired
    CursoRepositorio cursoRepositorio;

    @Autowired
    DepoimentoRepositorio depoimentoRepositorio;

    @Autowired
    EgressoRepositorio egressoRepositorio;

    @Autowired
    CursoEgressoRepositorio cursoEgressoRepositorio;

    @Autowired
    CargoRepositorio cargoRepositorio;

    @Autowired
    CoordenadorRepositorio coordenadorRepositorio;

    /* ------- Consulta cursos ------- */
    public List<Curso> listarTodosCursos() {
        return cursoRepositorio.findAll();
    }

    public List<Curso> listarPorFiltros(String nivel) {
        if (nivel == null || nivel.isBlank()) {
            throw new RegraNegocioRunTime("Nível do curso não pode ser vazio.");
        }

        List<Curso> cursos = cursoRepositorio.filtrarCursosPorNivel(nivel);


        return cursos;
    }

    /* ------- Consulta depoimentos ------- */
    // A consulta limitada aceita de 1 a 100 depoimentos.
    public List<Depoimento> consultarRecentes(Integer limite) {
        if (limite != null && limite > 0 && limite <= 100) {
            // Define a paginação para limitar os resultados
            Pageable pageable = PageRequest.of(0, limite);
            return depoimentoRepositorio.findRecentes(pageable);
        } else {
            throw new RegraNegocioRunTime("Valor limite deve ser válido.");
        }
    }

    public List<Depoimento> consultarRecentes() {
        return depoimentoRepositorio.findAllByOrderByDataDesc();
    }

    public List<Depoimento> consultarPorAno(Integer ano) {
        if (ano == null) {
            throw new RegraNegocioRunTime("O ano não pode ser nulo.");
        }

        if (ano <= 0) {
            throw new RegraNegocioRunTime("O ano deve ser maior que zero.");
        }

        List<Depoimento> depoimentos = depoimentoRepositorio.findByAno(ano);

        return depoimentos;
    }

    public List<Cargo> listarCargos() {
        return cargoRepositorio.findAll();
    }

    public List<Egresso> listarEgressos() {
        return egressoRepositorio.findAll();
    }

    /* fim consulta depoimentos */

    /* ------- Consulta egressos ------- */
    // Consulta egressos por nome (busca parcial, case insensitive)
    public List<Egresso> consultarEgressosPorNome(String nome) {
        if (nome == null) {
            throw new RegraNegocioRunTime("Nome não pode ser nulo.");
        }


        if (nome == null || nome.isBlank()) {
            throw new RegraNegocioRunTime("Nome não pode ser vazio.");
        }

        List<Egresso> egressos = egressoRepositorio.findByNomeContainingIgnoreCase(nome);


        return egressos;
    }

    // TODO: Definir melhor a pesquisa por cargo. Devo pesquisar por cargo ou por
    // descrição do cargo?
    // Consulta egressos por cargo
    public List<Egresso> consultarEgressosPorCargo(String cargo) {
        if (cargo == null) {
            throw new RegraNegocioRunTime("Cargo não pode ser nulo.");
        }

        if (cargo == null || cargo.isBlank()) {
            throw new RegraNegocioRunTime("Cargo não pode ser vazio.");
        }

        List<Egresso> egressos = cargoRepositorio.findEgressosByCargoDescricao(cargo);


        return egressos;
    }

    // Consulta egressos por curso
    public List<Egresso> consultarEgressosPorCurso(String curso) {

        if (curso == null) {
            throw new RegraNegocioRunTime("Curso não pode ser nulo.");
        }

        if (curso == null || curso.isBlank()) {
            throw new RegraNegocioRunTime("Curso não pode ser vazio.");
        }

        List<Egresso> egressos = cursoEgressoRepositorio.findEgressosByCursoNome(curso);

        return egressos;
    }

    // Consulta egressos por ano de início do curso
    public List<Egresso> consultarEgressosPorAnoInicio(Integer ano) {
        if (ano == null) {
            throw new RegraNegocioRunTime("O ano não pode ser nulo.");
        }

        if (ano <= 0) {
            throw new RegraNegocioRunTime("O ano deve ser maior que zero.");
        }
        List<Egresso> egressos = cursoEgressoRepositorio.findEgressosByAnoInicio(ano);


        return egressos;
    }

    // Consulta egressos por ano de comclusao do curso
    public List<Egresso> consultarEgressosPorAnoFim(Integer ano) {
        if (ano == null) {
            throw new RegraNegocioRunTime("O ano não pode ser nulo.");
        }
        if (ano <= 0) {
            throw new RegraNegocioRunTime("O ano deve ser maior que zero.");
        }

        List<Egresso> egressos = cursoEgressoRepositorio.findEgressosByAnoFim(ano);
        return egressos;
    }

    public List<String> listarTodosNomesEgressos() {
        return egressoRepositorio.findAll().stream()
                .map(Egresso::getNome)
                .collect(Collectors.toList());
    }

    public List<CursoEgresso> listarCursoEgresso() {
        return cursoEgressoRepositorio.findAll();
    }

    public List<Coordenador> listarCoordenadores() {
        return coordenadorRepositorio.findAll();
    }

}