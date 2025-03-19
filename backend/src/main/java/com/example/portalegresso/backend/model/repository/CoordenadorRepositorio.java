package com.example.portalegresso.backend.model.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.portalegresso.backend.model.entidades.Coordenador;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



@Repository
public interface CoordenadorRepositorio extends JpaRepository<Coordenador, Integer> {
    Optional<Coordenador> findByLogin(String login); // deve ser testado
    boolean existsByLogin(String login);
    Optional<Coordenador> findBySenha(String senha);
    @Query("SELECT c FROM Coordenador c WHERE c.login = :login AND c.senha = :senha")
    Optional<Coordenador> findByLoginAndSenha(@Param("login") String login, @Param("senha") String senha);
}
