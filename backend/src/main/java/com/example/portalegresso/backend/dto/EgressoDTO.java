package com.example.portalegresso.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EgressoDTO {

    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "O nome deve conter apenas letras e espaços")
    private String nome;

    @Email(message = "Email inválido")
    private String email;

    private String descricao;
    private String foto;

    @Pattern(regexp = "^(https?:\\/\\/)?([\\w]+\\.)?linkedin\\.com\\/.*$", message = "Informe um link válido do LinkedIn")
    private String linkedin;

    @Pattern(regexp = "^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/.*$", message = "Informe um link válido do Instagram")
    private String instagram;
    
    private String curriculo;

}
