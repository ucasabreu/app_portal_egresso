package com.example.portalegresso.backend.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.portalegresso.backend.model.entidades.Cargo;
import com.example.portalegresso.backend.model.entidades.Egresso;


@Repository
public interface CargoRepositorio extends JpaRepository<Cargo,Integer> {

    @Query("SELECT c.egresso FROM Cargo c WHERE LOWER(c.descricao) LIKE LOWER(CONCAT('%', :cargo, '%'))")
    List<Egresso> findEgressosByCargoDescricao(@Param("cargo") String cargo);
    List<Cargo> findByEgresso(Egresso egresso);


    @org.springframework.data.jpa.repository.Query("select j from Cargo j join fetch j.egresso where j.egresso.id_egresso in :ids")
    java.util.List<com.example.portalegresso.backend.model.entidades.Cargo> forGraduates(java.util.List<Integer> ids);

}
