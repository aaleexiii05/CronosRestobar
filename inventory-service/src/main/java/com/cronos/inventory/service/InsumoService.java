package com.cronos.inventory.service;

import com.cronos.inventory.dto.InsumoDTO;
import com.cronos.inventory.entity.Insumo;
import com.cronos.inventory.repository.InsumoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsumoService {

    private final InsumoRepository insumoRepository;

    public List<InsumoDTO> listarActivos() {
        return insumoRepository.findByActivoTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

   public List<InsumoDTO> listarBajoStock() {
        return insumoRepository.findBajoStock()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public InsumoDTO buscarPorId(Long id) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Insumo no encontrado con id: " + id));
        return toDTO(insumo);
    }

    @Transactional
    public InsumoDTO crear(InsumoDTO dto) {
        if (insumoRepository.existsByNombre(dto.getNombre())) {
            throw new IllegalArgumentException("Ya existe un insumo con ese nombre");
        }
        return toDTO(insumoRepository.save(toEntity(dto)));
    }

    @Transactional
    public InsumoDTO actualizar(Long id, InsumoDTO dto) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Insumo no encontrado con id: " + id));
        insumo.setNombre(dto.getNombre());
        insumo.setUnidad(dto.getUnidad());
        insumo.setStockActual(dto.getStockActual());
        insumo.setStockMinimo(dto.getStockMinimo());
        insumo.setActivo(dto.isActivo());
        return toDTO(insumoRepository.save(insumo));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!insumoRepository.existsById(id)) {
            throw new EntityNotFoundException("Insumo no encontrado con id: " + id);
        }
        insumoRepository.deleteById(id);
    }

    private InsumoDTO toDTO(Insumo insumo) {
        return InsumoDTO.builder()
                .id(insumo.getId())
                .nombre(insumo.getNombre())
                .unidad(insumo.getUnidad())
                .stockActual(insumo.getStockActual())
                .stockMinimo(insumo.getStockMinimo())
                .activo(insumo.isActivo())
                .build();
    }

    private Insumo toEntity(InsumoDTO dto) {
        return Insumo.builder()
                .nombre(dto.getNombre())
                .unidad(dto.getUnidad())
                .stockActual(dto.getStockActual())
                .stockMinimo(dto.getStockMinimo())
                .activo(true)
                .build();
    }
}
