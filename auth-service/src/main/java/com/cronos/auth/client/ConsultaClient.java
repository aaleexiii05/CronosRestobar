package com.cronos.auth.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class ConsultaClient {

    private final RestTemplate restTemplate;
    private final String consultaServiceUrl;

    public ConsultaClient(RestTemplate restTemplate,
                          @Value("${consulta.service.url}") String consultaServiceUrl) {
        this.restTemplate = restTemplate;
        this.consultaServiceUrl = consultaServiceUrl;
    }

    @SuppressWarnings("unchecked")
    public Map<String, String> consultarReniec(String dni) {
        String url = consultaServiceUrl + "/api/consultas/reniec/" + dni;
        return restTemplate.getForObject(url, Map.class);
    }
}
