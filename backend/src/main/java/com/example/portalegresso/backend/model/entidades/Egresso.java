package com.example.portalegresso.backend.model.entidades;

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
@Table( name="egresso")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Egresso {
    @Id
    @Column(name="id_egresso")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_egresso;

    @Column(name="nome")
    private String nome;

    @Column(name="email")
    private String email;

    @Column(name="descricao")
    private String descricao;

    @Column(name="foto")
    private String foto;

    @Column(name="linkedin")
    private String linkedin;

    @Column(name="instagram")
    private String instagram;

    @Column(name="curriculo")
    private String curriculo;

}