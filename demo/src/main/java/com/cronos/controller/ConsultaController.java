package com.cronos.controller;

import com.cronos.service.ConsultaSunatReniecService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/consultas")
@RequiredArgsConstructor
public class ConsultaController {

    private final ConsultaSunatReniecService consultaService;

    @GetMapping("/reniec/{dni}")
    public ResponseEntity<Map<String, String>> consultarReniec(@PathVariable String dni) {
        return ResponseEntity.ok(consultaService.consultarReniec(dni));
    }

    @GetMapping("/sunat/{ruc}")
    public ResponseEntity<Map<String, String>> consultarSunat(@PathVariable String ruc) {
        return ResponseEntity.ok(consultaService.consultarSunat(ruc));
    }
}
