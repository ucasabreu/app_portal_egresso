package com.example.portalegresso.backend.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.portalegresso.backend.service.RegraNegocioRunTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<?> handleIntegrity(Exception error) {
        return ResponseEntity.status(409).body(Map.of("message", "O registro já existe ou possui vínculos que impedem esta operação."));
    }
    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<?> handleStatus(org.springframework.web.server.ResponseStatusException error) {
        return ResponseEntity.status(error.getStatusCode()).body(Map.of("message", error.getReason() == null ? "Não foi possível concluir a operação." : error.getReason()));
    }

    @ExceptionHandler({org.springframework.orm.ObjectOptimisticLockingFailureException.class, jakarta.persistence.OptimisticLockException.class})
    public ResponseEntity<?> handleConflict(Exception error) {
        return ResponseEntity.status(409).body(Map.of("message", "Este registro mudou em outra sessão. Reabra o conteúdo antes de salvar."));
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }

    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleJsonParseError(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body("Erro de formato: Verifique se todos os campos numéricos contêm apenas números.");
    }

    @ExceptionHandler(RegraNegocioRunTime.class)
    public ResponseEntity<?> handleRegraNegocio(RegraNegocioRunTime ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    
}
