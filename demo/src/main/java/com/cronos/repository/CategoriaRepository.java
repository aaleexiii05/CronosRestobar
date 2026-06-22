package com.cronos.repository;

import com.cronos.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByActivaTrueOrderByOrdenDisplayAsc();

    boolean existsByNombre(String nombre);

    Optional<Categoria> findByNombre(String nombre);
}