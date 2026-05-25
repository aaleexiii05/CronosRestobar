package com.cronos.controller;

import com.cronos.dto.MovimientoStockDTO;
import com.cronos.service.MovimientoStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos-stock")
@RequiredArgsConstructor
public class MovimientoStockController {

    private final MovimientoStockService movimientoStockService;

    @GetMapping
    public ResponseEntity<List<MovimientoStockDTO>> listarTodos() {
        return ResponseEntity.ok(movimientoStockService.listarTodos());
    }

    @GetMapping("/insumo/{insumoId}")
    public ResponseEntity<List<MovimientoStockDTO>> listarPorInsumo(@PathVariable Long insumoId) {
        return ResponseEntity.ok(movimientoStockService.listarPorInsumo(insumoId));
    }

    @PostMapping
    public ResponseEntity<MovimientoStockDTO> registrar(@Valid @RequestBody MovimientoStockDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movimientoStockService.registrar(dto));
    }
}