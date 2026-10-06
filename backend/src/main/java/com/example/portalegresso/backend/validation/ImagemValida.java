package com.example.portalegresso.backend.validation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ImagemValidator.class)
public @interface ImagemValida {
    String message() default "Use uma URL HTTP(S), caminho local ou imagem JPEG, PNG ou WebP de até 2 MB";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
