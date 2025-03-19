package com.example.portalegresso.backend.dto;

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
    private Integer ano_inicio;
    private Integer ano_fim;
}
