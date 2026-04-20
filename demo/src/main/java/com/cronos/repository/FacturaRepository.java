package com.cronos.repository;

import com.cronos.entity.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {

    Optional<Factura> findByNumeroComprobante(String numeroComprobante);

    Optional<Factura> findByPedidoId(Long pedidoId);

    List<Factura> findByTipoComprobante(Factura.TipoComprobante tipoComprobante);

    List<Factura> findByFechaEmisionBetween(LocalDateTime inicio, LocalDateTime fin);

    boolean existsByNumeroComprobante(String numeroComprobante);
}