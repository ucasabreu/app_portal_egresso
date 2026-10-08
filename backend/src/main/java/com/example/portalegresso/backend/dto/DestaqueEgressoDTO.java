package com.example.portalegresso.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.example.portalegresso.backend.validation.ImagemValida;
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

    @NotBlank(message = "O título é obrigatório")
    @Size(max = 100, message = "O título deve ter no máximo 100 caracteres")
    @Pattern(regexp = "^[A-Za-zÀ-ÿ0-9\\s]+$", message = "O título deve conter apenas letras, números e espaços")
    private String titulo;

    @NotBlank(message = "A noticia é obrigatório")
    private String noticia;

    @ImagemValida
    private String imagem;

    @NotBlank(message = "O feito é obrigatório")
    @Size(max = 255, message = "O feito deve ter no máximo 255 caracteres")
    private String feitoDestaque;
}
