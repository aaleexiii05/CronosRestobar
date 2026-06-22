package com.cronos.service;

import com.cronos.dto.UsuarioDTO;
import com.cronos.entity.Usuario;
import com.cronos.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ConsultaSunatReniecService consultaService;

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UsuarioDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
        return toDTO(usuario);
    }

    @Transactional
    public UsuarioDTO crear(UsuarioDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }
        if (dto.getDni() != null && usuarioRepository.existsByDni(dto.getDni())) {
            throw new IllegalArgumentException("Ya existe un usuario con ese DNI");
        }

        // Si no se proporcionaron nombres pero sí DNI, consultar RENIEC
        if (dto.getDni() != null && (dto.getNombres() == null || dto.getNombres().isEmpty())) {
            try {
                java.util.Map<String, String> reniecData = consultaService.consultarReniec(dto.getDni());
                dto.setNombres(reniecData.get("nombres"));
                dto.setApellidoPaterno(reniecData.get("apellidoPaterno"));
                dto.setApellidoMaterno(reniecData.get("apellidoMaterno"));
            } catch (Exception e) {
                // fall through
            }
        }

        Usuario usuario = toEntity(dto);
        usuario.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        return toDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioDTO actualizar(Long id, UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
        
        usuario.setDni(dto.getDni());
        usuario.setNombres(dto.getNombres());
        usuario.setApellidoPaterno(dto.getApellidoPaterno());
        usuario.setApellidoMaterno(dto.getApellidoMaterno());
        usuario.setTelefono(dto.getTelefono());

        String nombreCompleto = dto.getNombre();
        if (dto.getNombres() != null && dto.getApellidoPaterno() != null) {
            nombreCompleto = dto.getNombres() + " " + dto.getApellidoPaterno() + " " + (dto.getApellidoMaterno() != null ? dto.getApellidoMaterno() : "");
        }
        usuario.setNombre(nombreCompleto);
        usuario.setRol(dto.getRol());
        usuario.setActivo(dto.isActivo());
        
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }
        return toDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Usuario no encontrado con id: " + id);
        }
        usuarioRepository.deleteById(id);
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

    private Usuario toEntity(UsuarioDTO dto) {
        String nombreCompleto = dto.getNombre();
        if (dto.getNombres() != null && dto.getApellidoPaterno() != null) {
            nombreCompleto = dto.getNombres() + " " + dto.getApellidoPaterno() + " " + (dto.getApellidoMaterno() != null ? dto.getApellidoMaterno() : "");
        }
        return Usuario.builder()
                .nombre(nombreCompleto)
                .dni(dto.getDni())
                .nombres(dto.getNombres())
                .apellidoPaterno(dto.getApellidoPaterno())
                .apellidoMaterno(dto.getApellidoMaterno())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .rol(dto.getRol() != null ? dto.getRol() : Usuario.Rol.CLIENTE)
                .activo(dto.isActivo())
                .build();
    }
}