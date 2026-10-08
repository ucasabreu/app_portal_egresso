package com.example.portalegresso.backend.model.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.portalegresso.backend.model.entidades.RascunhoDestaque;

public interface RascunhoDestaqueRepositorio extends JpaRepository<RascunhoDestaque, Long> {
    @org.springframework.data.jpa.repository.Query("select r from RascunhoDestaque r where r.coordenador.id_coordenador = :id order by r.atualizadoEm desc")
    List<RascunhoDestaque> findOwned(Integer id);
}
