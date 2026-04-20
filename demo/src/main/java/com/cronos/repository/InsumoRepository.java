package com.cronos.repository;

import com.cronos.entity.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Long> {

    List<Insumo> findByActivoTrue();

    List<Insumo> findByStockActualLessThanEqual(BigDecimal stockMinimo);

    boolean existsByNombre(String nombre);
}