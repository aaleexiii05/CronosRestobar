package com.cronos.billing.dto;

import com.cronos.billing.entity.Factura;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacturaDTO {

    private Long id;

    @NotNull(message = "El pedido es obligatorio")
    private Long pedidoId;

    private Long usuarioId;

    private String usuarioNombre;

    private String numeroComprobante;

    @NotNull(message = "El tipo de comprobante es obligatorio")
    private Factura.TipoComprobante tipoComprobante;

    private String clienteNombre;

    private String clienteDocumento;

    private String clienteRuc;

    private String razonSocial;

    private BigDecimal subtotal;

    private BigDecimal igv;

    private BigDecimal total;

    @NotNull(message = "El método de pago es obligatorio")
    private Factura.MetodoPago metodoPago;

    private String transaccionId;

    private LocalDateTime fechaPago;

    private Factura.EstadoPago estadoPago;

    private BigDecimal montoPagado;

    private BigDecimal montoRecibido;

    private BigDecimal vuelto;

    private LocalDateTime fechaEmision;

    private List<DetalleFacturaDTO> detalles;
}
