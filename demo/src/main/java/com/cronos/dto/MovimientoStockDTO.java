package com.cronos.dto;

import com.cronos.entity.MovimientoStock;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoStockDTO {

    private Long id;

    @NotNull(message = "El insumo es obligatorio")
    private Long insumoId;

    private String insumoNombre;

    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;

    private String usuarioNombre;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private MovimientoStock.TipoMovimiento tipo;

    @NotNull(message = "La cantidad es obligatoria")
    @DecimalMin(value = "0.001", message = "La cantidad debe ser mayor a 0")
    private BigDecimal cantidad;

    @Size(max = 200)
    private String motivo;

    private LocalDateTime fechaHora;
}