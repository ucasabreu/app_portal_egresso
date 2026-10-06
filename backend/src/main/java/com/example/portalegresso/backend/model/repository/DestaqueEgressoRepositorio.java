package com.example.portalegresso.backend.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.portalegresso.backend.model.entidades.DestaqueEgresso;
import com.example.portalegresso.backend.model.entidades.Egresso;

@Repository
public interface DestaqueEgressoRepositorio extends JpaRepository<DestaqueEgresso,Long>{
    @Query("SELECT d FROM DestaqueEgresso d " +
       "JOIN d.egresso e " +
       "LEFT JOIN CursoEgresso ce ON ce.egresso.id_egresso = e.id_egresso " +
       "LEFT JOIN Curso c ON ce.curso.id_curso = c.id_curso " +
       "WHERE LOWER(e.nome) LIKE LOWER(CONCAT('%', :nomeOuCurso, '%')) " +
       "OR LOWER(c.nome) LIKE LOWER(CONCAT('%', :nomeOuCurso, '%'))")
    List<DestaqueEgresso> buscarPorNomeOuCurso(@Param("nomeOuCurso") String nomeOuCurso);
    List<DestaqueEgresso> findByEgresso(Egresso egresso);;

    @Query(value = """
        select d from DestaqueEgresso d join fetch d.egresso e join fetch d.coordenador where
        (:nome = '' or lower(e.nome) like lower(concat('%', :nome, '%')) or
        exists (select ce.id_curso_egresso from CursoEgresso ce where ce.egresso = e and lower(ce.curso.nome) like lower(concat('%', :nome, '%'))))
        """, countQuery = """
        select count(d) from DestaqueEgresso d where
        (:nome = '' or lower(d.egresso.nome) like lower(concat('%', :nome, '%')) or
        exists (select ce.id_curso_egresso from CursoEgresso ce where ce.egresso = d.egresso and lower(ce.curso.nome) like lower(concat('%', :nome, '%'))))
        """)
    org.springframework.data.domain.Page<DestaqueEgresso> gallery(String nome, org.springframework.data.domain.Pageable pageable);
    @Query("select d from DestaqueEgresso d join fetch d.egresso join fetch d.coordenador c where c.id_coordenador = :coordinator order by d.dataPublicacao desc, d.id desc")
    List<DestaqueEgresso> managedHighlights(Integer coordinator);

}
