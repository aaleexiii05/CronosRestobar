package com.cronos.reservation.client;

import com.cronos.reservation.dto.ProductoDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class MenuClient {

    private final RestTemplate restTemplate;
    private final String menuServiceUrl;

    public MenuClient(RestTemplate restTemplate,
                      @Value("${menu.service.url}") String menuServiceUrl) {
        this.restTemplate = restTemplate;
        this.menuServiceUrl = menuServiceUrl;
    }

    public ProductoDTO obtenerProducto(Long id) {
        String url = menuServiceUrl + "/api/productos/" + id;
        return restTemplate.getForObject(url, ProductoDTO.class);
    }
}
