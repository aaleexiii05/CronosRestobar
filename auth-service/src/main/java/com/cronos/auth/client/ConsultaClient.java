package com.cronos.auth.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class ConsultaClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${consulta.service.url:http://localhost:8087/api/consultas}")
    private String consultaServiceUrl;

    @SuppressWarnings("unchecked")
    public Map<String, String> consultarReniec(String dni) {
        String url = consultaServiceUrl + "/reniec/" + dni;
        return restTemplate.getForObject(url, Map.class);
    }
}
