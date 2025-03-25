package com.example.portalegresso.backend.model.entidades;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "egresso")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Egresso {

    @Id
    @Column(name = "id_egresso")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_egresso;

    @NotBlank(message = "O nome é obrigatório")
    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "O nome deve conter apenas letras e espaços")
    @Column(name = "nome")
    private String nome;

    @Email(message = "Email inválido")
    @Column(name = "email")
    private String email;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "foto")
    private String foto;

    @Pattern(regexp = "^(https?:\\/\\/)?([\\w]+\\.)?linkedin\\.com\\/.*$", message = "Informe um link válido do LinkedIn")
    @Column(name = "linkedin")
    private String linkedin;

    @Pattern(regexp = "^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/.*$", message = "Informe um link válido do Instagram")
    @Column(name = "instagram")
    private String instagram;

    @Column(name = "curriculo")
    private String curriculo;
}
