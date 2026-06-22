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
    private final ConsultaSunatReniecService consultaService;

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

        BigDecimal total = pedido.getTotal();
        BigDecimal subtotal = total.divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
        BigDecimal igv = total.subtract(subtotal);

        // Auto-completar datos según tipo de comprobante
        String clienteNombre = dto.getClienteNombre();
        String clienteDocumento = dto.getClienteDocumento();
        String razonSocial = dto.getRazonSocial();

        if (dto.getTipoComprobante() == Factura.TipoComprobante.FACTURA) {
            if (dto.getClienteRuc() == null || dto.getClienteRuc().trim().length() != 11) {
                throw new IllegalArgumentException("El RUC es obligatorio y debe tener 11 dígitos para una Factura.");
            }
            // Consultar SUNAT
            java.util.Map<String, String> sunatData = consultaService.consultarSunat(dto.getClienteRuc());
            razonSocial = sunatData.get("razonSocial");
            clienteNombre = razonSocial; 
        } else {
            // Boleta: usar datos del usuario si están vacíos
            if (clienteNombre == null || clienteNombre.trim().isEmpty()) {
                clienteNombre = usuario.getNombre();
            }
            if (clienteDocumento == null || clienteDocumento.trim().isEmpty()) {
                clienteDocumento = usuario.getDni() != null ? usuario.getDni() : "";
            }
        }

        // Lógica de cálculo y validación de pago
        BigDecimal montoRecibido = null;
        BigDecimal vuelto = null;
        BigDecimal montoPagado = total;
        Factura.EstadoPago estadoPago = Factura.EstadoPago.APROBADO;
        LocalDateTime fechaPago = LocalDateTime.now();

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
                .pedido(pedido)
                .usuario(usuario)
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
                .estadoPago(estadoPago)
                .fechaPago(fechaPago)
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