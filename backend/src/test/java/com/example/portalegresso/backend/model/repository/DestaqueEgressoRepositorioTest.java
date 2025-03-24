package com.example.portalegresso.backend.model.repository;

import com.example.portalegresso.backend.model.entidades.Coordenador;
import com.example.portalegresso.backend.model.entidades.DestaqueEgresso;
import com.example.portalegresso.backend.model.entidades.Egresso;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public class DestaqueEgressoRepositorioTest {

    @Autowired
    private DestaqueEgressoRepositorio destaqueRepo;

    @Autowired
    private EgressoRepositorio egressoRepo;

    @Autowired
    private CoordenadorRepositorio coordenadorRepo;

    @Test
    public void testSalvarDestaqueEgressoComRelacionamentos() {
        // Criando e salvando Egresso
        Egresso egresso = egressoRepo.save(Egresso.builder()
                .nome("Lucas Silva")
                .email("lucas@email.com")
                .build());

        // Criando e salvando Coordenador
        Coordenador coordenador = coordenadorRepo.save(Coordenador.builder()
                .login("coord1")
                .senha("1234")
                .tipo("coordenador")
                .build());

        // Criando destaque
        DestaqueEgresso destaque = DestaqueEgresso.builder()
                .titulo("Destaque Teste")
                .noticia("Notícia do destaque de Lucas.")
                .imagem("imagem.jpg")
                .feitoDestaque("Fundador da Startup XYZ")
                .egresso(egresso)
                .coordenador(coordenador)
                .build();

        // Salvando
        DestaqueEgresso salvo = destaqueRepo.save(destaque);

        // Assertions
        Assertions.assertNotNull(salvo.getId());
        Assertions.assertNotNull(salvo.getDataPublicacao());
        Assertions.assertEquals("Destaque Teste", salvo.getTitulo());
        Assertions.assertEquals("Lucas Silva", salvo.getEgresso().getNome());
        Assertions.assertEquals("coord1", salvo.getCoordenador().getLogin());

        // Limpeza
        destaqueRepo.delete(salvo);
        egressoRepo.delete(egresso);
        coordenadorRepo.delete(coordenador);
    }
}
