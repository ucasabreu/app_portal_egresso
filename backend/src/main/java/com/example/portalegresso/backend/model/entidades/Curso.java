package com.example.portalegresso.backend.model.entidades;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="curso")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Curso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_curso")
    private Integer id_curso;

    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "O nome  do cursro deve conter apenas letras e espaços")
    @NotNull(message = "Nome é obrigatório")
    @Column(name="nome")
    private String nome;

    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "O nivel deve conter apenas letras e espaços")
    @NotNull(message = "Nivel é obrigatório")
    @Column(name="nivel")
    private String nivel;

    @ManyToOne
    @JoinColumn(name="id_coordenador")
    private Coordenador coordenador;
    

}
