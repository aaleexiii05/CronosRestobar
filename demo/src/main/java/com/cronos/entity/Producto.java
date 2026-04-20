package com.cronos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "imagen_url", length = 300)
    private String imagenUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean disponible = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;

    @Column(name = "tiempo_preparacion_min")
    private Integer tiempoPreparacionMin;

    @Column(name = "orden_display", nullable = false)
    @Builder.Default
    private Integer ordenDisplay = 0;
}