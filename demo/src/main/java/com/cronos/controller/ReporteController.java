
package com.cronos.controller;

import com.cronos.entity.Pedido;
import com.cronos.entity.Reserva;
import com.cronos.service.FacturaService;
import com.cronos.service.InsumoService;
import com.cronos.service.PedidoService;
import com.cronos.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final PedidoService pedidoService;
    private final ReservaService reservaService;
    private final FacturaService facturaService;
    private final InsumoService insumoService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("pedidosPendientes", pedidoService.listarPorEstado(Pedido.EstadoPedido.PENDIENTE).size());
        data.put("pedidosEnPreparacion", pedidoService.listarPorEstado(Pedido.EstadoPedido.EN_PREPARACION).size());
        data.put("reservasPendientes", reservaService.listarPorEstado(Reserva.EstadoReserva.PENDIENTE).size());
        data.put("reservasConfirmadas", reservaService.listarPorEstado(Reserva.EstadoReserva.CONFIRMADA).size());
        data.put("insumosBajoStock", insumoService.listarBajoStock().size());
        data.put("totalFacturas", facturaService.listarTodas().size());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/pedidos")
    public ResponseEntity<Object> reportePedidos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @GetMapping("/reservas")
    public ResponseEntity<Object> reporteReservas() {
        return ResponseEntity.ok(reservaService.listarTodas());
    }

    @GetMapping("/facturas")
    public ResponseEntity<Object> reporteFacturas() {
        return ResponseEntity.ok(facturaService.listarTodas());
    }

    @GetMapping("/inventario")
    public ResponseEntity<Object> reporteInventario() {
        return ResponseEntity.ok(insumoService.listarActivos());
    }
}