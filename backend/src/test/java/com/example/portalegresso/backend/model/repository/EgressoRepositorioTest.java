package com.example.portalegresso.backend.model.repository;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.example.portalegresso.backend.model.entidades.Egresso;


@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public class EgressoRepositorioTest {
    @Autowired
    EgressoRepositorio repositorio;

    @Test
    public void testVerificarSalvarEgresso(){
        Egresso egresso = Egresso.builder()
                        .nome("lucas")
                        .descricao("novadescricao")
                        .foto("novafoto")
                        .email("meuemail.com")
                        .linkedin("linkparalinkedin")
                        .instagram("linkparainstagram")
                        .curriculo("meucurriculo")
                        .build();

        Egresso salvo = repositorio.save(egresso);
        
        Assertions.assertNotNull(salvo);
        Assertions.assertEquals(egresso.getNome(), salvo.getNome());
        Assertions.assertEquals(egresso.getDescricao(), salvo.getDescricao());
        Assertions.assertEquals(egresso.getFoto(), salvo.getFoto());
        Assertions.assertEquals(egresso.getEmail(), salvo.getEmail());
        Assertions.assertEquals(egresso.getLinkedin(), salvo.getLinkedin());
        Assertions.assertEquals(egresso.getInstagram(), salvo.getInstagram());
        Assertions.assertEquals(egresso.getCurriculo(), salvo.getCurriculo());
        
        repositorio.delete(salvo);
    }
}
