package com.cronos.reservation.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
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
    public Map<String, String> consultarSunat(String ruc) {
        String url = consultaServiceUrl + "/api/consultas/sunat/" + ruc;
        return restTemplate.getForObject(url, HashMap.class);
    }
}
