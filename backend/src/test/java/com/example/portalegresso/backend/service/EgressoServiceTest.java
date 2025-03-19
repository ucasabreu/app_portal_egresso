package com.example.portalegresso.backend.service;

import java.time.LocalDate;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.example.portalegresso.backend.model.entidades.Cargo;
import com.example.portalegresso.backend.model.entidades.Depoimento;
import com.example.portalegresso.backend.model.entidades.Egresso;
import com.example.portalegresso.backend.model.repository.CargoRepositorio;
import com.example.portalegresso.backend.model.repository.DepoimentoRepositorio;
import com.example.portalegresso.backend.model.repository.EgressoRepositorio;



@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public class EgressoServiceTest {

    @Autowired
    EgressoService egressoService;

    @Autowired
    EgressoRepositorio egressoRepositorio;

    @Autowired
    CargoRepositorio cargoRepositorio;

    @Autowired
    DepoimentoRepositorio depoimentoRepositorio;

    /*
     * - EGRESSO
     * -> deveGerarErroAoTentarSalvarEgressoNulo
     * -> deveGerarErroAoTentarSalvarEgressoSemNome
     * -> deveGerarErroAoTentarSalvarEgressoSemEmail
     * -> deveGerarErroAoTentarSalvarFormatoEmailIncorreto
     * -> deveGerarErroAoTentartSalvarComMesmoEmail
     * -> deveGerarErroAoTentarSalvarFormatoLinkedinIncorreto
     * ->
     * -> deveGerarErroAoTentarSalvarFormatoInstagramIncorreto
     * ->
     */

    @Test
    public void deveGerarErroAoTentarSalvarEgressoNulo() {
        Egresso egresso = Egresso.builder().build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(egresso),
                "Deve informar um egresso válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarEgressoSemNome() {
        Egresso egresso = Egresso.builder()
                .email("meuemail.com")
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(egresso),
                "Deve inserir um nome válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarEgressoSemEmail() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(egresso),
                "Deve inserir um email válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarFormatoEmailIncorreto() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .email("email_incorreto")
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(egresso),
                "Deve inserir um email no formato correto.");
    }

    @Test
    public void deveGerarErroAoTentartSalvarComMesmoEmail() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .email("meuemail.com")
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(egresso),
                "Esse email já está em uso.");

        egressoRepositorio.delete(egresso);
    }

    @Test
    public void deveGerarErroAoTentarSalvarFormatoLinkedinIncorreto() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .email("meuemail.com")
                .linkedin("linkedin_incorreto")
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(egresso),
                "Deve inserir um link do LinkedIn no formato correto.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarFormatoInstagramIncorreto() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .email("meuemail.com")
                .instagram("instagram_incorreto")
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(egresso),
                "Deve inserir um link do Instagram no formato correto.");
    }

    /*
     * - DEPOIMENTO
     * -> deveGerarErroAoTentarSalvarDepoimentoNulo
     * -> deveGerarErroAoTentarSalvarDepoimentoSemTexto
     * -> deveGerarErroAoTentarSalvarDepoimentoIncorreto
     * -> deveGerarErroAoTentarSalvarDepoimentoSemEgresso
     * -> deveGerarErroAoTentarSalvarDepoimentoComEgressoIncorreto
     */

    @Test
    public void deveGerarErroAoTentarSalvarDepoimentoNulo() {
        Depoimento depoimento = Depoimento.builder().build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(depoimento),
                "Deve informar um depoimento válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarDepoimentoSemTexto() {
        Depoimento depoimento = Depoimento.builder()
                .egresso(new Egresso(1, "lucas", "meuemail.com", "novadescricao", "novafoto", "linkparalinkedin",
                        "linkparainstagram", "meucurriculo"))
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(depoimento),
                "Deve inserir um texto válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarDepoimentoSemEgresso() {
        Depoimento depoimento = Depoimento.builder()
                .texto("Texto do depoimento")
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(depoimento),
                "Deve associar um egresso válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarDepoimentoComEgressoIncorreto() {
        Depoimento depoimento = Depoimento.builder()
                .texto("Texto do depoimento")
                .egresso(new Egresso(1, "lucas", "meuemail.com", "novadescricao", "novafoto", "linkparalinkedin",
                        "linkparainstagram", "meucurriculo"))
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(depoimento),
                "Egresso não encontrado com o ID: " + depoimento.getEgresso().getId_egresso());
    }

    /*
     * - CARGO
     * -> deveGerarErroAoTentarSalvarCargoSemNome
     * -> deveGerarErroAoTentarSalvarCargoSemDataInicio
     * -> deveGerarErroAoTentarSalvarCargoSemLocal
     * -> deveGerarErroAoTentarSalvarDataInicioIncorreto
     * -> deveGerarErroAoTentarSalvarDataFimIncorreto
     * -> deveGerarErroAoTentarSalvarCargoNulo
     * -> deveGerarErroAoTentarSalvarCargoComEgressoIncorreto
     * -> deveGerarErroAoTentarSalvarCargoComEgressoNulo
     */

    @Test
    public void deveGerarErroAoTentarSalvarCargoNulo() {
        Cargo cargo = Cargo.builder().build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(cargo),
                "Deve informar um cargo válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarCargoSemDescricao() {
        Cargo cargo = Cargo.builder()
                .egresso(new Egresso(1, "lucas", "meuemail.com", "novadescricao", "novafoto", "linkparalinkedin",
                        "linkparainstagram", "meucurriculo"))
                .local("esseeolocal")
                .ano_inicio(2006)
                .ano_fim(2024)
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(cargo),
                "Deve inserir uma descrição valida");
    }

    @Test
    public void deveGerarErroAoTentarSalvarCargoSemDataInicio() {
        Cargo cargo = Cargo.builder()
                .descricao("testeDescrição")
                .egresso(new Egresso(1, "lucas", "meuemail.com", "novadescricao", "novafoto", "linkparalinkedin",
                        "linkparainstagram", "meucurriculo"))
                .local("esseeolocal")
                .ano_fim(2024)
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(cargo),
                "Deve inserir uma data para o inicio do cargo");
    }

    @Test
    public void deveGerarErroAoTentarSalvarCargoSemLocal() {
        Cargo cargo = Cargo.builder()
                .descricao("testeDescrição")
                .egresso(new Egresso(1, "lucas", "meuemail.com", "novadescricao", "novafoto", "linkparalinkedin",
                        "linkparainstagram", "meucurriculo"))
                .ano_inicio(2006)
                .ano_fim(2024)
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(cargo),
                "Deve inserir qual é o local do cargo.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarDataInicioIncorreto() {
        Cargo cargo = Cargo.builder()
                .descricao("descricaoTeste")
                .egresso(new Egresso(1, "lucas", "meuemail.com", "novadescricao", "novafoto", "linkparalinkedin",
                        "linkparainstagram", "meucurriculo"))
                .local("esseeolocal")
                .ano_inicio(19)
                .ano_fim(2024)
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(cargo),
                "Deve inserir um valor inicial válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarDataFimIncorreto() {
        Cargo cargo = Cargo.builder()
                .descricao("descricaoTeste")
                .egresso(new Egresso(1, "lucas", "meuemail.com", "novadescricao", "novafoto", "linkparalinkedin",
                        "linkparainstagram", "meucurriculo"))
                .local("esseeolocal")
                .ano_inicio(2020)
                .ano_fim(2019)
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(cargo),
                "Deve inserir um valor final válido.");
    }

    @Test
    public void deveGerarErroAoTentarSalvarCargoComEgressoIncorreto() {
        Cargo cargo = Cargo.builder()
                .descricao("descricaoTeste")
                .egresso(new Egresso(1, "lucas", "meuemail.com", "novadescricao", "novafoto", "linkparalinkedin",
                        "linkparainstagram", "meucurriculo"))
                .local("esseeolocal")
                .ano_inicio(2020)
                .ano_fim(2024)
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(cargo),
                "Egresso não encontrado com o ID: " + cargo.getEgresso().getId_egresso());
    }

    @Test
    public void deveGerarErroAoTentarSalvarCargoComEgressoNulo() {
        Cargo cargo = Cargo.builder()
                .descricao("descricaoTeste")
                .local("esseeolocal")
                .ano_inicio(2020)
                .ano_fim(2024)
                .build();
        Assertions.assertThrows(RegraNegocioRunTime.class, () -> egressoService.salvar(cargo),
                "Deve associar um egresso válido.");
    }

    /*
     * Teste de Funcionalidades
     * 
     * -> deveSalvarCargo
     * -> deveSalvarDepoimento
     * -> deveSalvarEgresso
     * 
     * 
     */

    @Test
    public void deveSalvarEgresso() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .descricao("novadescricao")
                .foto("novafoto")
                .email("lucas05@gmail.com")
                .linkedin("https://www.linkedin.com/in/lucas")
                .instagram("https://www.instagram.com/lucas")
                .curriculo("meucurriculo")
                .build();
        Egresso egressoSalvo = egressoService.salvar(egresso);
        Assertions.assertNotNull(egressoSalvo);
        egressoRepositorio.delete(egressoSalvo);

    }

    @Test
    public void deveSalvarCargo() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .descricao("novadescricao")
                .foto("novafoto")
                .email("lucas05@gmail.com")
                .linkedin("https://www.linkedin.com/in/lucas")
                .instagram("https://www.instagram.com/lucas")
                .curriculo("meucurriculo")
                .build();
        Egresso egressoSalvo = egressoService.salvar(egresso);
        Assertions.assertNotNull(egressoSalvo);

        Cargo cargo = Cargo.builder()
                .descricao("descricaoTeste")
                .egresso(egressoSalvo)
                .local("esseeolocal")
                .ano_inicio(2020)
                .ano_fim(2024)
                .build();
        Cargo cargoSalvo = egressoService.salvar(cargo);
        Assertions.assertNotNull(cargoSalvo);

        cargoRepositorio.delete(cargoSalvo);
        egressoRepositorio.delete(egressoSalvo);
    }

    @Test
    public void deveSalvarDepoimento() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .email("lucas05@gmail.com")
                .linkedin("https://www.linkedin.com/in/lucas")
                .instagram("https://www.instagram.com/lucas")
                .curriculo("meucurriculo")
                .descricao("novadescricao")
                .foto("novafoto")
                .build();
        Egresso egressoSalvo = egressoService.salvar(egresso);
        Depoimento depoimento = Depoimento.builder()
                .texto("Texto do depoimento")
                .egresso(egresso)
                .build();
        Depoimento depoimentoSalvo = egressoService.salvar(depoimento);
        Assertions.assertNotNull(depoimentoSalvo);
        depoimentoRepositorio.delete(depoimentoSalvo);
        egressoRepositorio.delete(egressoSalvo);
    }

    @Test
    public void deveRemoverEgresso() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .email("lucas04@gmail.com")
                .linkedin("https://www.linkedin.com/in/lucas")
                .instagram("https://www.instagram.com/lucas")
                .curriculo("meucurriculo")
                .descricao("novadescricao")
                .foto("novafoto")
                .build();
        Egresso egressoSalvo = egressoService.salvar(egresso);
        egressoService.remover(egressoSalvo);
        Assertions.assertThrows(RegraNegocioRunTime.class,
                () -> egressoService.buscarEgressoPorId(egressoSalvo.getId_egresso()),
                "Egresso não encontrado com o ID: " + egressoSalvo.getId_egresso());
    }

    @Test
    public void deveRemoverCargo() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .email("lucas05@gmail.com")
                .linkedin("https://www.linkedin.com/in/lucas")
                .instagram("https://www.instagram.com/lucas")
                .curriculo("meucurriculo")
                .descricao("novadescricao")
                .foto("novafoto")
                .build();
        Egresso egressoSalvo = egressoService.salvar(egresso);
        Cargo cargo = Cargo.builder()
                .descricao("descricaoTeste")
                .egresso(egressoSalvo)
                .local("esseeolocal")
                .ano_inicio(2020)
                .ano_fim(2024)
                .build();
        Cargo cargoSalvo = egressoService.salvar(cargo);
        egressoService.remover(cargoSalvo);
        Assertions.assertThrows(RegraNegocioRunTime.class,
                () -> egressoService.buscarCargoPorId(cargoSalvo.getId_cargo()),
                "Cargo não encontrado com o ID: " + cargoSalvo.getId_cargo());
        egressoRepositorio.delete(egressoSalvo);
    }

    @Test
    public void deveRemoverDepoimento() {
        Egresso egresso = Egresso.builder()
                .nome("Lucas")
                .email("lucas05@gmail.com")
                .linkedin("https://www.linkedin.com/in/lucas")
                .instagram("https://www.instagram.com/lucas")
                .curriculo("meucurriculo")
                .descricao("novadescricao")
                .foto("novafoto")
                .build();
        Egresso egressoSalvo = egressoService.salvar(egresso);
        Depoimento depoimento = Depoimento.builder()
                .texto("Texto do depoimento")
                .egresso(egresso)
                .build();
        Depoimento depoimentoSalvo = egressoService.salvar(depoimento);
        egressoService.remover(depoimentoSalvo);
        Assertions.assertThrows(RegraNegocioRunTime.class,
                () -> egressoService.buscarDepoimentoPorId(depoimentoSalvo.getId_depoimento()),
                "Depoimento não encontrado com o ID: " + depoimentoSalvo.getId_depoimento());
        egressoRepositorio.delete(egressoSalvo);
    }

}
