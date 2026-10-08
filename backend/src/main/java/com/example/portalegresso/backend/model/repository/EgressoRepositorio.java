package com.example.portalegresso.backend.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.portalegresso.backend.model.entidades.Egresso;



@Repository
public interface EgressoRepositorio extends JpaRepository<Egresso,Integer>{
    boolean existsByEmail(String email);
    Optional<Egresso> findByEmail(String email);
    Optional<Egresso> findByEmailIgnoreCase(String email);
    
    List<Egresso> findByNomeContainingIgnoreCase(String nome);

    List<Egresso> findByNome(String nome);

    

    @org.springframework.data.jpa.repository.Query("""
        select e from Egresso e where
        (:nome = '' or lower(e.nome) like lower(concat('%', :nome, '%'))) and
        (:curso = '' or exists (select ce.id_curso_egresso from CursoEgresso ce where ce.egresso = e and lower(ce.curso.nome) like lower(concat('%', :curso, '%')))) and
        (:cargo = '' or exists (select j.id_cargo from Cargo j where j.egresso = e and lower(j.descricao) like lower(concat('%', :cargo, '%')))) and
        (:anoInicio is null or exists (select ce.id_curso_egresso from CursoEgresso ce where ce.egresso = e and ce.ano_inicio = :anoInicio)) and
        (:anoFim is null or exists (select ce.id_curso_egresso from CursoEgresso ce where ce.egresso = e and ce.ano_fim = :anoFim))
        """)
    org.springframework.data.domain.Page<Egresso> directory(String nome, String curso, String cargo, Integer anoInicio, Integer anoFim, org.springframework.data.domain.Pageable pageable);

}
