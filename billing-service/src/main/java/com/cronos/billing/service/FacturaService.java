package com.cronos.billing.service;

import com.cronos.billing.client.AuthClient;
import com.cronos.billing.client.ConsultaClient;
import com.cronos.billing.client.OrderClient;
import com.cronos.billing.dto.DetalleFacturaDTO;
import com.cronos.billing.dto.FacturaDTO;
import com.cronos.billing.dto.PedidoDTO;
import com.cronos.billing.dto.UsuarioDTO;
import com.cronos.billing.entity.DetalleFactura;
import com.cronos.billing.entity.Factura;
import com.cronos.billing.repository.FacturaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final OrderClient orderClient;
    private final AuthClient authClient;
    private final ConsultaClient consultaClient;

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
        PedidoDTO pedido = orderClient.obtenerPedido(dto.getPedidoId());

        if (facturaRepository.findByPedidoId(dto.getPedidoId()).isPresent()) {
            throw new IllegalArgumentException("El pedido ya tiene un comprobante emitido");
        }

        UsuarioDTO usuario = authClient.obtenerUsuario(dto.getUsuarioId() != null
                ? dto.getUsuarioId() : pedido.getUsuarioId());

        BigDecimal total = pedido.getTotal();
        BigDecimal subtotal = total.divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
        BigDecimal igv = total.subtract(subtotal);

        String clienteNombre = dto.getClienteNombre();
        String clienteDocumento = dto.getClienteDocumento();
        String razonSocial = dto.getRazonSocial();

        if (dto.getTipoComprobante() == Factura.TipoComprobante.FACTURA) {
            if (dto.getClienteRuc() == null || dto.getClienteRuc().trim().length() != 11) {
                throw new IllegalArgumentException("El RUC es obligatorio y debe tener 11 dígitos para una Factura.");
            }
            Map<String, String> sunatData = consultaClient.consultarSunat(dto.getClienteRuc());
            razonSocial = sunatData.get("razonSocial");
            clienteNombre = razonSocial;
        } else {
            if (clienteNombre == null || clienteNombre.trim().isEmpty()) {
                clienteNombre = usuario.getNombre();
            }
            if (clienteDocumento == null || clienteDocumento.trim().isEmpty()) {
                clienteDocumento = usuario.getDni() != null ? usuario.getDni() : "";
            }
        }

        BigDecimal montoRecibido = null;
        BigDecimal vuelto = null;
        BigDecimal montoPagado = total;

        if (dto.getMetodoPago() == Factura.MetodoPago.EFECTIVO) {
            if (dto.getMontoRecibido() == null || dto.getMontoRecibido().compareTo(total) < 0) {
                throw new IllegalArgumentException("El monto recibido en efectivo es menor al total a pagar (" + total + ").");
            }
            montoRecibido = dto.getMontoRecibido();
            vuelto = montoRecibido.subtract(total);
        } else if (dto.getMetodoPago() == Factura.MetodoPago.MERCADO_PAGO) {
            if (dto.getTransaccionId() == null || dto.getTransaccionId().trim().isEmpty()) {
                throw new IllegalArgumentException("El ID de transacción de Mercado Pago es obligatorio.");
            }
        }

        Factura factura = Factura.builder()
                .pedidoId(pedido.getId())
                .usuarioId(usuario.getId())
                .usuarioNombre(usuario.getNombre())
                .numeroComprobante(generarNumeroComprobante(dto.getTipoComprobante()))
                .tipoComprobante(dto.getTipoComprobante())
                .clienteNombre(clienteNombre)
                .clienteDocumento(clienteDocumento)
                .clienteRuc(dto.getClienteRuc())
                .razonSocial(razonSocial)
                .subtotal(subtotal)
                .igv(igv)
                .total(total)
                .metodoPago(dto.getMetodoPago())
                .transaccionId(dto.getTransaccionId())
                .montoRecibido(montoRecibido)
                .vuelto(vuelto)
                .montoPagado(montoPagado)
                .estadoPago(Factura.EstadoPago.APROBADO)
                .fechaPago(LocalDateTime.now())
                .build();

        if (pedido.getDetalles() != null) {
            for (var detalle : pedido.getDetalles()) {
                DetalleFactura detalleFactura = DetalleFactura.builder()
                        .factura(factura)
                        .descripcion(detalle.getProductoNombre())
                        .cantidad(detalle.getCantidad())
                        .precioUnitario(detalle.getPrecioUnitario())
                        .build();
                factura.getDetalles().add(detalleFactura);
            }
        }

        orderClient.actualizarEstado(pedido.getId(), "ENTREGADO");

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
                .pedidoId(factura.getPedidoId())
                .usuarioId(factura.getUsuarioId())
                .usuarioNombre(factura.getUsuarioNombre())
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
                .fechaPago(factura.getFechaPago())
                .estadoPago(factura.getEstadoPago())
                .montoPagado(factura.getMontoPagado())
                .montoRecibido(factura.getMontoRecibido())
                .vuelto(factura.getVuelto())
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
