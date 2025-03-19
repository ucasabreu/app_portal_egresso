package com.example.portalegresso.backend.model.repository;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.example.portalegresso.backend.model.entidades.Depoimento;
import com.example.portalegresso.backend.model.entidades.Egresso;
import com.example.portalegresso.backend.service.EgressoService;


@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public class DepoimentoRepositorioTest {
    @Autowired
    DepoimentoRepositorio repositorio;

    @Autowired
    EgressoService egressoService;

    @Autowired
    EgressoRepositorio egressoRepositorio;

    @Test
    public void testVerificarSalvarDepoimento() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .descricao("novadescricao")
                .foto("novafoto")
                .email("lucas90@gmail.com")
                .linkedin("https://www.linkedin.com/in/lucas")
                .instagram("https://www.instagram.com/lucas")
                .curriculo("meucurriculo")
                .build();
        Egresso egressoSalvo = egressoService.salvar(egresso);
        Depoimento depoimento = Depoimento.builder()
                .texto("algumtexto")
                .egresso(egressoSalvo)
                .build();
        Depoimento salvo = repositorio.save(depoimento);

        Assertions.assertNotNull(salvo);
        Assertions.assertEquals(depoimento.getTexto(), salvo.getTexto());
        
        repositorio.delete(salvo);
        egressoRepositorio.delete(egressoSalvo);
    }
}
