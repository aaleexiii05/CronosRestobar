package com.cronos.dto;

import com.cronos.entity.Pedido;
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
public class PedidoDTO {

    private Long id;

    @NotNull(message = "La mesa es obligatoria")
    private Long mesaId;

    private Integer mesaNumero;

    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;

    private String usuarioNombre;

    private Pedido.EstadoPedido estado;

    private LocalDateTime fechaHora;

    private LocalDateTime fechaHoraEntrega;

    private BigDecimal total;

    private String observaciones;

    private List<DetallePedidoDTO> detalles;
}