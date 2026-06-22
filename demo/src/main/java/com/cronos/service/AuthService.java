package com.cronos.service;

import com.cronos.dto.UsuarioDTO;
import com.cronos.entity.Usuario;
import com.cronos.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ConsultaSunatReniecService consultaService;

    @Transactional
    public UsuarioDTO registrar(UsuarioDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese email");
        }
        if (dto.getDni() == null || dto.getDni().trim().length() != 8) {
            throw new IllegalArgumentException("El DNI es obligatorio y debe tener 8 dígitos.");
        }
        if (usuarioRepository.existsByDni(dto.getDni())) {
            throw new IllegalArgumentException("Ya existe un usuario registrado con ese DNI.");
        }

        // Consultar RENIEC
        java.util.Map<String, String> reniecData = consultaService.consultarReniec(dto.getDni());
        String nombres = reniecData.get("nombres");
        String paterno = reniecData.get("apellidoPaterno");
        String materno = reniecData.get("apellidoMaterno");
        String nombreCompleto = nombres + " " + paterno + " " + materno;

        Usuario usuario = Usuario.builder()
                .nombre(nombreCompleto)
                .dni(dto.getDni())
                .nombres(nombres)
                .apellidoPaterno(paterno)
                .apellidoMaterno(materno)
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .rol(Usuario.Rol.CLIENTE)
                .activo(true)
                .build();
        usuarioRepository.save(usuario);
        return toDTO(usuario);
    }

    public UsuarioDTO login(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Credenciales incorrectas"));
        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales incorrectas");
        }
        if (!usuario.isActivo()) {
            throw new IllegalArgumentException("La cuenta está desactivada");
        }
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);
        return toDTO(usuario);
    }

    private UsuarioDTO toDTO(Usuario usuario) {
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .dni(usuario.getDni())
                .nombres(usuario.getNombres())
                .apellidoPaterno(usuario.getApellidoPaterno())
                .apellidoMaterno(usuario.getApellidoMaterno())
                .telefono(usuario.getTelefono())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .activo(usuario.isActivo())
                .fechaCreacion(usuario.getFechaCreacion())
                .ultimoAcceso(usuario.getUltimoAcceso())
                .build();
    }
}