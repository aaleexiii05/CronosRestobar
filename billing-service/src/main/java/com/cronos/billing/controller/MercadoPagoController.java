package com.cronos.billing.controller;

import com.cronos.billing.dto.MercadoPagoResponse;
import com.cronos.billing.entity.Factura;
import com.cronos.billing.service.FacturaService;
import com.cronos.billing.service.MercadoPagoService;
import com.mercadopago.resources.payment.Payment;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
public class MercadoPagoController {

    private final MercadoPagoService mercadoPagoService;
    private final FacturaService facturaService;

    @PostMapping("/crear-preferencia")
    public ResponseEntity<MercadoPagoResponse> crearPreferencia(@RequestBody Map<String, Long> body) {
        Long pedidoId = body.get("pedidoId");
        if (pedidoId == null) {
            return ResponseEntity.badRequest().body(
                    MercadoPagoResponse.builder().estado("ERROR").mensaje("pedidoId es obligatorio").build()
            );
        }

        var preference = mercadoPagoService.crearPreferencia(pedidoId);

        return ResponseEntity.ok(MercadoPagoResponse.builder()
                .preferenceId(preference.getId())
                .initPoint(preference.getInitPoint())
                .estado("PENDIENTE")
                .build());
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestParam("topic") String topic,
            @RequestParam("id") String id,
            HttpServletRequest request) {
        log.info("Webhook recibido - topic: {}, id: {}", topic, id);
        try {
            Factura factura = mercadoPagoService.procesarPago(topic, id);
            if (factura != null) {
                log.info("Factura {} actualizada vía webhook", factura.getId());
            }
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Error procesando webhook: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("ERROR");
        }
    }

    @GetMapping("/mercadopago/{paymentId}")
    public ResponseEntity<MercadoPagoResponse> consultarPago(@PathVariable Long paymentId) {
        try {
            Payment payment = mercadoPagoService.consultarPago(paymentId);
            return ResponseEntity.ok(MercadoPagoResponse.builder()
                    .preferenceId(payment.getExternalReference())
                    .estado(payment.getStatus())
                    .mensaje(payment.getStatusDetail())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    MercadoPagoResponse.builder().estado("ERROR").mensaje(e.getMessage()).build()
            );
        }
    }
}
