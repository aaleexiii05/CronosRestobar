package com.cronos.reservation.client;

import com.cronos.reservation.dto.PedidoRequestDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class OrderClient {

    private final RestTemplate restTemplate;
    private final String orderServiceUrl;

    public OrderClient(RestTemplate restTemplate,
                       @Value("${order.service.url}") String orderServiceUrl) {
        this.restTemplate = restTemplate;
        this.orderServiceUrl = orderServiceUrl;
    }

    public Map<String, Object> crearPedido(PedidoRequestDTO dto) {
        String url = orderServiceUrl + "/api/pedidos";
        org.springframework.http.HttpEntity<PedidoRequestDTO> requestEntity =
                new org.springframework.http.HttpEntity<>(dto);
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, requestEntity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        return response.getBody();
    }

    public void cancelarPedido(Long pedidoId) {
        String url = orderServiceUrl + "/api/pedidos/" + pedidoId + "/cancelar";
        restTemplate.exchange(url, HttpMethod.PATCH, null, Void.class);
    }
}
