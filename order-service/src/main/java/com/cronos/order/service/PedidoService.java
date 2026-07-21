package com.cronos.order.service;

import com.cronos.order.client.AuthClient;
import com.cronos.order.client.MenuClient;
import com.cronos.order.dto.DetallePedidoDTO;
import com.cronos.order.dto.PedidoDTO;
import com.cronos.order.dto.ProductoDTO;
import com.cronos.order.dto.UsuarioDTO;
import com.cronos.order.entity.DetallePedido;
import com.cronos.order.entity.Pedido;
import com.cronos.order.repository.PedidoRepository;
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
    private final MenuClient menuClient;
    private final AuthClient authClient;
    private final NotificationService notificationService;

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
        Pedido pedido = Pedido.builder()
                .mesaId(dto.getMesaId())
                .usuarioId(dto.getUsuarioId())
                .estado(Pedido.EstadoPedido.PENDIENTE)
                .observaciones(dto.getObservaciones())
                .build();

        if (dto.getDetalles() != null) {
            for (DetallePedidoDTO detalleDTO : dto.getDetalles()) {
                ProductoDTO producto = menuClient.obtenerProducto(detalleDTO.getProductoId());
                DetallePedido detalle = DetallePedido.builder()
                        .pedido(pedido)
                        .productoId(producto.getId())
                        .productoNombre(producto.getNombre())
                        .cantidad(detalleDTO.getCantidad())
                        .precioUnitario(producto.getPrecio())
                        .notas(detalleDTO.getNotas())
                        .build();
                pedido.getDetalles().add(detalle);
            }
        }

        UsuarioDTO usuario = authClient.obtenerUsuario(dto.getUsuarioId());
        pedido.setUsuarioNombre(usuario.getNombre());
        pedido.setMesaNumero(dto.getMesaNumero());
        pedido.setTotal(calcularTotal(pedido.getDetalles()));

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
        PedidoDTO dto = toDTO(pedidoRepository.save(pedido));
        notificationService.enviarNotificacion("ESTADO_PEDIDO", dto);
        return dto;
    }

    @Transactional
    public PedidoDTO marcarListo(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + id));
        pedido.setEstado(Pedido.EstadoPedido.LISTO);
        PedidoDTO dto = toDTO(pedidoRepository.save(pedido));
        notificationService.enviarNotificacion("PEDIDO_LISTO", dto);
        return dto;
    }

    @Transactional
    public void cancelar(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + id));
        pedido.setEstado(Pedido.EstadoPedido.CANCELADO);
        pedidoRepository.save(pedido);

        PedidoDTO dto = toDTO(pedido);
        notificationService.enviarNotificacion("ESTADO_PEDIDO", dto);
    }

    public List<PedidoDTO> listarPendientesDeCobro() {
        return pedidoRepository.findByEstadoNot(Pedido.EstadoPedido.CANCELADO)
                .stream()
                .filter(p -> p.getTotal() != null && p.getTotal().compareTo(BigDecimal.ZERO) > 0)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PedidoDTO actualizar(Long id, PedidoDTO dto) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + id));
        if (dto.getMesaId() != null) {
            pedido.setMesaId(dto.getMesaId());
        }
        if (dto.getMesaNumero() != null) {
            pedido.setMesaNumero(dto.getMesaNumero());
        }
        if (dto.getObservaciones() != null) {
            pedido.setObservaciones(dto.getObservaciones());
        }
        return toDTO(pedidoRepository.save(pedido));
    }

    @Transactional
    public void eliminar(Long id) {
        cancelar(id);
    }

    private BigDecimal calcularTotal(List<DetallePedido> detalles) {
        return detalles.stream()
                .map(d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private PedidoDTO toDTO(Pedido pedido) {
        return PedidoDTO.builder()
                .id(pedido.getId())
                .mesaId(pedido.getMesaId())
                .mesaNumero(pedido.getMesaNumero())
                .usuarioId(pedido.getUsuarioId())
                .usuarioNombre(pedido.getUsuarioNombre())
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
                .productoId(detalle.getProductoId())
                .productoNombre(detalle.getProductoNombre())
                .cantidad(detalle.getCantidad())
                .precioUnitario(detalle.getPrecioUnitario())
                .subtotal(detalle.getSubtotal())
                .notas(detalle.getNotas())
                .build();
    }
}
