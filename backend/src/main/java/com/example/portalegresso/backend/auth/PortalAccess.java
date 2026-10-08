package com.example.portalegresso.backend.auth;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface PortalAccess {
    Policy value();
    enum Policy { PUBLIC, SESSION, ADMIN, ADMIN_OTHER_COORDINATOR, SELF_COORDINATOR, PROFILE, CARGO, DEPOIMENTO, FORMATION, CREATE_HIGHLIGHT, HIGHLIGHT, COORDINATOR }
}
