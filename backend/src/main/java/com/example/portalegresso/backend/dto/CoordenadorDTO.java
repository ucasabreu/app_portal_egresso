package com.example.portalegresso.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CoordenadorDTO {
    
    @NotBlank(message = "O login é obrigatório")
    @Size(min = 4, max = 20, message = "O login deve ter entre 4 e 20 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9._]+$", message = "O login deve conter apenas letras, números, pontos ou underline")
    private String login;
    
    private String senha;

    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "O tipo deve conter apenas letras e espaços")
    private String tipo;
}
