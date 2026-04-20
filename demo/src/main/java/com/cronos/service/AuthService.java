package com.cronos.service;

import com.cronos.dto.UsuarioDTO;
import com.cronos.entity.Usuario;
import com.cronos.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioDTO registrar(UsuarioDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese email");
        }
        Usuario usuario = Usuario.builder()
                .nombre(dto.getNombre())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .rol(dto.getRol() != null ? dto.getRol() : Usuario.Rol.CLIENTE)
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
        return toDTO(usuario);
    }

    private UsuarioDTO toDTO(Usuario usuario) {
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .activo(usuario.isActivo())
                .fechaCreacion(usuario.getFechaCreacion())
                .build();
    }
}