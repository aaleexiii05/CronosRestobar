package com.cronos.repository;

import com.cronos.entity.MovimientoStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Long> {

    List<MovimientoStock> findByInsumoId(Long insumoId);

    List<MovimientoStock> findByTipo(MovimientoStock.TipoMovimiento tipo);

    List<MovimientoStock> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
}