package com.cronos.billing.service;

import com.cronos.billing.client.OrderClient;
import com.cronos.billing.dto.PedidoDTO;
import com.cronos.billing.entity.Factura;
import com.cronos.billing.repository.FacturaRepository;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import com.mercadopago.resources.payment.Payment;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MercadoPagoService {

    private final FacturaRepository facturaRepository;
    private final OrderClient orderClient;

    @Value("${mercadopago.access.token}")
    private String accessToken;

    @Value("${mercadopago.back-urls.success}")
    private String backUrlSuccess;

    @Value("${mercadopago.back-urls.failure}")
    private String backUrlFailure;

    @Value("${mercadopago.webhook-url}")
    private String webhookUrl;

    @PostConstruct
    public void init() {
        MercadoPagoConfig.setAccessToken(accessToken);
    }

    @Transactional
    public Preference crearPreferencia(Long pedidoId) {
        PedidoDTO pedido = orderClient.obtenerPedido(pedidoId);

        PreferenceItemRequest item = PreferenceItemRequest.builder()
                .title("Pedido Cronos Restobar #" + pedido.getId())
                .description("Consumo en mesa " + (pedido.getMesaNumero() != null ? pedido.getMesaNumero() : "N/A"))
                .quantity(1)
                .unitPrice(pedido.getTotal())
                .currencyId("PEN")
                .build();

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(backUrlSuccess)
                .failure(backUrlFailure)
                .pending(backUrlFailure)
                .build();

        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(List.of(item))
                .backUrls(backUrls)
                .notificationUrl(webhookUrl)
                .externalReference(pedidoId.toString())
                .build();

        PreferenceClient client = new PreferenceClient();
        try {
            Preference preference = client.create(preferenceRequest);
            log.info("Preferencia MP creada: {} para pedido {}", preference.getId(), pedidoId);
            return preference;
        } catch (MPApiException e) {
            log.error("Error MP API al crear preferencia para pedido {}: status={}, response={}",
                    pedidoId, e.getStatusCode(), e.getApiResponse().getContent());
            throw new RuntimeException("Error de Mercado Pago: HTTP " + e.getStatusCode()
                    + " - " + e.getApiResponse().getContent(), e);
        } catch (MPException e) {
            log.error("Error MP al crear preferencia para pedido {}: {}", pedidoId, e.getMessage());
            throw new RuntimeException("Error de Mercado Pago: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Factura procesarPago(String topic, String resourceId) {
        if (!"payment".equals(topic)) {
            log.warn("Notificación ignorada, topic: {}", topic);
            return null;
        }

        try {
            PaymentClient paymentClient = new PaymentClient();
            Payment payment = paymentClient.get(Long.parseLong(resourceId));

            String pedidoIdStr = payment.getExternalReference();
            if (pedidoIdStr == null) {
                log.warn("Payment {} sin externalReference", resourceId);
                return null;
            }

            Long pedidoId = Long.parseLong(pedidoIdStr);
            Factura factura = facturaRepository.findByPedidoId(pedidoId)
                    .orElseThrow(() -> new EntityNotFoundException("Factura no encontrada para pedido: " + pedidoId));

            factura.setTransaccionId(payment.getId().toString());

            switch (payment.getStatus()) {
                case "approved" -> {
                    factura.setEstadoPago(Factura.EstadoPago.APROBADO);
                    factura.setFechaPago(LocalDateTime.now());
                    factura.setMontoPagado(payment.getTransactionAmount());
                    orderClient.actualizarEstado(pedidoId, "ENTREGADO");
                    log.info("Pago APROBADO para factura {}", factura.getId());
                }
                case "rejected", "cancelled", "refunded" -> {
                    factura.setEstadoPago(Factura.EstadoPago.RECHAZADO);
                    log.info("Pago RECHAZADO para factura {}", factura.getId());
                }
                default -> log.info("Pago en estado {} para factura {}", payment.getStatus(), factura.getId());
            }

            return facturaRepository.save(factura);
        } catch (NumberFormatException e) {
            log.error("resourceId inválido: {}", resourceId);
            return null;
        } catch (Exception e) {
            log.error("Error procesando pago {}: {}", resourceId, e.getMessage());
            throw new RuntimeException("Error al procesar notificación de pago: " + e.getMessage(), e);
        }
    }

    public Payment consultarPago(Long paymentId) {
        try {
            PaymentClient client = new PaymentClient();
            return client.get(paymentId);
        } catch (Exception e) {
            log.error("Error consultando pago {}: {}", paymentId, e.getMessage());
            throw new RuntimeException("Error al consultar pago en Mercado Pago: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void reembolsarPago(Factura factura) {
        if (factura.getTransaccionId() == null) {
            log.warn("Factura {} sin transaccionId, no se puede reembolsar", factura.getId());
            return;
        }

        try {
            Long paymentId = Long.parseLong(factura.getTransaccionId());
            PaymentClient client = new PaymentClient();
            client.refund(paymentId);
            log.info("Reembolso exitoso para payment {} (factura {})", paymentId, factura.getId());
        } catch (Exception e) {
            log.error("Error al reembolsar pago {}: {}", factura.getTransaccionId(), e.getMessage());
            throw new RuntimeException("Error al reembolsar pago en Mercado Pago: " + e.getMessage(), e);
        }
    }
}
