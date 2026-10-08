package com.example.portalegresso.backend.model.entidades;

import java.time.Instant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rascunho_destaque")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RascunhoDestaque {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Version
    private Long versao;
    @ManyToOne(optional = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    @JoinColumn(name = "id_coordenador", nullable = false)
    private Coordenador coordenador;
    @ManyToOne
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    @JoinColumn(name = "id_egresso")
    private Egresso egresso;
    @Column(length = 100)
    private String titulo;
    @Column(columnDefinition = "TEXT")
    private String noticia;
    @Column(length = 255)
    private String feitoDestaque;
    @Column(columnDefinition = "TEXT")
    private String imagem;
    private Instant atualizadoEm;
}
