package com.cronos.order.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class NotificationService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter registrarCliente() {
        SseEmitter emitter = new SseEmitter(24 * 60 * 60 * 1000L);
        this.emitters.add(emitter);

        emitter.onCompletion(() -> this.emitters.remove(emitter));
        emitter.onTimeout(() -> this.emitters.remove(emitter));
        emitter.onError(e -> this.emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event().name("CONNECT").data("Conexión de Notificaciones Establecida"));
        } catch (IOException e) {
            this.emitters.remove(emitter);
        }

        return emitter;
    }

    public void enviarNotificacion(String evento, Object data) {
        List<SseEmitter> fallidos = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : this.emitters) {
            try {
                emitter.send(SseEmitter.event().name(evento).data(data));
            } catch (Exception e) {
                fallidos.add(emitter);
            }
        }
        this.emitters.removeAll(fallidos);
    }
}
