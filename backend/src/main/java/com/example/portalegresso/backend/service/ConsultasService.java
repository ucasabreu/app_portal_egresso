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
        if (cursoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há cursos cadastrados.");
        }
        return cursoRepositorio.findAll();
    }

    public List<Curso> listarPorFiltros(String nivel) {
        if (nivel == null || nivel.isEmpty()) {
            throw new RegraNegocioRunTime("Nível do curso não pode ser vazio.");
        }

        List<Curso> cursos = cursoRepositorio.filtrarCursosPorNivel(nivel);

        if(cursos.isEmpty()){
            throw new RegraNegocioRunTime("Não há cursos com o nível informado.");
        }

        return cursos;
    }

    /* ------- Consulta depoimentos ------- */
    // opcao para adicionar o limite de depoimentos maximo (opcional), caso para sem
    // limite == null.
    public List<Depoimento> consultarRecentes(Integer limite) {
        if (depoimentoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há depoimentos cadastrados.");
        }
        if (limite > 0) {
            // Define a paginação para limitar os resultados
            Pageable pageable = PageRequest.of(0, limite);
            return depoimentoRepositorio.findRecentes(pageable);
        } else {
            throw new RegraNegocioRunTime("Valor limite deve ser válido.");
        }
    }

    public List<Depoimento> consultarRecentes() {
        if (depoimentoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há depoimentos cadastrados.");
        }
        return depoimentoRepositorio.findAllByOrderByDataDesc();
    }

    public List<Depoimento> consultarPorAno(Integer ano) {
        if (ano == null) {
            throw new RegraNegocioRunTime("O ano não pode ser nulo.");
        }

        if (depoimentoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há depoimentos cadastrados.");
        }
        if (ano <= 0) {
            throw new RegraNegocioRunTime("O ano deve ser maior que zero.");
        }

        List<Depoimento> depoimentos = depoimentoRepositorio.findByAno(ano);
        if (depoimentos.isEmpty()) {
            throw new RegraNegocioRunTime("Não há depoimentos para o ano informado.");
        }

        return depoimentos;
    }

    public List<Cargo> listarCargos() {
        if (cargoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há cargos cadastrados.");
        }
        return cargoRepositorio.findAll();
    }

    public List<Egresso> listarEgressos() {
        if (egressoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há egressos cadastrados.");
        }
        return egressoRepositorio.findAll();
    }

    /* fim consulta depoimentos */

    /* ------- Consulta egressos ------- */
    // Consulta egressos por nome (busca parcial, case insensitive)
    public List<Egresso> consultarEgressosPorNome(String nome) {
        if (nome == null) {
            throw new RegraNegocioRunTime("Nome não pode ser nulo.");
        }

        if (egressoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há egressos cadastrados.");
        }

        if (nome == null || nome.isEmpty()) {
            throw new RegraNegocioRunTime("Nome não pode ser vazio.");
        }

        List<Egresso> egressos = egressoRepositorio.findByNomeContainingIgnoreCase(nome);

        if (egressos.isEmpty()) {
            throw new RegraNegocioRunTime("Não há egressos com o nome informado.");
        }

        return egressos;
    }

    // TODO: Definir melhor a pesquisa por cargo. Devo pesquisar por cargo ou por
    // descrição do cargo?
    // Consulta egressos por cargo
    public List<Egresso> consultarEgressosPorCargo(String cargo) {
        if (cargo == null) {
            throw new RegraNegocioRunTime("Cargo não pode ser nulo.");
        }

        if (cargoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há cargos cadastrados.");
        }
        if (egressoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há egressos cadastrados.");
        }
        if (cargo == null || cargo.isEmpty()) {
            throw new RegraNegocioRunTime("Cargo não pode ser vazio.");
        }

        List<Egresso> egressos = cargoRepositorio.findEgressosByCargoDescricao(cargo);

        if (egressos.isEmpty()) {
            throw new RegraNegocioRunTime("Não há egressos com o cargo informado.");
        }

        return egressos;
    }

    // Consulta egressos por curso
    public List<Egresso> consultarEgressosPorCurso(String curso) {

        if (curso == null) {
            throw new RegraNegocioRunTime("Curso não pode ser nulo.");
        }

        if (egressoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há egressos cadastrados.");
        }
        if (curso == null || curso.isEmpty()) {
            throw new RegraNegocioRunTime("Curso não pode ser vazio.");
        }

        List<Egresso> egressos = cursoEgressoRepositorio.findEgressosByCursoNome(curso);
        if (egressos.isEmpty()) {
            throw new RegraNegocioRunTime("Não há egressos com o curso informado.");
        }

        return egressos;
    }

    // Consulta egressos por ano de início do curso
    public List<Egresso> consultarEgressosPorAnoInicio(Integer ano) {
        if (ano == null) {
            throw new RegraNegocioRunTime("O ano não pode ser nulo.");
        }

        if (egressoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há egressos cadastrados.");
        }
        if (ano <= 0) {
            throw new RegraNegocioRunTime("O ano deve ser maior que zero.");
        }
        List<Egresso> egressos = cursoEgressoRepositorio.findEgressosByAnoInicio(ano);

        if (egressos.isEmpty()) {
            throw new RegraNegocioRunTime("Não há egressos para o ano informado.");
        }

        return egressos;
    }

    // Consulta egressos por ano de comclusao do curso
    public List<Egresso> consultarEgressosPorAnoFim(Integer ano) {
        if (ano == null) {
            throw new RegraNegocioRunTime("O ano não pode ser nulo.");
        }
        if (egressoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há egressos cadastrados.");
        }
        if (ano <= 0) {
            throw new RegraNegocioRunTime("O ano deve ser maior que zero.");
        }

        List<Egresso> egressos = cursoEgressoRepositorio.findEgressosByAnoFim(ano);
        if (egressos.isEmpty()) {
            throw new RegraNegocioRunTime("Não há egressos para o ano informado.");
        }
        return egressos;
    }

    public List<String> listarTodosNomesEgressos() {
        if (egressoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há egressos cadastrados.");
        }
        return egressoRepositorio.findAll().stream()
                .map(Egresso::getNome)
                .collect(Collectors.toList());
    }

    public List<CursoEgresso> listarCursoEgresso() {
        if (cursoEgressoRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há dados de curso egresso cadastrados.");
        }
        return cursoEgressoRepositorio.findAll();
    }

    public List<Coordenador> listarCoordenadores() {
        if (coordenadorRepositorio.count() == 0) {
            throw new RegraNegocioRunTime("Não há coordenadores cadastrados.");
        }
        return coordenadorRepositorio.findAll();
    }

}