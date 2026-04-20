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
}