package com.cronos.billing.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PedidoDTO {

    private Long id;
    private Long mesaId;
    private Integer mesaNumero;
    private Long usuarioId;
    private String usuarioNombre;
    private String estado;
    private BigDecimal total;
    private String observaciones;
    private java.util.List<DetallePedidoDTO> detalles;
}
