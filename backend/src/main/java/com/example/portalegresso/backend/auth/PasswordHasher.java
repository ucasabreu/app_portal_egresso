package com.example.portalegresso.backend.auth;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import org.springframework.stereotype.Component;

/** Uses the JDK implementation of PBKDF2; never accepts plaintext on login. */
@Component
public class PasswordHasher {
    private static final String PREFIX = "pbkdf2-sha256$";
    private static final int ITERATIONS = 600_000;
    private final SecureRandom random = new SecureRandom();

    public boolean isEncoded(String value) { return value != null && value.startsWith(PREFIX); }

    public String encode(String password) {
        if (password == null || password.isBlank() || password.length() > 128)
            throw new IllegalArgumentException("Informe uma senha válida de até 128 caracteres.");
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return PREFIX + ITERATIONS + "$" + Base64.getEncoder().encodeToString(salt)
                + "$" + Base64.getEncoder().encodeToString(derive(password, salt, ITERATIONS));
    }

    public boolean matches(String password, String encoded) {
        if (password == null || password.length() > 128 || !isEncoded(encoded)) return false;
        try {
            String[] parts = encoded.split("\\$");
            if (parts.length != 4 || Integer.parseInt(parts[1]) != ITERATIONS) return false;
            byte[] salt = Base64.getDecoder().decode(parts[2]);
            byte[] expected = Base64.getDecoder().decode(parts[3]);
            return salt.length == 16 && expected.length == 32
                    && MessageDigest.isEqual(expected, derive(password, salt, ITERATIONS));
        } catch (IllegalArgumentException error) { return false; }
    }

    private byte[] derive(String password, byte[] salt, int iterations) {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, 256);
        try { return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded(); }
        catch (java.security.GeneralSecurityException error) { throw new IllegalStateException("PBKDF2 indisponível", error); }
        finally { spec.clearPassword(); }
    }
}
