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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="depoimento")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Depoimento {
    @Id
    @Column(name="id_depoimento")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_depoimento;

    @ManyToOne
    @JoinColumn(name="id_egresso")
    private Egresso egresso;

    @Column(name="texto", columnDefinition = "TEXT")
    private String texto;
    
    @CreatedDate
    @Column(name="data", updatable = false)
    private LocalDate data;
}
