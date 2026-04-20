package com.cronos.dto;

import com.cronos.entity.Reserva;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservaDTO {

    private Long id;

    @NotNull(message = "La mesa es obligatoria")
    private Long mesaId;

    private Integer mesaNumero;

    @NotBlank(message = "El nombre del cliente es obligatorio")
    @Size(max = 100)
    private String clienteNombre;

    @NotBlank(message = "El teléfono del cliente es obligatorio")
    @Size(max = 20)
    private String clienteTelefono;

    @Size(max = 150)
    private String clienteEmail;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "El turno es obligatorio")
    private Reserva.Turno turno;

    @NotNull(message = "El número de personas es obligatorio")
    @Min(value = 1, message = "Debe haber al menos una persona")
    private Integer numPersonas;

    private Reserva.EstadoReserva estado;

    private String observaciones;

    private LocalDateTime fechaCreacion;

    private Long usuarioRegistroId;
}