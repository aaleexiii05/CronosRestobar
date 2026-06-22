package com.cronos.reservation.dto;

import com.cronos.reservation.entity.Reserva;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

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

    private LocalTime horaComida;

    private boolean comidaServidaCaliente;

    private Integer minutosAdicionales;

    private Long pedidoId;

    private List<DetallePedidoDTO> detallesPedido;

    private String metodoPago;

    private String transaccionId;

    private String tipoComprobante;

    private String clienteRuc;
}
