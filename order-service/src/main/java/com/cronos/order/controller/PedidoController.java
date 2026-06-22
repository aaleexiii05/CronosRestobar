package com.cronos.order.controller;

import com.cronos.order.dto.PedidoDTO;
import com.cronos.order.entity.Pedido;
import com.cronos.order.service.NotificationService;
import com.cronos.order.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<PedidoDTO>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<PedidoDTO>> listarPorEstado(@PathVariable Pedido.EstadoPedido estado) {
        return ResponseEntity.ok(pedidoService.listarPorEstado(estado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PedidoDTO> crear(@Valid @RequestBody PedidoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.crear(dto));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<PedidoDTO> cambiarEstado(@PathVariable Long id,
                                                    @RequestParam Pedido.EstadoPedido estado) {
        return ResponseEntity.ok(pedidoService.cambiarEstado(id, estado));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        pedidoService.cancelar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/listo")
    public ResponseEntity<PedidoDTO> marcarListo(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.marcarListo(id));
    }

    @GetMapping("/notificaciones")
    public SseEmitter notificaciones() {
        return notificationService.registrarCliente();
    }
}
