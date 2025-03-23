package com.example.portalegresso.backend.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.portalegresso.backend.model.entidades.DestaqueEgresso;

@Repository
public interface DestaqueEgressoRepositorio extends JpaRepository<DestaqueEgresso,Long>{
    @Query("SELECT d FROM DestaqueEgresso d " +
       "JOIN d.egresso e " +
       "LEFT JOIN CursoEgresso ce ON ce.egresso.id_egresso = e.id_egresso " +
       "LEFT JOIN Curso c ON ce.curso.id_curso = c.id_curso " +
       "WHERE LOWER(e.nome) LIKE LOWER(CONCAT('%', :nomeOuCurso, '%')) " +
       "OR LOWER(c.nome) LIKE LOWER(CONCAT('%', :nomeOuCurso, '%'))")
    List<DestaqueEgresso> buscarPorNomeOuCurso(@Param("nomeOuCurso") String nomeOuCurso);
}
