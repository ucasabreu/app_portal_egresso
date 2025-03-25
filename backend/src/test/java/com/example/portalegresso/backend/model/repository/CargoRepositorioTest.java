package com.example.portalegresso.backend.model.repository;


import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.example.portalegresso.backend.model.entidades.Cargo;
import com.example.portalegresso.backend.model.entidades.Egresso;
import com.example.portalegresso.backend.service.EgressoService;


@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public class CargoRepositorioTest {
    @Autowired
    CargoRepositorio repositorio;

    @Autowired
    EgressoRepositorio egressoRepositorio;

    @Autowired
    EgressoService egressoService;

    @Test
    public void testVerificarSalvarCargo(){
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .descricao("novadescricao")
                .foto("novafoto")
                .email("lucas03@gmail.com")
                .linkedin("https://www.linkedin.com/in/lucas")
                .instagram("https://www.instagram.com/lucas")
                .curriculo("meucurriculo")
                .build();
        Egresso egressoSalvo = egressoService.salvar(egresso);
         // Cenário
        Cargo cargo = Cargo.builder()
                .descricao("testedescricao")
                .egresso(egressoSalvo)
                .local("esseeolocal")
                .ano_inicio(2024)
                .ano_fim(2022)
                .build();

        // Ação
        Cargo salvo = repositorio.save(cargo);

        // Verificação
        Assertions.assertNotNull(salvo);
        Assertions.assertNotNull(salvo.getEgresso());
        Assertions.assertEquals(cargo.getAno_inicio(), salvo.getAno_inicio()); 
        Assertions.assertEquals(cargo.getAno_fim(), salvo.getAno_fim());
        Assertions.assertEquals(cargo.getDescricao(), salvo.getDescricao());
        Assertions.assertEquals(cargo.getLocal(), salvo.getLocal());
        
        repositorio.delete(salvo);
        egressoRepositorio.delete(egressoSalvo);
    }
}