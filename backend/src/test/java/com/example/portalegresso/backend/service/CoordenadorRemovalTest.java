package com.example.portalegresso.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.portalegresso.backend.model.entidades.*;
import com.example.portalegresso.backend.model.repository.*;

@ExtendWith(MockitoExtension.class)
class CoordenadorRemovalTest {
    @InjectMocks CoordenadorService service;
    @Mock CoordenadorRepositorio coordinators;
    @Mock CursoRepositorio courses;
    @Mock CursoEgressoRepositorio associations;
    @Mock DestaqueEgressoRepositorio highlights;
    @Mock EgressoRepositorio graduates;

    @Test
    void deveImpedirExclusaoDeCursoComFormacoesSemExcluirPerfil() {
        var course = Curso.builder().id_curso(1).nome("Computação").build();
        when(courses.findById(1)).thenReturn(Optional.of(course));
        when(associations.findCursoEgressoByCursoId(1)).thenReturn(List.of(new CursoEgresso()));
        assertThrows(RegraNegocioRunTime.class, () -> service.remover(course));
        verify(courses, never()).deleteById(any());
        verifyNoInteractions(graduates);
    }

    @Test
    void deveVerificarTodosOsCursosAntesDeExcluirConta() {
        var coordinator = Coordenador.builder().id_coordenador(2).build();
        var empty = Curso.builder().id_curso(1).nome("Curso Livre").build();
        var linked = Curso.builder().id_curso(2).nome("Computação").build();
        when(coordinators.findById(2)).thenReturn(Optional.of(coordinator));
        when(courses.findByCoordenador(coordinator)).thenReturn(List.of(empty, linked));
        when(associations.findCursoEgressoByCursoId(1)).thenReturn(List.of());
        when(associations.findCursoEgressoByCursoId(2)).thenReturn(List.of(new CursoEgresso()));
        assertThrows(RegraNegocioRunTime.class, () -> service.remover(coordinator));
        verify(courses, never()).delete(any(Curso.class));
        verify(coordinators, never()).deleteById(any());
    }

    @Test
    void deveExcluirCursoSemFormacoes() {
        var course = Curso.builder().id_curso(1).build();
        when(courses.findById(1)).thenReturn(Optional.of(course));
        service.remover(course);
        verify(courses).deleteById(1);
    }
}
