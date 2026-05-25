package com.cronos.controller;

import com.cronos.dto.MesaDTO;
import com.cronos.entity.Mesa;
import com.cronos.service.MesaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mesas")
@RequiredArgsConstructor
public class MesaController {

    private final MesaService mesaService;

    @GetMapping
    public ResponseEntity<List<MesaDTO>> listarTodas() {
        return ResponseEntity.ok(mesaService.listarTodas());
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<MesaDTO>> listarPorEstado(@PathVariable Mesa.EstadoMesa estado) {
        return ResponseEntity.ok(mesaService.listarPorEstado(estado));
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<MesaDTO>> listarPorTipo(@PathVariable Mesa.TipoMesa tipo) {
        return ResponseEntity.ok(mesaService.listarPorTipo(tipo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MesaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(mesaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<MesaDTO> crear(@Valid @RequestBody MesaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mesaService.crear(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MesaDTO> actualizar(@PathVariable Long id,
                                               @Valid @RequestBody MesaDTO dto) {
        return ResponseEntity.ok(mesaService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<MesaDTO> cambiarEstado(@PathVariable Long id,
                                                  @RequestParam Mesa.EstadoMesa estado) {
        return ResponseEntity.ok(mesaService.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        mesaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}