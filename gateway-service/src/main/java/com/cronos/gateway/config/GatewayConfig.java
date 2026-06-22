package com.cronos.gateway.config;

import com.cronos.gateway.filter.JwtAuthFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder, JwtAuthFilter jwtAuthFilter) {
        return builder.routes()
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(false))))
                        .uri("http://localhost:8081"))
                .route("auth-internal", r -> r
                        .path("/api/internal/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(false))))
                        .uri("http://localhost:8081"))
                .route("menu-service", r -> r
                        .path("/api/productos/**", "/api/categorias/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("http://localhost:8082"))
                .route("order-service", r -> r
                        .path("/api/pedidos/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("http://localhost:8083"))
                .route("billing-service", r -> r
                        .path("/api/facturas/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("http://localhost:8084"))
                .route("inventory-service", r -> r
                        .path("/api/insumos/**", "/api/movimientos/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("http://localhost:8085"))
                .route("reservation-service", r -> r
                        .path("/api/mesas/**", "/api/reservas/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("http://localhost:8086"))
                .route("notification-service", r -> r
                        .path("/api/notificaciones/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("http://localhost:8088"))
                .route("consulta-service", r -> r
                        .path("/api/consultas/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("http://localhost:8087"))
                .build();
    }
}
