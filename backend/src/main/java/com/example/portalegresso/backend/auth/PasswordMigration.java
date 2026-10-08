package com.example.portalegresso.backend.auth;

import java.util.Set;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.example.portalegresso.backend.model.repository.*;
import lombok.RequiredArgsConstructor;

@Component
@Order(10)
@RequiredArgsConstructor
public class PasswordMigration implements ApplicationRunner {
    private final CoordenadorRepositorio coordenadores;
    private final EgressoRepositorio egressos;
    private final PasswordHasher passwords;
    private final Environment environment;
    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        for (var person : coordenadores.findAll()) {
            if (person.getSenha() != null && !person.getSenha().isBlank() && !passwords.isEncoded(person.getSenha())) {
                person.setSenha(passwords.encode(person.getSenha())); coordenadores.save(person);
            }
        }
        // Only the explicitly fictional demo identities receive a public demo password.
        if (environment.matchesProfiles("demo")) {
            Set<String> emails = Set.of("ana@example.com", "bruno@example.com", "carla@example.com", "diego@example.com");
            for (var person : egressos.findAll()) {
                if (emails.contains(person.getEmail()) && person.getSenha() == null) {
                    person.setSenha(passwords.encode("demo123")); egressos.save(person);
                }
            }
        }
    }
}
