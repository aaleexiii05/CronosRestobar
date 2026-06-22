package com.cronos.notification.controller;

import com.cronos.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public SseEmitter conectar(@RequestParam(defaultValue = "general") String channel) {
        return notificationService.registrarCliente(channel);
    }

    @PostMapping("/enviar")
    public ResponseEntity<Void> enviar(@RequestBody Map<String, Object> body) {
        String channel = body.getOrDefault("channel", "general").toString();
        String evento = body.getOrDefault("evento", "NOTIFICATION").toString();
        Object data = body.get("data");
        notificationService.enviarNotificacion(channel, evento, data);
        return ResponseEntity.ok().build();
    }
}
