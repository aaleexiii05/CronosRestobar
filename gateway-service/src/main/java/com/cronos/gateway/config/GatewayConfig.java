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
                        .uri("lb://auth-service"))
                .route("auth-internal", r -> r
                        .path("/api/internal/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(false))))
                        .uri("lb://auth-service"))
                .route("menu-service", r -> r
                        .path("/api/productos/**", "/api/categorias/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("lb://menu-service"))
                .route("order-service", r -> r
                        .path("/api/pedidos/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("lb://order-service"))
                .route("billing-webhook", r -> r
                        .path("/api/facturas/webhook")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(false))))
                        .uri("lb://billing-service"))
                .route("billing-service", r -> r
                        .path("/api/facturas/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("lb://billing-service"))
                .route("inventory-service", r -> r
                        .path("/api/insumos/**", "/api/movimientos-stock/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("lb://inventory-service"))
                .route("reservation-service", r -> r
                        .path("/api/mesas/**", "/api/reservas/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("lb://reservation-service"))
                .route("notification-service", r -> r
                        .path("/api/notificaciones/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(true))))
                        .uri("lb://notification-service"))
                .route("consulta-service", r -> r
                        .path("/api/consultas/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config(false))))
                        .uri("lb://consulta-service"))
                .build();
    }
}
