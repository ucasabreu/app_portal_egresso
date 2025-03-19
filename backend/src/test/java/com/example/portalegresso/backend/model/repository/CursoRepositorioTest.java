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
import com.example.portalegresso.backend.service.CoordenadorService;



@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public class CursoRepositorioTest {
    @Autowired
    CursoRepositorio repositorio;

    @Autowired
    CoordenadorRepositorio coordenadorRepositorio;

    @Autowired
    CoordenadorService coordenadorService;


    @Test
    public void testVerificarSalvarCurso(){
        Coordenador coordenador = Coordenador.builder()
                               .login("Mathias.Jose")
                               .senha("1234")
                               .tipo("coordenadortipoteste")
                               .build();

        Coordenador coordenadorSalvo = coordenadorService.salvar(coordenador);
        Curso curso = Curso.builder()
                      .nome("ciencia da computacao")
                      .coordenador(coordenadorSalvo)
                      .nivel("graduacao")
                      .build();

        Curso salvo = repositorio.save(curso);


        Assertions.assertNotNull(salvo);
        Assertions.assertEquals(curso.getNome(),salvo.getNome());
        Assertions.assertEquals(curso.getNivel(), salvo.getNivel());
        Assertions.assertNotNull(salvo.getCoordenador());

        repositorio.delete(salvo);
        coordenadorRepositorio.delete(coordenadorSalvo);

    }
}
