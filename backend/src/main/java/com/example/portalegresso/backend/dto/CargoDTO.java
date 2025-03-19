package com.example.portalegresso.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CargoDTO {
    private Integer id_egresso;
    private String descricao;
    private String local;
    private Integer ano_inicio;
    private Integer ano_fim;
    
}
