package com.cronos.service;

import com.cronos.dto.ReservaDTO;
import com.cronos.entity.Mesa;
import com.cronos.entity.Reserva;
import com.cronos.entity.Usuario;
import com.cronos.repository.MesaRepository;
import com.cronos.repository.ReservaRepository;
import com.cronos.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final MesaRepository mesaRepository;
    private final UsuarioRepository usuarioRepository;

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
                dto.getMesaId(),
                dto.getFecha(),
                dto.getTurno(),
                Reserva.EstadoReserva.CANCELADA
        );

        if (mesaOcupada) {
            throw new IllegalArgumentException("La mesa ya tiene una reserva en ese turno y fecha");
        }

        if (dto.getNumPersonas() > mesa.getCapacidad()) {
            throw new IllegalArgumentException("El número de personas supera la capacidad de la mesa");
        }

        Usuario usuarioRegistro = null;
        if (dto.getUsuarioRegistroId() != null) {
            usuarioRegistro = usuarioRepository.findById(dto.getUsuarioRegistroId()).orElse(null);
        }

        Reserva reserva = Reserva.builder()
                .mesa(mesa)
                .clienteNombre(dto.getClienteNombre())
                .clienteTelefono(dto.getClienteTelefono())
                .clienteEmail(dto.getClienteEmail())
                .fecha(dto.getFecha())
                .turno(dto.getTurno())
                .numPersonas(dto.getNumPersonas())
                .estado(Reserva.EstadoReserva.PENDIENTE)
                .observaciones(dto.getObservaciones())
                .usuarioRegistro(usuarioRegistro)
                .build();

        mesa.setEstado(Mesa.EstadoMesa.RESERVADA);
        mesaRepository.save(mesa);

        return toDTO(reservaRepository.save(reserva));
    }

    @Transactional
    public ReservaDTO cambiarEstado(Long id, Reserva.EstadoReserva estado) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada con id: " + id));
        reserva.setEstado(estado);
        if (estado == Reserva.EstadoReserva.CANCELADA) {
            reserva.getMesa().setEstado(Mesa.EstadoMesa.LIBRE);
            mesaRepository.save(reserva.getMesa());
        }
        return toDTO(reservaRepository.save(reserva));
    }

    private ReservaDTO toDTO(Reserva reserva) {
        return ReservaDTO.builder()
                .id(reserva.getId())
                .mesaId(reserva.getMesa().getId())
                .mesaNumero(reserva.getMesa().getNumero())
                .clienteNombre(reserva.getClienteNombre())
                .clienteTelefono(reserva.getClienteTelefono())
                .clienteEmail(reserva.getClienteEmail())
                .fecha(reserva.getFecha())
                .turno(reserva.getTurno())
                .numPersonas(reserva.getNumPersonas())
                .estado(reserva.getEstado())
                .observaciones(reserva.getObservaciones())
                .fechaCreacion(reserva.getFechaCreacion())
                .usuarioRegistroId(reserva.getUsuarioRegistro() != null ? reserva.getUsuarioRegistro().getId() : null)
                .build();
    }
}