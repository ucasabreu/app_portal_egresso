package com.example.portalegresso.backend.service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.example.portalegresso.backend.model.entidades.Coordenador;
import com.example.portalegresso.backend.model.entidades.Curso;
import com.example.portalegresso.backend.model.repository.CoordenadorRepositorio;
import com.example.portalegresso.backend.model.repository.CursoRepositorio;


@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public class CoordenadorServiceTest {
    
    @Autowired
    CoordenadorService coordenadorService;

    @Autowired
    CoordenadorRepositorio repositorio;

    @Autowired
    CursoRepositorio cursoRepositorio;

    /*
     * Teste de restrições
     * - COORDENADOR
     *      -> deveGerarErroAoTentarSalvarCoordNulo
     *      -> deveGerarErroAoTentarSalvarCoordSemLogin
     *      -> deveGerarErroAoTentarSalvarCoordSemSenha
     *      -> degeGerarErroAoTentarSalvarCoordComMesmoLogin
     *      -> deveGerarErroAoTentarFazerLoginComLoginInexistente
     *      -> deveGerarErroAoTentarFazerLoginComSenhaIncorreta
     *      -> deveGerarErroAoTentarFazerLoginComLoginNulo
     *      -> deveGerarErroAoTentarFazerLoginComSenhaNula
     *      -> deveGererErroAoTentarSalvarCoordComTipoNulo
     */


    @Test
    public void deveGerarErroAoTentarFazerLoginComLoginInexistente(){
        Coordenador coord = Coordenador.builder()
                            .login("coordenadorlogin")
                            .senha("minhaSenha")
                            .tipo("esseeotipo")
                            .build();
        coordenadorService.salvar(coord);
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.efetuarLogin("loginInexistente", "minhaSenha"),"Erro de autenticação. Login não encontrado.");
        repositorio.delete(coord);
    }
    
    @Test
    public void deveGerarErroAoTentarFazerLoginComSenhaIncorreta(){
        Coordenador coord = Coordenador.builder()
                            .login("coordenadorlogin")
                            .senha("minhaSenha")
                            .tipo("esseeotipo")
                            .build();
        coordenadorService.salvar(coord);
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.efetuarLogin("coordenadorlogin", "senhaIncorreta"),"Erro de autenticação. Senha incorreta.");
        repositorio.delete(coord);
    }

    @Test 
    public void deveGerarErroAoTentarFazerLoginComLoginNulo(){
        Coordenador coord = Coordenador.builder()
                            .login("coordenadorlogin")
                            .senha("minhaSenha")
                            .tipo("esseeotipo")
                            .build();
        coordenadorService.salvar(coord);
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.efetuarLogin(null, "minhaSenha"),"Login deve ser informado.");
        repositorio.delete(coord);
    }

    @Test
    public void deveGerarErroAoTentarFazerLoginComSenhaNula(){
        Coordenador coord = Coordenador.builder()
                            .login("coordenadorlogin")
                            .senha("minhaSenha")
                            .tipo("esseeotipo")
                            .build();
        coordenadorService.salvar(coord);
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.efetuarLogin("coordenadorlogin", null),"Senha deve ser informada.");
        repositorio.delete(coord);
    }

    @Test
    public void deveGerarErroAoTentarEfetuarLoginCoordComMesmoLogin(){
        Coordenador coord = Coordenador.builder()
                            .login("coordenadorlogin")
                            .senha("minhaSenha")
                            .tipo("esseeotipo")
                            .build();
        coordenadorService.salvar(coord);
        Coordenador coord2 = Coordenador.builder()
                            .login("coordenadorlogin")
                            .senha("minhaSenha")
                            .tipo("esseeotipo")
                            .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.salvar(coord2),"Esse login ja existe");
        repositorio.delete(coord);
    }

    @Test
    public void deveGerarErroAoTentarSalvarCoordNulo(){
         Coordenador coord = Coordenador.builder()
                             .build();
         Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.salvar(coord),"Deve informar coordenador valido");
    }
 
    @Test
    public void deveGerarErroAoTentarSalvarCoordSemLogin(){
        Coordenador coord = Coordenador.builder()
                            .senha("null")
                            .tipo("esseeotipo")
                            .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.salvar(coord),"Deve informar um login valido");
    }

    @Test
    public void deveGerarErroAoTentarSalvarCoordSemSenha(){
        Coordenador coord = Coordenador.builder()
                            .login("loginCoordenador")
                            .tipo("esseeotipo")
                            .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.salvar(coord),"Deve informar uma senha");
    }

    @Test
    public void deveGererErroAoTentarSalvarCoordComTipoNulo(){
        Coordenador coord = Coordenador.builder()
                            .login("loginCoordenador")
                            .senha("senhaCoordenador")
                            .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.salvar(coord),"Deve informar um tipo");
    }

    
     /* 
     * - CURSO
     *      -> deveGerarErroAoTentarSalvarCursoNulo
     *      -> deveGerarErroAoTentarSalvarCursoSemNome
     *      -> deveGerarErroAoTentarSalvarCursoSemNivel
     *      -> deveGerarErroAoTentarSalvarCursoSemCoordenador
     *      -> deveGerarErroAoTentarSalvarCursoComMesmoNome
     *     -> deveGerarErroAoTentarSalvarCursoComCoordenadorQueNaoExiste
     */

    @Test
    public void deveGerarErroAoTentarSalvarCursoNulo(){
        Curso curso = Curso.builder().build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.salvar(curso), "Deve informar um curso válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarCursoSemNome(){
        Curso curso = Curso.builder()
                .nivel("Graduação")
                .coordenador(new Coordenador(1, "login", "senha", "tipo"))
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.salvar(curso), "Deve inserir um nome válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarCursoSemNivel(){
        Curso curso = Curso.builder()
                .nome("Curso de Teste")
                .coordenador(new Coordenador(1, "login", "senha", "tipo"))
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.salvar(curso), "Deve inserir um nível válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarCursoSemCoordenador(){
        Curso curso = Curso.builder()
                .nome("Curso de Teste")
                .nivel("Graduação")
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.salvar(curso), "Deve associar um coordenador válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarCursoComCoordenadorQueNaoExiste(){
        Curso curso = Curso.builder()
                .nome("Curso de Teste")
                .nivel("Graduação")
                .coordenador(new Coordenador(1, "login", "senha", "tipo"))
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> coordenadorService.salvar(curso), "Coordenador não encontrado.");
    }

    
   
     /* 
     * Teste de Funcionalidades
     * 
     *      -> deveEfetuarLoginCoordenador
     *      -> deveSalvarCoordenador
     *      -> deveSalvarCurso
     *      -> deveRemoverCoordenador
     *      -> deveRemoverCurso
     * 
     */

    @Test
    public void deveSalvarCoordenador(){
        Coordenador coord = Coordenador.builder()
                            .login("coordenadorlogin")
                            .senha("null")
                            .tipo("esseeotipo")
                            .build();
        Coordenador coordenadorSalvo = coordenadorService.salvar(coord);
        Assertions.assertNotNull(coordenadorSalvo);
        repositorio.delete(coordenadorSalvo);
    }

    @Test
    public void deveSalvarCurso(){
        Coordenador coord = Coordenador.builder()
                            .login("coordenadorlogin")
                            .senha("null")
                            .tipo("esseeotipo")
                            .build();
        Coordenador coordenadorSalvo = coordenadorService.salvar(coord);
        Curso curso = Curso.builder()
                    .nome("Curso de Teste")
                    .nivel("Graduação")
                    .coordenador(coordenadorSalvo)
                    .build();
        Curso cursoSalvo = coordenadorService.salvar(curso);
        Assertions.assertNotNull(cursoSalvo);
        cursoRepositorio.delete(cursoSalvo);
        repositorio.delete(coordenadorSalvo);
    }

    @Test
    public void deveEfetuarLoginCoordenador(){
        Coordenador coord = Coordenador.builder()
                            .login("coordenadorlogin")
                            .senha("senhaTeste")
                            .tipo("esseeotipo")
                            .build();
        Coordenador coordenadorSalvo = coordenadorService.salvar(coord);
        boolean loginAceito = coordenadorService.efetuarLogin("coordenadorlogin", "senhaTeste");
        Assertions.assertTrue(loginAceito);
        repositorio.delete(coordenadorSalvo);
    }   
     
    @Test
    public void deveRemoverCoordenador(){
        Coordenador coord = Coordenador.builder()
                            .login("coordenadorlogin")
                            .senha("senhaTeste")
                            .tipo("esseeotipo")
                            .build();
        Coordenador coordenadorSalvo = coordenadorService.salvar(coord);
        coordenadorService.remover(coordenadorSalvo);
        Assertions.assertFalse(repositorio.existsById(coordenadorSalvo.getId_coordenador()));
    }
    
    @Test
    public void deveRemoverCurso(){
        Coordenador coord = Coordenador.builder()
                            .login("coordenadorlogin")
                            .senha("senhaTeste")
                            .tipo("esseeotipo")
                            .build();
        Coordenador coordenadorSalvo = coordenadorService.salvar(coord);
        Curso curso = Curso.builder()
                    .nome("Curso de Teste")
                    .nivel("Graduação")
                    .coordenador(coordenadorSalvo)
                    .build();
        Curso cursoSalvo = coordenadorService.salvar(curso);
        coordenadorService.remover(cursoSalvo);
        Assertions.assertFalse(cursoRepositorio.existsById(cursoSalvo.getId_curso()));
        repositorio.delete(coordenadorSalvo);
    }
}
