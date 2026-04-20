package com.cronos.service;

import com.cronos.dto.ProductoDTO;
import com.cronos.entity.Categoria;
import com.cronos.entity.Producto;
import com.cronos.repository.CategoriaRepository;
import com.cronos.repository.ProductoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public List<ProductoDTO> listarDisponibles() {
        return productoRepository.findByActivoTrueAndDisponibleTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProductoDTO> listarPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaIdAndActivoTrue(categoriaId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProductoDTO buscarPorId(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con id: " + id));
        return toDTO(producto);
    }

    @Transactional
    public ProductoDTO crear(ProductoDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada con id: " + dto.getCategoriaId()));
        Producto producto = toEntity(dto, categoria);
        return toDTO(productoRepository.save(producto));
    }

    @Transactional
    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con id: " + id));
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada con id: " + dto.getCategoriaId()));
        producto.setCategoria(categoria);
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setImagenUrl(dto.getImagenUrl());
        producto.setDisponible(dto.isDisponible());
        producto.setActivo(dto.isActivo());
        producto.setTiempoPreparacionMin(dto.getTiempoPreparacionMin());
        producto.setOrdenDisplay(dto.getOrdenDisplay());
        return toDTO(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new EntityNotFoundException("Producto no encontrado con id: " + id);
        }
        productoRepository.deleteById(id);
    }

    private ProductoDTO toDTO(Producto producto) {
        return ProductoDTO.builder()
                .id(producto.getId())
                .categoriaId(producto.getCategoria().getId())
                .categoriaNombre(producto.getCategoria().getNombre())
                .nombre(producto.getNombre())
                .descripcion(producto.getDescripcion())
                .precio(producto.getPrecio())
                .imagenUrl(producto.getImagenUrl())
                .disponible(producto.isDisponible())
                .activo(producto.isActivo())
                .tiempoPreparacionMin(producto.getTiempoPreparacionMin())
                .ordenDisplay(producto.getOrdenDisplay())
                .build();
    }

    private Producto toEntity(ProductoDTO dto, Categoria categoria) {
        return Producto.builder()
                .categoria(categoria)
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .precio(dto.getPrecio())
                .imagenUrl(dto.getImagenUrl())
                .disponible(true)
                .activo(true)
                .tiempoPreparacionMin(dto.getTiempoPreparacionMin())
                .ordenDisplay(dto.getOrdenDisplay() != null ? dto.getOrdenDisplay() : 0)
                .build();
    }
}