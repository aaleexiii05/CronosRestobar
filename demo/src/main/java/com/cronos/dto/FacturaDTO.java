package com.cronos.dto;

import com.cronos.entity.Factura;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @NotBlank(message = "El nombre del cliente es obligatorio")
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

    private LocalDateTime fechaEmision;

    private List<DetalleFacturaDTO> detalles;
}