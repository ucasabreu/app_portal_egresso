package com.example.portalegresso.backend.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DestaqueEgressoDTO {
    private Long id;
    private Integer id_egresso;
    private Integer id_coordenador;

    @Pattern(regexp = "^[A-Za-zÀ-ÿ\\s]+$", message = "O titulo deve conter apenas letras e espaços")
    private String titulo;
    
    private String noticia;
    private String imagem;
    private String feitoDestaque;
}
