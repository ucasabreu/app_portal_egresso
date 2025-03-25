package com.example.portalegresso.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CursoDTO {

    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "O nome  do cursro deve conter apenas letras e espaços")
    @NotNull(message = "Nome é obrigatório")
    private String nome;

    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "O nivel deve conter apenas letras e espaços")
    @NotNull(message = "Nivel é obrigatório")
    private String nivel;
    
    private Integer id_coordenador;
}
