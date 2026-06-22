package com.cronos.reservation.client;

import com.cronos.reservation.dto.FacturaRequestDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class BillingClient {

    private final RestTemplate restTemplate;
    private final String billingServiceUrl;

    public BillingClient(RestTemplate restTemplate,
                         @Value("${billing.service.url}") String billingServiceUrl) {
        this.restTemplate = restTemplate;
        this.billingServiceUrl = billingServiceUrl;
    }

    public Map<String, Object> emitirFactura(FacturaRequestDTO dto) {
        String url = billingServiceUrl + "/api/facturas";
        org.springframework.http.HttpEntity<FacturaRequestDTO> requestEntity =
                new org.springframework.http.HttpEntity<>(dto);
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, requestEntity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        return response.getBody();
    }
}
