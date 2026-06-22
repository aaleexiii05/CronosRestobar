package com.cronos.repository;

import com.cronos.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByEstado(Pedido.EstadoPedido estado);

    List<Pedido> findByMesaId(Long mesaId);

    List<Pedido> findByUsuarioId(Long usuarioId);

    List<Pedido> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Pedido> findByMesaIdAndEstadoNot(Long mesaId, Pedido.EstadoPedido estado);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Pedido p LEFT JOIN Factura f ON f.pedido = p WHERE (f IS NULL OR f.estadoPago != :estadoPago) AND p.estado != :estadoPedido")
    List<Pedido> findPedidosPendientesDeCobro(
            @org.springframework.data.repository.query.Param("estadoPago") com.cronos.entity.Factura.EstadoPago estadoPago,
            @org.springframework.data.repository.query.Param("estadoPedido") com.cronos.entity.Pedido.EstadoPedido estadoPedido
    );
}