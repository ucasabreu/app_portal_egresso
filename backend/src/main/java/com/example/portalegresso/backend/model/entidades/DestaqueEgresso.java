package com.example.portalegresso.backend.model.entidades;

import java.time.LocalDate;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "destaque_egresso")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class DestaqueEgresso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_destaque")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_egresso", nullable = false)
    private Egresso egresso; // Relacionamento com o Egresso

    @ManyToOne
    @JoinColumn(name = "id_coordenador", nullable = false)
    private Coordenador coordenador; // Relacionamento com o Coordenador

    @NotBlank(message = "O título é obrigatório")
    @Size(max = 100, message = "O título deve ter no máximo 100 caracteres")
    @Pattern(regexp = "^[A-Za-zÀ-ÿ0-9\\s]+$", message = "O título deve conter apenas letras, números e espaços")
    @Column(name = "titulo")
    private String titulo;

    @Column(name = "noticia", columnDefinition = "TEXT")
    private String noticia;

    @CreatedDate
    @Column(name = "data_publicacao", updatable = false)
    private LocalDate dataPublicacao;

    @Column(name = "imagem")
    private String imagem;

    @Column(name = "feito_destaque")
    private String feitoDestaque;
}
