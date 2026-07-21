package com.cronos.reservation.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoRequestDTO {

    private Long mesaId;
    private Integer mesaNumero;
    private Long usuarioId;
    private String observaciones;
    private List<DetallePedidoDTO> detalles;
}
