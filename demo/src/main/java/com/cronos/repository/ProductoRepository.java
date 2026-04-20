package com.cronos.repository;

import com.cronos.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByCategoriaIdAndActivoTrue(Long categoriaId);

    List<Producto> findByActivoTrueAndDisponibleTrue();

    boolean existsByNombreAndCategoriaId(String nombre, Long categoriaId);
}