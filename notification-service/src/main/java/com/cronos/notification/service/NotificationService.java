package com.cronos.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class NotificationService {

    private final Map<String, List<SseEmitter>> channels = new ConcurrentHashMap<>();

    public SseEmitter registrarCliente(String channel) {
        SseEmitter emitter = new SseEmitter(24 * 60 * 60 * 1000L);
        channels.computeIfAbsent(channel, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removerEmitter(channel, emitter));
        emitter.onTimeout(() -> removerEmitter(channel, emitter));
        emitter.onError(e -> removerEmitter(channel, emitter));

        try {
            emitter.send(SseEmitter.event().name("CONNECT").data("Conectado al canal: " + channel));
        } catch (IOException e) {
            removerEmitter(channel, emitter);
        }

        return emitter;
    }

    public void enviarNotificacion(String channel, String evento, Object data) {
        List<SseEmitter> emitters = channels.get(channel);
        if (emitters == null) return;

        List<SseEmitter> fallidos = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(evento).data(data));
            } catch (Exception e) {
                fallidos.add(emitter);
            }
        }
        emitters.removeAll(fallidos);
    }

    private void removerEmitter(String channel, SseEmitter emitter) {
        List<SseEmitter> emitters = channels.get(channel);
        if (emitters != null) {
            emitters.remove(emitter);
        }
    }
}
