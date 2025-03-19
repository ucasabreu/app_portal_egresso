package com.example.portalegresso.backend.model.entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="coordenador")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coordenador {
    @Id
    @Column(name="id_coordenador")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_coordenador;

    @Column(name="login")
    private String login;

    @Column(name="senha")
    @JsonIgnore
    private String senha;

    @Column(name="tipo")
    private String tipo;
}
