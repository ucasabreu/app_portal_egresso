package com.example.portalegresso.backend.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class CursoEgressoDTO {
    private Integer id_egresso;
    private Integer id_curso;

    @Min(value = 1900, message = "O ano de fim deve ser maior ou igual a 1900")
    @Max(value = 2100, message = "O ano de fim deve ser menor ou igual a 2100")
    @NotNull(message = "O ano de início é obrigatório")
    private Integer ano_inicio;

    
    private Integer ano_fim;
}
