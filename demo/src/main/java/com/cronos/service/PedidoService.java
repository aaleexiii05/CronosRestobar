package com.cronos.service;

import com.cronos.dto.DetallePedidoDTO;
import com.cronos.dto.PedidoDTO;
import com.cronos.entity.*;
import com.cronos.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final MesaRepository mesaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    public List<PedidoDTO> listarTodos() {
        return pedidoRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PedidoDTO> listarPorEstado(Pedido.EstadoPedido estado) {
        return pedidoRepository.findByEstado(estado)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PedidoDTO buscarPorId(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + id));
        return toDTO(pedido);
    }

    @Transactional
    public PedidoDTO crear(PedidoDTO dto) {
        Mesa mesa = mesaRepository.findById(dto.getMesaId())
                .orElseThrow(() -> new EntityNotFoundException("Mesa no encontrada con id: " + dto.getMesaId()));
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + dto.getUsuarioId()));

        Pedido pedido = Pedido.builder()
                .mesa(mesa)
                .usuario(usuario)
                .estado(Pedido.EstadoPedido.PENDIENTE)
                .observaciones(dto.getObservaciones())
                .build();

        if (dto.getDetalles() != null) {
            for (DetallePedidoDTO detalleDTO : dto.getDetalles()) {
                Producto producto = productoRepository.findById(detalleDTO.getProductoId())
                        .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con id: " + detalleDTO.getProductoId()));
                DetallePedido detalle = DetallePedido.builder()
                        .pedido(pedido)
                        .producto(producto)
                        .cantidad(detalleDTO.getCantidad())
                        .precioUnitario(producto.getPrecio())
                        .notas(detalleDTO.getNotas())
                        .build();
                pedido.getDetalles().add(detalle);
            }
        }

        pedido.setTotal(calcularTotal(pedido.getDetalles()));
        mesa.setEstado(Mesa.EstadoMesa.OCUPADA);
        mesaRepository.save(mesa);

        return toDTO(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoDTO cambiarEstado(Long id, Pedido.EstadoPedido estado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + id));
        pedido.setEstado(estado);
        if (estado == Pedido.EstadoPedido.ENTREGADO) {
            pedido.setFechaHoraEntrega(LocalDateTime.now());
        }
        return toDTO(pedidoRepository.save(pedido));
    }

    @Transactional
    public void cancelar(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + id));
        pedido.setEstado(Pedido.EstadoPedido.CANCELADO);
        pedido.getMesa().setEstado(Mesa.EstadoMesa.LIBRE);
        mesaRepository.save(pedido.getMesa());
        pedidoRepository.save(pedido);
    }

    private BigDecimal calcularTotal(List<DetallePedido> detalles) {
        return detalles.stream()
                .map(d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private PedidoDTO toDTO(Pedido pedido) {
        return PedidoDTO.builder()
                .id(pedido.getId())
                .mesaId(pedido.getMesa().getId())
                .mesaNumero(pedido.getMesa().getNumero())
                .usuarioId(pedido.getUsuario().getId())
                .usuarioNombre(pedido.getUsuario().getNombre())
                .estado(pedido.getEstado())
                .fechaHora(pedido.getFechaHora())
                .fechaHoraEntrega(pedido.getFechaHoraEntrega())
                .total(pedido.getTotal())
                .observaciones(pedido.getObservaciones())
                .detalles(pedido.getDetalles().stream().map(this::detalleToDTO).collect(Collectors.toList()))
                .build();
    }

    private DetallePedidoDTO detalleToDTO(DetallePedido detalle) {
        return DetallePedidoDTO.builder()
                .id(detalle.getId())
                .pedidoId(detalle.getPedido().getId())
                .productoId(detalle.getProducto().getId())
                .productoNombre(detalle.getProducto().getNombre())
                .cantidad(detalle.getCantidad())
                .precioUnitario(detalle.getPrecioUnitario())
                .subtotal(detalle.getSubtotal())
                .notas(detalle.getNotas())
                .build();
    }
}