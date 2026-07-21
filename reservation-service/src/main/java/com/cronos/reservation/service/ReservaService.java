package com.cronos.reservation.service;

import com.cronos.reservation.client.AuthClient;
import com.cronos.reservation.client.BillingClient;
import com.cronos.reservation.client.ConsultaClient;
import com.cronos.reservation.client.MenuClient;
import com.cronos.reservation.client.OrderClient;
import com.cronos.reservation.dto.*;
import com.cronos.reservation.entity.Mesa;
import com.cronos.reservation.entity.Reserva;
import com.cronos.reservation.repository.MesaRepository;
import com.cronos.reservation.repository.ReservaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final MesaRepository mesaRepository;
    private final MenuClient menuClient;
    private final AuthClient authClient;
    private final OrderClient orderClient;
    private final BillingClient billingClient;
    private final ConsultaClient consultaClient;

    public List<ReservaDTO> listarTodas() {
        return reservaRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ReservaDTO> listarPorFecha(LocalDate fecha) {
        return reservaRepository.findByFecha(fecha)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ReservaDTO> listarPorEstado(Reserva.EstadoReserva estado) {
        return reservaRepository.findByEstado(estado)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ReservaDTO buscarPorId(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada con id: " + id));
        return toDTO(reserva);
    }

    @Transactional
    public ReservaDTO crear(ReservaDTO dto) {
        Mesa mesa = mesaRepository.findById(dto.getMesaId())
                .orElseThrow(() -> new EntityNotFoundException("Mesa no encontrada con id: " + dto.getMesaId()));

        boolean mesaOcupada = reservaRepository.existsByMesaIdAndFechaAndTurnoAndEstadoNot(
                dto.getMesaId(), dto.getFecha(), dto.getTurno(), Reserva.EstadoReserva.CANCELADA
        );
        if (mesaOcupada) {
            throw new IllegalArgumentException("La mesa ya tiene una reserva en ese turno y fecha");
        }
        if (dto.getNumPersonas() > mesa.getCapacidad()) {
            throw new IllegalArgumentException("El número de personas supera la capacidad de la mesa");
        }

        UsuarioDTO usuarioRegistro = null;
        if (dto.getUsuarioRegistroId() != null) {
            try {
                usuarioRegistro = authClient.obtenerUsuario(dto.getUsuarioRegistroId());
            } catch (Exception e) {
                // fall through
            }
        }

        if (dto.getNumPersonas() >= 3) {
            if (dto.getDetallesPedido() == null || dto.getDetallesPedido().isEmpty()) {
                throw new IllegalArgumentException("Para reservas de 3 a más personas, es obligatorio realizar un pre-pedido y pagarlo en línea.");
            }
            if (dto.getMetodoPago() == null || "EFECTIVO".equals(dto.getMetodoPago())) {
                throw new IllegalArgumentException("Para reservas de 3 a más personas, el pago debe ser en línea.");
            }
            if (dto.getTransaccionId() == null || dto.getTransaccionId().trim().isEmpty()) {
                throw new IllegalArgumentException("El ID de transacción de pago es obligatorio para reservas de 3 a más personas.");
            }
        }

        Long pedidoId = null;
        boolean pagoEnLineaRealizado = false;

        if (dto.getDetallesPedido() != null && !dto.getDetallesPedido().isEmpty()) {
            if (usuarioRegistro == null) {
                throw new IllegalArgumentException("Se requiere un usuario registrado para realizar una reserva con pre-pedido.");
            }

            PedidoRequestDTO pedidoReq = PedidoRequestDTO.builder()
                    .mesaId(mesa.getId())
                    .mesaNumero(mesa.getNumero())
                    .usuarioId(usuarioRegistro.getId())
                    .observaciones("Pre-pedido de Reserva")
                    .detalles(dto.getDetallesPedido())
                    .build();

            @SuppressWarnings("unchecked")
            Map<String, Object> pedidoResp = orderClient.crearPedido(pedidoReq);
            if (pedidoResp != null) {
                pedidoId = ((Number) pedidoResp.get("id")).longValue();
            }

            if (dto.getMetodoPago() != null && !"EFECTIVO".equals(dto.getMetodoPago())
                    && dto.getTransaccionId() != null && !dto.getTransaccionId().trim().isEmpty()) {
                pagoEnLineaRealizado = true;
            }
        }

        if (pagoEnLineaRealizado && pedidoId != null) {
            FacturaRequestDTO facturaReq = FacturaRequestDTO.builder()
                    .pedidoId(pedidoId)
                    .usuarioId(usuarioRegistro.getId())
                    .tipoComprobante(dto.getTipoComprobante() != null ? dto.getTipoComprobante() : "BOLETA")
                    .clienteNombre(dto.getClienteNombre())
                    .clienteRuc(dto.getClienteRuc())
                    .metodoPago(dto.getMetodoPago())
                    .transaccionId(dto.getTransaccionId())
                    .build();
            try {
                billingClient.emitirFactura(facturaReq);
            } catch (Exception e) {
                // If billing fails, cancel the order
                if (pedidoId != null) {
                    orderClient.cancelarPedido(pedidoId);
                }
                throw new IllegalArgumentException("Error al procesar el pago: " + e.getMessage());
            }
        }

        Reserva.EstadoReserva estadoReserva;
        if (pagoEnLineaRealizado || (dto.getNumPersonas() < 3
                && (dto.getDetallesPedido() == null || dto.getDetallesPedido().isEmpty()))) {
            estadoReserva = Reserva.EstadoReserva.CONFIRMADA;
        } else {
            estadoReserva = Reserva.EstadoReserva.PENDIENTE;
        }

        Reserva reserva = Reserva.builder()
                .mesaId(mesa.getId())
                .mesaNumero(mesa.getNumero())
                .clienteNombre(dto.getClienteNombre())
                .clienteTelefono(dto.getClienteTelefono())
                .clienteEmail(dto.getClienteEmail())
                .fecha(dto.getFecha())
                .turno(dto.getTurno())
                .numPersonas(dto.getNumPersonas())
                .estado(estadoReserva)
                .observaciones(dto.getObservaciones())
                .usuarioRegistroId(usuarioRegistro != null ? usuarioRegistro.getId() : null)
                .usuarioRegistroNombre(usuarioRegistro != null ? usuarioRegistro.getNombre() : null)
                .horaComida(dto.getHoraComida())
                .comidaServidaCaliente(dto.isComidaServidaCaliente())
                .minutosAdicionales(dto.getMinutosAdicionales() != null ? dto.getMinutosAdicionales() : 0)
                .pedidoId(pedidoId)
                .build();

        if (dto.getFecha().equals(LocalDate.now())) {
            mesa.setEstado(Mesa.EstadoMesa.RESERVADA);
            mesaRepository.save(mesa);
        }

        return toDTO(reservaRepository.save(reserva));
    }

    @Transactional
    public ReservaDTO cambiarEstado(Long id, Reserva.EstadoReserva estado) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada con id: " + id));
        reserva.setEstado(estado);

        if (estado == Reserva.EstadoReserva.CANCELADA) {
            Mesa mesa = mesaRepository.findById(reserva.getMesaId())
                    .orElse(null);
            if (mesa != null) {
                mesa.setEstado(Mesa.EstadoMesa.LIBRE);
                mesaRepository.save(mesa);
            }
            if (reserva.getPedidoId() != null) {
                try {
                    orderClient.cancelarPedido(reserva.getPedidoId());
                } catch (Exception e) {
                    // fall through
                }
            }
        }
        if (estado == Reserva.EstadoReserva.CONFIRMADA) {
            Mesa mesa = mesaRepository.findById(reserva.getMesaId())
                    .orElse(null);
            if (mesa != null) {
                mesa.setEstado(Mesa.EstadoMesa.RESERVADA);
                mesaRepository.save(mesa);
            }
        }

        return toDTO(reservaRepository.save(reserva));
    }

    @Transactional
    public ReservaDTO actualizar(Long id, ReservaDTO dto) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada con id: " + id));
        if (dto.getMesaId() != null) {
            Mesa mesa = mesaRepository.findById(dto.getMesaId())
                    .orElseThrow(() -> new EntityNotFoundException("Mesa no encontrada con id: " + dto.getMesaId()));
            reserva.setMesaId(mesa.getId());
            reserva.setMesaNumero(mesa.getNumero());
        }
        if (dto.getClienteNombre() != null) reserva.setClienteNombre(dto.getClienteNombre());
        if (dto.getClienteTelefono() != null) reserva.setClienteTelefono(dto.getClienteTelefono());
        if (dto.getClienteEmail() != null) reserva.setClienteEmail(dto.getClienteEmail());
        if (dto.getFecha() != null) reserva.setFecha(dto.getFecha());
        if (dto.getTurno() != null) reserva.setTurno(dto.getTurno());
        if (dto.getNumPersonas() != null) reserva.setNumPersonas(dto.getNumPersonas());
        if (dto.getObservaciones() != null) reserva.setObservaciones(dto.getObservaciones());
        if (dto.getHoraComida() != null) reserva.setHoraComida(dto.getHoraComida());
        reserva.setComidaServidaCaliente(dto.isComidaServidaCaliente());
        if (dto.getMinutosAdicionales() != null) reserva.setMinutosAdicionales(dto.getMinutosAdicionales());
        return toDTO(reservaRepository.save(reserva));
    }

    @Transactional
    public void eliminar(Long id) {
        cambiarEstado(id, Reserva.EstadoReserva.CANCELADA);
    }

    @Transactional
    public ReservaDTO ampliarMinutos(Long id, int minutos) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada con id: " + id));
        if (reserva.getEstado() == Reserva.EstadoReserva.CANCELADA
                || reserva.getEstado() == Reserva.EstadoReserva.COMPLETADA) {
            throw new IllegalArgumentException("No se puede ampliar los minutos de una reserva cancelada o completada.");
        }
        if (minutos < 0) {
            throw new IllegalArgumentException("Los minutos a ampliar deben ser mayores o iguales a cero.");
        }
        reserva.setMinutosAdicionales(reserva.getMinutosAdicionales() + minutos);
        return toDTO(reservaRepository.save(reserva));
    }

    private ReservaDTO toDTO(Reserva reserva) {
        return ReservaDTO.builder()
                .id(reserva.getId())
                .mesaId(reserva.getMesaId())
                .mesaNumero(reserva.getMesaNumero())
                .clienteNombre(reserva.getClienteNombre())
                .clienteTelefono(reserva.getClienteTelefono())
                .clienteEmail(reserva.getClienteEmail())
                .fecha(reserva.getFecha())
                .turno(reserva.getTurno())
                .numPersonas(reserva.getNumPersonas())
                .estado(reserva.getEstado())
                .observaciones(reserva.getObservaciones())
                .fechaCreacion(reserva.getFechaCreacion())
                .usuarioRegistroId(reserva.getUsuarioRegistroId())
                .horaComida(reserva.getHoraComida())
                .comidaServidaCaliente(reserva.isComidaServidaCaliente())
                .minutosAdicionales(reserva.getMinutosAdicionales())
                .pedidoId(reserva.getPedidoId())
                .build();
    }
}
