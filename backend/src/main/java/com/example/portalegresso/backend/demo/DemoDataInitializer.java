package com.example.portalegresso.backend.demo;

import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.portalegresso.backend.model.entidades.*;
import com.example.portalegresso.backend.model.repository.*;

import lombok.RequiredArgsConstructor;

@Component
@org.springframework.core.annotation.Order(0)
@Profile("demo")
@RequiredArgsConstructor
public class DemoDataInitializer implements ApplicationRunner {
    private final CoordenadorRepositorio coordenadores;
    private final CursoRepositorio cursos;
    private final EgressoRepositorio egressos;
    private final CursoEgressoRepositorio vinculos;
    private final CargoRepositorio cargos;
    private final DepoimentoRepositorio depoimentos;
    private final DestaqueEgressoRepositorio destaques;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // Uma única transação e banco inteiramente vazio evitam duplicação de dados
        // e preservam as edições feitas durante a apresentação.
        if (coordenadores.count() + cursos.count() + egressos.count() + vinculos.count()
                + cargos.count() + depoimentos.count() + destaques.count() > 0) {
            return;
        }
        coordenadores.save(Coordenador.builder()
                .login("admin.demo").senha("demo123").tipo("geral").build());
        Coordenador coordenador = coordenadores.save(Coordenador.builder()
                .login("coord.demo").senha("demo123").tipo("coordenador").build());
        List<Curso> listaCursos = cursos.saveAll(List.of(
                Curso.builder().nome("Ciência da Computação").nivel("Graduação").coordenador(coordenador).build(),
                Curso.builder().nome("Sistemas de Informação").nivel("Graduação").coordenador(coordenador).build(),
                Curso.builder().nome("Engenharia de Software").nivel("Especialização").coordenador(coordenador).build()));

        String[] nomes = {"Ana Martins", "Bruno Costa", "Carla Oliveira", "Diego Santos"};
        String[] emails = {"ana", "bruno", "carla", "diego"};
        String[] profissoes = {"Desenvolvedora Backend", "Desenvolvedor Frontend", "Analista de Dados", "Engenheiro de Software"};
        for (int i = 0; i < nomes.length; i++) {
            Egresso egresso = egressos.save(Egresso.builder()
                    .nome(nomes[i]).email(emails[i] + "@example.com")
                    .descricao("Perfil fictício de demonstração. Atuação em " + profissoes[i].toLowerCase() + ".")
                    .foto("/demo/avatar.svg").linkedin("").instagram("")
                    .curriculo("/demo/curriculo.html").build());
            vinculos.save(CursoEgresso.builder().egresso(egresso).curso(listaCursos.get(i % listaCursos.size()))
                    .ano_inicio(2016 + i).ano_fim(2020 + i).build());
            cargos.save(Cargo.builder().egresso(egresso).descricao(profissoes[i])
                    .local("Empresa Exemplo " + (i + 1)).ano_inicio(2021 + i).ano_fim(null).build());
            destaques.save(DestaqueEgresso.builder().egresso(egresso).coordenador(coordenador)
                    .titulo("Trajetória de " + nomes[i])
                    .noticia("Notícia fictícia de demonstração sobre projetos e experiências profissionais.")
                    .feitoDestaque("Participação em projetos de tecnologia")
                    .imagem("/demo/avatar.svg").build());
            depoimentos.save(Depoimento.builder().egresso(egresso)
                    .texto("A formação ampliou minhas oportunidades e me ajudou a construir projetos com outras pessoas.")
                    .build());
        }
    }
}
