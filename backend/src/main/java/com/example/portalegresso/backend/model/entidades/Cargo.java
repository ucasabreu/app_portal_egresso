package com.example.portalegresso.backend.model.entidades;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table( name="cargo")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cargo {
    @Id
    @Column(name="id_cargo")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_cargo;

    @Column(name="descricao")
    private String descricao;

    @Column(name="local")
    private String local;
    
    @Min(value = 1900, message = "O ano de fim deve ser maior ou igual a 1900")
    @Max(value = 2100, message = "O ano de fim deve ser menor ou igual a 2100")
    @NotNull(message = "O ano de início é obrigatório")
    @Column(name="ano_inicio")
    private Integer ano_inicio;
    
   
    @Column(name="ano_fim")
    private Integer ano_fim;

    @ManyToOne
    @JoinColumn(name="id_egresso")
    private Egresso egresso;

    
}