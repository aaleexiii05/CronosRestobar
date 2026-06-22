package com.cronos.inventory.repository;

import com.cronos.inventory.entity.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Long> {

    List<Insumo> findByActivoTrue();

    @Query("SELECT i FROM Insumo i WHERE i.stockActual <= i.stockMinimo AND i.activo = true")
    List<Insumo> findBajoStock();

    boolean existsByNombre(String nombre);
}
