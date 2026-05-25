package com.cronos.controller;

import com.cronos.dto.FacturaDTO;
import com.cronos.service.FacturaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaService facturaService;

    @GetMapping
    public ResponseEntity<List<FacturaDTO>> listarTodas() {
        return ResponseEntity.ok(facturaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacturaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(facturaService.buscarPorId(id));
    }

    @GetMapping("/comprobante/{numero}")
    public ResponseEntity<FacturaDTO> buscarPorNumero(@PathVariable String numero) {
        return ResponseEntity.ok(facturaService.buscarPorNumeroComprobante(numero));
    }

    @PostMapping
    public ResponseEntity<FacturaDTO> emitir(@Valid @RequestBody FacturaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facturaService.emitir(dto));
    }
}