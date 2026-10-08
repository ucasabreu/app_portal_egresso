package com.example.portalegresso.backend.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.portalegresso.backend.model.entidades.CursoEgresso;
import com.example.portalegresso.backend.model.entidades.Egresso;



@Repository
public interface CursoEgressoRepositorio extends JpaRepository<CursoEgresso,Integer> {
    
    @Query("SELECT ce.egresso FROM CursoEgresso ce WHERE ce.curso.id_curso = :id_curso")
    List<Egresso> findEgressoByCursoId(@Param("id_curso") Integer id_curso);

    @Query("SELECT ce.egresso FROM CursoEgresso ce WHERE LOWER(ce.curso.nome) LIKE LOWER(CONCAT('%', :curso, '%'))")
    List<Egresso> findEgressosByCursoNome(@Param("curso") String curso);

    @Query("SELECT ce.egresso FROM CursoEgresso ce WHERE ce.ano_inicio = :ano")
    List<Egresso> findEgressosByAnoInicio(@Param("ano") int ano);

    @Query("SELECT ce.egresso FROM CursoEgresso ce WHERE ce.ano_fim = :ano")
    List<Egresso> findEgressosByAnoFim(@Param("ano") int ano);
    
    @Query("SELECT ce FROM CursoEgresso ce WHERE ce.egresso.id_egresso = :idEgresso")
    List<CursoEgresso> findCursoEgressoByEgressoId(@Param("idEgresso") Integer idEgresso);

    @Query("SELECT ce FROM CursoEgresso ce WHERE ce.curso.id_curso = :id_curso")
    List<CursoEgresso> findCursoEgressoByCursoId(@Param("id_curso") Integer id_curso);
    
    @org.springframework.data.jpa.repository.Query("select (count(ce) > 0) from CursoEgresso ce where ce.egresso.id_egresso = :graduate and ce.curso.coordenador.id_coordenador = :coordinator")
    boolean existsForCoordinator(@org.springframework.data.repository.query.Param("graduate") Integer graduate, @org.springframework.data.repository.query.Param("coordinator") Integer coordinator);

    @Query("select ce from CursoEgresso ce join fetch ce.curso c join fetch c.coordenador join fetch ce.egresso where ce.egresso.id_egresso in :ids")
    List<CursoEgresso> forGraduates(List<Integer> ids);
    @Query("select ce from CursoEgresso ce join fetch ce.curso c join fetch c.coordenador join fetch ce.egresso where c.id_curso in :ids")
    List<CursoEgresso> forCourses(List<Integer> ids);

}
