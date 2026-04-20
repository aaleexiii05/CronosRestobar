package com.cronos.service;

import com.cronos.dto.DetalleFacturaDTO;
import com.cronos.dto.FacturaDTO;
import com.cronos.entity.*;
import com.cronos.repository.FacturaRepository;
import com.cronos.repository.PedidoRepository;
import com.cronos.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<FacturaDTO> listarTodas() {
        return facturaRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public FacturaDTO buscarPorId(Long id) {
        Factura factura = facturaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Factura no encontrada con id: " + id));
        return toDTO(factura);
    }

    public FacturaDTO buscarPorNumeroComprobante(String numero) {
        Factura factura = facturaRepository.findByNumeroComprobante(numero)
                .orElseThrow(() -> new EntityNotFoundException("Comprobante no encontrado: " + numero));
        return toDTO(factura);
    }

    @Transactional
    public FacturaDTO emitir(FacturaDTO dto) {
        Pedido pedido = pedidoRepository.findById(dto.getPedidoId())
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + dto.getPedidoId()));

        if (facturaRepository.findByPedidoId(dto.getPedidoId()).isPresent()) {
            throw new IllegalArgumentException("El pedido ya tiene un comprobante emitido");
        }

        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + dto.getUsuarioId()));

        BigDecimal subtotal = pedido.getTotal().divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
        BigDecimal igv = pedido.getTotal().subtract(subtotal);

        Factura factura = Factura.builder()
                .pedido(pedido)
                .usuario(usuario)
                .numeroComprobante(generarNumeroComprobante(dto.getTipoComprobante()))
                .tipoComprobante(dto.getTipoComprobante())
                .clienteNombre(dto.getClienteNombre())
                .clienteDocumento(dto.getClienteDocumento())
                .clienteRuc(dto.getClienteRuc())
                .razonSocial(dto.getRazonSocial())
                .subtotal(subtotal)
                .igv(igv)
                .total(pedido.getTotal())
                .metodoPago(dto.getMetodoPago())
                .transaccionId(dto.getTransaccionId())
                .build();

        pedido.getDetalles().forEach(detalle -> {
            DetalleFactura detalleFactura = DetalleFactura.builder()
                    .factura(factura)
                    .descripcion(detalle.getProducto().getNombre())
                    .cantidad(detalle.getCantidad())
                    .precioUnitario(detalle.getPrecioUnitario())
                    .build();
            factura.getDetalles().add(detalleFactura);
        });

        pedido.setEstado(Pedido.EstadoPedido.ENTREGADO);
        pedido.getMesa().setEstado(Mesa.EstadoMesa.LIBRE);
        pedidoRepository.save(pedido);

        return toDTO(facturaRepository.save(factura));
    }

    private String generarNumeroComprobante(Factura.TipoComprobante tipo) {
        String prefijo = tipo == Factura.TipoComprobante.FACTURA ? "F001" : "B001";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        return prefijo + "-" + timestamp;
    }

    private FacturaDTO toDTO(Factura factura) {
        return FacturaDTO.builder()
                .id(factura.getId())
                .pedidoId(factura.getPedido().getId())
                .usuarioId(factura.getUsuario().getId())
                .usuarioNombre(factura.getUsuario().getNombre())
                .numeroComprobante(factura.getNumeroComprobante())
                .tipoComprobante(factura.getTipoComprobante())
                .clienteNombre(factura.getClienteNombre())
                .clienteDocumento(factura.getClienteDocumento())
                .clienteRuc(factura.getClienteRuc())
                .razonSocial(factura.getRazonSocial())
                .subtotal(factura.getSubtotal())
                .igv(factura.getIgv())
                .total(factura.getTotal())
                .metodoPago(factura.getMetodoPago())
                .transaccionId(factura.getTransaccionId())
                .fechaEmision(factura.getFechaEmision())
                .detalles(factura.getDetalles().stream().map(this::detalleToDTO).collect(Collectors.toList()))
                .build();
    }

    private DetalleFacturaDTO detalleToDTO(DetalleFactura detalle) {
        return DetalleFacturaDTO.builder()
                .id(detalle.getId())
                .facturaId(detalle.getFactura().getId())
                .descripcion(detalle.getDescripcion())
                .cantidad(detalle.getCantidad())
                .precioUnitario(detalle.getPrecioUnitario())
                .subtotal(detalle.getSubtotal())
                .build();
    }
}