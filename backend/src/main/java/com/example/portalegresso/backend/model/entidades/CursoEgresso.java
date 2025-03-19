package com.example.portalegresso.backend.model.entidades;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name="curso_egresso")//*verificar se deve ser o nome da tabela do banco == o nome da classe */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursoEgresso {
    @Id
    @Column(name="id_curso_egresso")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_curso_egresso;

    @ManyToOne
    @JoinColumn(name="id_egresso")
    private Egresso egresso;

    @ManyToOne
    @JoinColumn(name="id_curso")
    private Curso curso;

    @Column(name="ano_inicio")
    private Integer ano_inicio;

    @Column(name="ano_fim")
    private Integer ano_fim;





}
