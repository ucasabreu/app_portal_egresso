package com.example.portalegresso.backend.model.repository;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.example.portalegresso.backend.model.entidades.Coordenador;
import com.example.portalegresso.backend.model.entidades.Curso;
import com.example.portalegresso.backend.model.entidades.CursoEgresso;
import com.example.portalegresso.backend.model.entidades.Egresso;


@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public class CursoEgressoRepositorioTest {
    @Autowired
    CursoEgressoRepositorio repositorio;

    @Autowired
    CursoRepositorio cursoRepositorio;

    @Autowired
    EgressoRepositorio egressoRepositorio;

    @Autowired
    CoordenadorRepositorio coordenadorRepositorio;

    @Test
    public void testVerificarSalvarCursoEgresso() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .descricao("novadescricao")
                .foto("novafoto")
                .email("lucas03@gmail.com")
                .linkedin("https://www.linkedin.com/in/lucas")
                .instagram("https://www.instagram.com/lucas")
                .curriculo("meucurriculo")
                .build();
        Egresso egressoSalvo = egressoRepositorio.save(egresso);

        Coordenador coordenador = Coordenador.builder()
                .login("Mathias.Jose")
                .senha("1234")
                .tipo("esseeotipo")
                .build();
        Coordenador coordenadorSalvo = coordenadorRepositorio.save(coordenador);
        
        Curso curso = Curso.builder()
                .nome("ciencia da computacao")
                .nivel("graduacao")
                .coordenador(coordenadorSalvo)
                .build();
        Curso cursoSalvo = cursoRepositorio.save(curso);

        CursoEgresso cursoEgresso = CursoEgresso.builder()
                .ano_inicio(2004)
                .ano_fim(2024)
                .curso(cursoSalvo)
                .egresso(egressoSalvo)
                .build();

        CursoEgresso salvo = repositorio.save(cursoEgresso);

        Assertions.assertNotNull(salvo);
        Assertions.assertNotNull(salvo.getEgresso());
        Assertions.assertNotNull(salvo.getCurso());
        Assertions.assertEquals(cursoEgresso.getAno_inicio(), salvo.getAno_inicio());
        Assertions.assertEquals(cursoEgresso.getAno_fim(), salvo.getAno_fim());

        repositorio.delete(salvo);
        cursoRepositorio.delete(cursoSalvo);
        egressoRepositorio.delete(egressoSalvo);
        coordenadorRepositorio.delete(coordenadorSalvo);

    }
}
