package com.example.portalegresso.backend.auth;

import java.io.Serializable;

public record SessionUser(Integer id, String role, String login, String nome) implements Serializable {
    public boolean admin() { return "geral".equals(role); }
    public boolean coordinator() { return admin() || "coordenador".equals(role); }
}
