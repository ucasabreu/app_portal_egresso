package com.example.portalegresso.backend.dto;

import jakarta.validation.constraints.Size;
import com.example.portalegresso.backend.validation.ImagemValida;

public record RascunhoDTO(Integer id_egresso, @Size(max = 100) String titulo,
                         @Size(max = 100_000) String noticia, @Size(max = 255) String feitoDestaque,
                         @ImagemValida String imagem, Long versao) {}
