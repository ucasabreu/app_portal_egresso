package com.example.portalegresso.backend.model.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.portalegresso.backend.model.entidades.Depoimento;
import com.example.portalegresso.backend.model.entidades.Egresso;



@Repository
public interface DepoimentoRepositorio extends JpaRepository<Depoimento,Integer>{
    // Para resultados limitados usando paginação
    @Query("SELECT d FROM Depoimento d ORDER BY d.data DESC")
    List<Depoimento> findRecentes(Pageable pageable);

    // Usando JPQL para filtrar pelo ano
    @Query("SELECT d FROM Depoimento d WHERE EXTRACT(YEAR FROM d.data) = :ano")
    List<Depoimento> findByAno(@Param("ano") Integer ano);
    
    // Para retornar todos os depoimentos ordenados por data
    List<Depoimento> findAllByOrderByDataDesc();

    List<Depoimento> findByEgresso(Egresso egresso);

    
}
