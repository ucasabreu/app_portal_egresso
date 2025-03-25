package com.example.portalegresso.backend.model.entidades;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "coordenador")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coordenador {
    @Id
    @Column(name = "id_coordenador")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_coordenador;

    @Column(name = "login", unique = true)
    @NotBlank(message = "O login é obrigatório")
    @Size(min = 4, max = 20, message = "O login deve ter entre 4 e 20 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9._]+$", message = "O login deve conter apenas letras, números, pontos ou underline")
    private String login;

    @Column(name = "senha")
    @JsonIgnore
    private String senha;

    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "O tipo deve conter apenas letras e espaços")
    @Column(name = "tipo")
    private String tipo;
}
