package com.cronos.service;

import com.cronos.dto.MesaDTO;
import com.cronos.entity.Mesa;
import com.cronos.repository.MesaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MesaService {

    private final MesaRepository mesaRepository;

    public List<MesaDTO> listarTodas() {
        return mesaRepository.findByActivaTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MesaDTO> listarPorEstado(Mesa.EstadoMesa estado) {
        return mesaRepository.findByEstado(estado)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MesaDTO> listarPorTipo(Mesa.TipoMesa tipo) {
        return mesaRepository.findByTipo(tipo)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MesaDTO buscarPorId(Long id) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mesa no encontrada con id: " + id));
        return toDTO(mesa);
    }

    @Transactional
    public MesaDTO crear(MesaDTO dto) {
        if (mesaRepository.existsByNumero(dto.getNumero())) {
            throw new IllegalArgumentException("Ya existe una mesa con el número: " + dto.getNumero());
        }
        return toDTO(mesaRepository.save(toEntity(dto)));
    }

    @Transactional
    public MesaDTO actualizar(Long id, MesaDTO dto) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mesa no encontrada con id: " + id));
        mesa.setCapacidad(dto.getCapacidad());
        mesa.setTipo(dto.getTipo());
        mesa.setUbicacion(dto.getUbicacion());
        mesa.setActiva(dto.isActiva());
        return toDTO(mesaRepository.save(mesa));
    }

    @Transactional
    public MesaDTO cambiarEstado(Long id, Mesa.EstadoMesa estado) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mesa no encontrada con id: " + id));
        mesa.setEstado(estado);
        return toDTO(mesaRepository.save(mesa));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!mesaRepository.existsById(id)) {
            throw new EntityNotFoundException("Mesa no encontrada con id: " + id);
        }
        mesaRepository.deleteById(id);
    }

    private MesaDTO toDTO(Mesa mesa) {
        return MesaDTO.builder()
                .id(mesa.getId())
                .numero(mesa.getNumero())
                .capacidad(mesa.getCapacidad())
                .tipo(mesa.getTipo())
                .estado(mesa.getEstado())
                .ubicacion(mesa.getUbicacion())
                .activa(mesa.isActiva())
                .build();
    }

    private Mesa toEntity(MesaDTO dto) {
        return Mesa.builder()
                .numero(dto.getNumero())
                .capacidad(dto.getCapacidad())
                .tipo(dto.getTipo())
                .estado(dto.getEstado() != null ? dto.getEstado() : Mesa.EstadoMesa.LIBRE)
                .ubicacion(dto.getUbicacion())
                .activa(true)
                .build();
    }
}