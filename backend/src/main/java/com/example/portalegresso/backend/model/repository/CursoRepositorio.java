package com.example.portalegresso.backend.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.portalegresso.backend.model.entidades.Coordenador;
import com.example.portalegresso.backend.model.entidades.Curso;



@Repository
public interface CursoRepositorio extends JpaRepository<Curso,Integer>{
    // Buscar cursos pelo nivel 
    @Query("SELECT c FROM Curso c WHERE LOWER(c.nivel) = LOWER(:nivel)")
    List<Curso> filtrarCursosPorNivel(@Param("nivel") String nivel);

    List<Curso> findByCoordenador(Coordenador coordenador);

    // Buscar cursos pelo id
    @Query("SELECT c FROM Curso c WHERE c.id_curso = :id_curso")
    Curso findCursoById(@Param("id_curso") Integer id_curso);

    // Verificar se o nome já está na tabela (insensível a maiúsculas e minúsculas)
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END FROM Curso c WHERE LOWER(c.nome) = LOWER(:nome)")
    boolean existsByNome(@Param("nome") String nome);
}
