package com.example.portalegresso.backend.validation;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ImagemValidator implements ConstraintValidator<ImagemValida, String> {
    public static final int MAX_BYTES = 2 * 1024 * 1024;
    private static final int MAX_ENCODED_LENGTH = 4 * ((MAX_BYTES + 2) / 3);

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) return true;
        if (value.startsWith("data:")) return validDataImage(value);
        if (value.length() > 2048 || value.contains("\\")) return false;
        try {
            URI uri = URI.create(value);
            if (uri.isAbsolute()) {
                return ("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
                        && uri.getHost() != null && uri.getUserInfo() == null;
            }
            // Keep root-relative demo assets valid; do not accept another host or traversal.
            return value.startsWith("/") && !value.startsWith("//")
                    && uri.normalize().getPath().equals(uri.getPath()) && !uri.getPath().contains("/../");
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private boolean validDataImage(String value) {
        int comma = value.indexOf(',');
        if (comma < 0 || comma > 30 || value.length() - comma - 1 > MAX_ENCODED_LENGTH) return false;
        String header = value.substring(0, comma);
        if (!header.matches("data:image/(jpeg|png|webp);base64")) return false;
        try {
            byte[] bytes = Base64.getDecoder().decode(value.substring(comma + 1));
            if (bytes.length == 0 || bytes.length > MAX_BYTES) return false;
            return switch (header) {
                case "data:image/jpeg;base64" -> bytes.length >= 3 && (bytes[0] & 255) == 255
                        && (bytes[1] & 255) == 216 && (bytes[2] & 255) == 255;
                case "data:image/png;base64" -> bytes.length >= 8 && (bytes[0] & 255) == 137
                        && bytes[1] == 80 && bytes[2] == 78 && bytes[3] == 71
                        && bytes[4] == 13 && bytes[5] == 10 && bytes[6] == 26 && bytes[7] == 10;
                case "data:image/webp;base64" -> bytes.length >= 12
                        && "RIFF".equals(new String(bytes, 0, 4, StandardCharsets.US_ASCII))
                        && "WEBP".equals(new String(bytes, 8, 4, StandardCharsets.US_ASCII));
                default -> false;
            };
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }
}
