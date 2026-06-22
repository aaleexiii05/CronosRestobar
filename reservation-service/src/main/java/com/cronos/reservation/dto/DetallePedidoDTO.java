package com.cronos.reservation.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetallePedidoDTO {

    private Long productoId;
    private Integer cantidad;
    private String notas;
}
