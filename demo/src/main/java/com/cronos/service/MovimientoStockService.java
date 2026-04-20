package com.cronos.service;

import com.cronos.dto.MovimientoStockDTO;
import com.cronos.entity.Insumo;
import com.cronos.entity.MovimientoStock;
import com.cronos.entity.Usuario;
import com.cronos.repository.InsumoRepository;
import com.cronos.repository.MovimientoStockRepository;
import com.cronos.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovimientoStockService {

    private final MovimientoStockRepository movimientoStockRepository;
    private final InsumoRepository insumoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<MovimientoStockDTO> listarPorInsumo(Long insumoId) {
        return movimientoStockRepository.findByInsumoId(insumoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MovimientoStockDTO> listarTodos() {
        return movimientoStockRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MovimientoStockDTO registrar(MovimientoStockDTO dto) {
        Insumo insumo = insumoRepository.findById(dto.getInsumoId())
                .orElseThrow(() -> new EntityNotFoundException("Insumo no encontrado con id: " + dto.getInsumoId()));

        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + dto.getUsuarioId()));

        switch (dto.getTipo()) {
            case ENTRADA -> insumo.setStockActual(insumo.getStockActual().add(dto.getCantidad()));
            case SALIDA -> {
                if (insumo.getStockActual().compareTo(dto.getCantidad()) < 0) {
                    throw new IllegalArgumentException("Stock insuficiente para el insumo: " + insumo.getNombre());
                }
                insumo.setStockActual(insumo.getStockActual().subtract(dto.getCantidad()));
            }
            case AJUSTE -> insumo.setStockActual(dto.getCantidad());
        }

        insumoRepository.save(insumo);

        MovimientoStock movimiento = MovimientoStock.builder()
                .insumo(insumo)
                .usuario(usuario)
                .tipo(dto.getTipo())
                .cantidad(dto.getCantidad())
                .motivo(dto.getMotivo())
                .build();

        return toDTO(movimientoStockRepository.save(movimiento));
    }

    private MovimientoStockDTO toDTO(MovimientoStock movimiento) {
        return MovimientoStockDTO.builder()
                .id(movimiento.getId())
                .insumoId(movimiento.getInsumo().getId())
                .insumoNombre(movimiento.getInsumo().getNombre())
                .usuarioId(movimiento.getUsuario().getId())
                .usuarioNombre(movimiento.getUsuario().getNombre())
                .tipo(movimiento.getTipo())
                .cantidad(movimiento.getCantidad())
                .motivo(movimiento.getMotivo())
                .fechaHora(movimiento.getFechaHora())
                .build();
    }
}