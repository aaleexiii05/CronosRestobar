package com.cronos.billing.client;

import com.cronos.billing.dto.PedidoDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class OrderClient {

    private final RestTemplate restTemplate;
    private final String orderServiceUrl;

    public OrderClient(RestTemplate restTemplate,
                       @Value("${order.service.url}") String orderServiceUrl) {
        this.restTemplate = restTemplate;
        this.orderServiceUrl = orderServiceUrl;
    }

    public PedidoDTO obtenerPedido(Long id) {
        String url = orderServiceUrl + "/api/pedidos/" + id;
        return restTemplate.getForObject(url, PedidoDTO.class);
    }

    public void actualizarEstado(Long pedidoId, String estado) {
        String url = orderServiceUrl + "/api/pedidos/" + pedidoId + "/estado?estado=" + estado;
        restTemplate.patchForObject(url, null, Void.class);
    }
}
