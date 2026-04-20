package com.cronos.dto;

import com.cronos.entity.Mesa;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MesaDTO {

    private Long id;

    @NotNull(message = "El número de mesa es obligatorio")
    @Min(value = 1, message = "El número de mesa debe ser mayor a 0")
    private Integer numero;

    @NotNull(message = "La capacidad es obligatoria")
    @Min(value = 1, message = "La capacidad debe ser mayor a 0")
    private Integer capacidad;

    @NotNull(message = "El tipo de mesa es obligatorio")
    private Mesa.TipoMesa tipo;

    private Mesa.EstadoMesa estado;

    private String ubicacion;

    private boolean activa;
}