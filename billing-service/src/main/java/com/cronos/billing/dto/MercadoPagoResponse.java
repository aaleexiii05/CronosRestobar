package com.cronos.billing.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MercadoPagoResponse {

    private String preferenceId;
    private String initPoint;
    private Long facturaId;
    private String estado;
    private String mensaje;
}
