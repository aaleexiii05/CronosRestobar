package com.cronos.reservation.client;

import com.cronos.reservation.dto.UsuarioDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AuthClient {

    private final RestTemplate restTemplate;
    private final String authServiceUrl;

    public AuthClient(RestTemplate restTemplate,
                      @Value("${auth.service.url}") String authServiceUrl) {
        this.restTemplate = restTemplate;
        this.authServiceUrl = authServiceUrl;
    }

    public UsuarioDTO obtenerUsuario(Long id) {
        String url = authServiceUrl + "/api/internal/usuarios/" + id;
        return restTemplate.getForObject(url, UsuarioDTO.class);
    }
}
