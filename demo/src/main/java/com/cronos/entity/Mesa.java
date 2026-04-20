package com.cronos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mesas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer numero;

    @Column(nullable = false)
    private Integer capacidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoMesa tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoMesa estado = EstadoMesa.LIBRE;

    @Column(length = 100)
    private String ubicacion;

    @Column(nullable = false)
    @Builder.Default
    private boolean activa = true;

    public enum TipoMesa {
        PAREJA,
        PEQUENO,
        GRUPO,
        EMPRESA,
        BARRA,
        VIP
    }

    public enum EstadoMesa {
        LIBRE,
        OCUPADA,
        RESERVADA,
        EN_LIMPIEZA
    }
}