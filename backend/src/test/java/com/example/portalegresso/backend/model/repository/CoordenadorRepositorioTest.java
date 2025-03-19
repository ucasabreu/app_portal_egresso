package com.example.portalegresso.backend.model.repository;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.example.portalegresso.backend.model.entidades.Coordenador;



@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public class CoordenadorRepositorioTest {
    @Autowired
    CoordenadorRepositorio repositorio;


    @Test
    public void testVerificarSalvarCoordenador(){
        Coordenador coordenador = Coordenador.builder()
                                .login("coordenadorlogin")
                                .senha("1234")
                                .tipo("esseeotipo")
                                .build();

        Coordenador salvo = repositorio.save(coordenador);


        Assertions.assertNotNull(salvo);
        Assertions.assertEquals(coordenador.getId_coordenador(), salvo.getId_coordenador());
        Assertions.assertEquals(coordenador.getLogin(),salvo.getLogin());
        Assertions.assertEquals(coordenador.getSenha(),salvo.getSenha());
        Assertions.assertEquals(coordenador.getTipo(),salvo.getTipo());

        repositorio.delete(salvo);

    }
}
