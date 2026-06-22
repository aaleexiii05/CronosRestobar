package com.cronos.reservation.controller;

import com.cronos.reservation.dto.ReservaDTO;
import com.cronos.reservation.entity.Reserva;
import com.cronos.reservation.service.ReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping
    public ResponseEntity<List<ReservaDTO>> listarTodas() {
        return ResponseEntity.ok(reservaService.listarTodas());
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<ReservaDTO>> listarPorFecha(@PathVariable LocalDate fecha) {
        return ResponseEntity.ok(reservaService.listarPorFecha(fecha));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<ReservaDTO>> listarPorEstado(@PathVariable Reserva.EstadoReserva estado) {
        return ResponseEntity.ok(reservaService.listarPorEstado(estado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ReservaDTO> crear(@Valid @RequestBody ReservaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.crear(dto));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ReservaDTO> cambiarEstado(@PathVariable Long id,
                                                     @RequestParam Reserva.EstadoReserva estado) {
        return ResponseEntity.ok(reservaService.cambiarEstado(id, estado));
    }

    @PatchMapping("/{id}/ampliar-minutos")
    public ResponseEntity<ReservaDTO> ampliarMinutos(@PathVariable Long id,
                                                      @RequestParam int minutos) {
        return ResponseEntity.ok(reservaService.ampliarMinutos(id, minutos));
    }
}
