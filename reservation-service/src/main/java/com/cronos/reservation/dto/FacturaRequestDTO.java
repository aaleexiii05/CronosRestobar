package com.cronos.reservation.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacturaRequestDTO {

    private Long pedidoId;
    private Long usuarioId;
    private String tipoComprobante;
    private String clienteNombre;
    private String clienteDocumento;
    private String clienteRuc;
    private String metodoPago;
    private String transaccionId;
}
