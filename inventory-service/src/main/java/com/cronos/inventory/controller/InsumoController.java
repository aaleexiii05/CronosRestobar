package com.cronos.inventory.controller;

import com.cronos.inventory.dto.InsumoDTO;
import com.cronos.inventory.service.InsumoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
@RequiredArgsConstructor
public class InsumoController {

    private final InsumoService insumoService;

    @GetMapping
    public ResponseEntity<List<InsumoDTO>> listar(@RequestParam(defaultValue = "false") boolean todas) {
        if (todas) {
            return ResponseEntity.ok(insumoService.listarTodos());
        }
        return ResponseEntity.ok(insumoService.listarActivos());
    }

    @GetMapping("/bajo-stock")
    public ResponseEntity<List<InsumoDTO>> listarBajoStock() {
        return ResponseEntity.ok(insumoService.listarBajoStock());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsumoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(insumoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<InsumoDTO> crear(@Valid @RequestBody InsumoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(insumoService.crear(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsumoDTO> actualizar(@PathVariable Long id,
                                                  @Valid @RequestBody InsumoDTO dto) {
        return ResponseEntity.ok(insumoService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        insumoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
