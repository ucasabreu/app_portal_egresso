package com.example.portalegresso.backend.validation;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Base64;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.example.portalegresso.backend.dto.DestaqueEgressoDTO;
import com.example.portalegresso.backend.dto.EgressoDTO;
import jakarta.validation.Validation;

class ImagemValidatorTest {
    private final ImagemValidator validator = new ImagemValidator();

    private String image(String format, byte[] bytes) {
        return "data:image/" + format + ";base64," + Base64.getEncoder().encodeToString(bytes);
    }

    @Test
    void deveAceitarImagensOpcionaisUrlsEDemoSemConsultarARede() {
        for (String value : List.of("", " ", "https://example.test/photo.png", "http://example.test/photo.jpg", "/demo/avatar.svg")) {
            assertTrue(validator.isValid(value, null), value);
        }
        assertTrue(validator.isValid(null, null));
    }

    @Test
    void deveRejeitarProtocolosConteudoAtivoEReferenciasInvalidas() {
        for (String value : List.of("javascript:alert(1)", "file:///tmp/photo", "//example.test/photo",
                "https://user:secret@example.test/photo", "/demo/../photo", "data:image/svg+xml;base64,PHN2Zz4=",
                "data:image/png;base64,invalid!", image("jpeg", new byte[]{1, 2, 3}), image("png", new byte[0]))) {
            assertFalse(validator.isValid(value, null), value);
        }
    }

    @Test
    void deveConferirAssinaturaDoFormatoInformado() {
        byte[] png = {(byte)137, 80, 78, 71, 13, 10, 26, 10};
        byte[] jpeg = {(byte)255, (byte)216, (byte)255};
        byte[] webp = "RIFFxxxxWEBP".getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        assertTrue(validator.isValid(image("png", png), null));
        assertTrue(validator.isValid(image("jpeg", jpeg), null));
        assertTrue(validator.isValid(image("webp", webp), null));
        assertFalse(validator.isValid(image("png", jpeg), null));
    }

    @Test
    void deveAplicarLimiteNosBytesDecodificados() {
        byte[] limit = new byte[ImagemValidator.MAX_BYTES];
        limit[0] = (byte)255; limit[1] = (byte)216; limit[2] = (byte)255;
        assertTrue(validator.isValid(image("jpeg", limit), null));
        byte[] oversized = java.util.Arrays.copyOf(limit, limit.length + 1);
        assertFalse(validator.isValid(image("jpeg", oversized), null));
    }

    @Test
    void deveValidarFotoEImagemNosContratosHttp() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var beanValidator = factory.getValidator();
            var profile = EgressoDTO.builder().foto("javascript:alert(1)").build();
            assertTrue(beanValidator.validate(profile).stream().anyMatch(error -> error.getPropertyPath().toString().equals("foto")));
            var highlight = DestaqueEgressoDTO.builder().titulo("Conquista").noticia("Notícia")
                    .feitoDestaque("x".repeat(256)).imagem("data:image/svg+xml;base64,PHN2Zz4=").build();
            var fields = beanValidator.validate(highlight).stream().map(error -> error.getPropertyPath().toString()).toList();
            assertTrue(fields.containsAll(List.of("imagem", "feitoDestaque")));
        }
    }
}
