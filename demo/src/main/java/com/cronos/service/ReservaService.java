package com.cronos.service;

import com.cronos.dto.DetallePedidoDTO;
import com.cronos.dto.PedidoDTO;
import com.cronos.dto.ReservaDTO;
import com.cronos.entity.DetallePedido;
import com.cronos.entity.DetalleFactura;
import com.cronos.entity.Factura;
import com.cronos.entity.Mesa;
import com.cronos.entity.Pedido;
import com.cronos.entity.Reserva;
import com.cronos.entity.Usuario;
import com.cronos.entity.Producto;
import com.cronos.repository.MesaRepository;
import com.cronos.repository.PedidoRepository;
import com.cronos.repository.ProductoRepository;
import com.cronos.repository.FacturaRepository;
import com.cronos.repository.ReservaRepository;
import com.cronos.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final MesaRepository mesaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final FacturaRepository facturaRepository;
    private final ConsultaSunatReniecService consultaService;

    public List<ReservaDTO> listarTodas() {
        return reservaRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ReservaDTO> listarPorFecha(LocalDate fecha) {
        return reservaRepository.findByFecha(fecha)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ReservaDTO> listarPorEstado(Reserva.EstadoReserva estado) {
        return reservaRepository.findByEstado(estado)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ReservaDTO buscarPorId(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada con id: " + id));
        return toDTO(reserva);
    }

    @Transactional
    public ReservaDTO crear(ReservaDTO dto) {
        Mesa mesa = mesaRepository.findById(dto.getMesaId())
                .orElseThrow(() -> new EntityNotFoundException("Mesa no encontrada con id: " + dto.getMesaId()));

        boolean mesaOcupada = reservaRepository.existsByMesaIdAndFechaAndTurnoAndEstadoNot(
                dto.getMesaId(),
                dto.getFecha(),
                dto.getTurno(),
                Reserva.EstadoReserva.CANCELADA
        );

        if (mesaOcupada) {
            throw new IllegalArgumentException("La mesa ya tiene una reserva en ese turno y fecha");
        }

        if (dto.getNumPersonas() > mesa.getCapacidad()) {
            throw new IllegalArgumentException("El número de personas supera la capacidad de la mesa");
        }

        Usuario usuarioRegistro = null;
        if (dto.getUsuarioRegistroId() != null) {
            usuarioRegistro = usuarioRepository.findById(dto.getUsuarioRegistroId()).orElse(null);
        } else {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                usuarioRegistro = usuarioRepository.findByEmail(auth.getName()).orElse(null);
            }
        }

        // Reglas de negocio para pagos y pre-pedido según la cantidad de personas
        Pedido pedido = null;
        boolean pagoEnLineaRealizado = false;

        if (dto.getNumPersonas() >= 3) {
            // Mandatorio pre-pedido y pago online
            if (dto.getDetallesPedido() == null || dto.getDetallesPedido().isEmpty()) {
                throw new IllegalArgumentException("Para reservas de 3 a más personas, es obligatorio realizar un pre-pedido y pagarlo en línea.");
            }
            if (dto.getMetodoPago() == null || dto.getMetodoPago() == Factura.MetodoPago.EFECTIVO) {
                throw new IllegalArgumentException("Para reservas de 3 a más personas, el pago debe ser en línea (Tarjeta o QR).");
            }
            if (dto.getTransaccionId() == null || dto.getTransaccionId().trim().isEmpty()) {
                throw new IllegalArgumentException("El ID de transacción de pago es obligatorio para reservas de 3 a más personas.");
            }
        }

        // Si se incluye pre-pedido
        if (dto.getDetallesPedido() != null && !dto.getDetallesPedido().isEmpty()) {
            if (usuarioRegistro == null) {
                throw new IllegalArgumentException("Se requiere un usuario registrado y autenticado para realizar una reserva con pre-pedido.");
            }

            pedido = Pedido.builder()
                    .mesa(mesa)
                    .usuario(usuarioRegistro)
                    .estado(Pedido.EstadoPedido.PENDIENTE)
                    .observaciones("Pre-pedido de Reserva")
                    .detalles(new ArrayList<>())
                    .build();

            for (DetallePedidoDTO detDTO : dto.getDetallesPedido()) {
                Producto producto = productoRepository.findById(detDTO.getProductoId())
                        .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con id: " + detDTO.getProductoId()));
                DetallePedido detalle = DetallePedido.builder()
                        .pedido(pedido)
                        .producto(producto)
                        .cantidad(detDTO.getCantidad())
                        .precioUnitario(producto.getPrecio())
                        .notas(detDTO.getNotas())
                        .build();
                pedido.getDetalles().add(detalle);
            }

            BigDecimal total = pedido.getDetalles().stream()
                    .map(d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            pedido.setTotal(total);

            // Verificar si el pago es online
            if (dto.getMetodoPago() != null && dto.getMetodoPago() != Factura.MetodoPago.EFECTIVO && dto.getTransaccionId() != null && !dto.getTransaccionId().trim().isEmpty()) {
                pagoEnLineaRealizado = true;
            }
        }

        Reserva.EstadoReserva estadoReserva = Reserva.EstadoReserva.PENDIENTE;
        if (pagoEnLineaRealizado || (dto.getNumPersonas() < 3 && (dto.getDetallesPedido() == null || dto.getDetallesPedido().isEmpty()))) {
            estadoReserva = Reserva.EstadoReserva.CONFIRMADA;
        } else {
            estadoReserva = Reserva.EstadoReserva.PENDIENTE;
        }

        Reserva reserva = Reserva.builder()
                .mesa(mesa)
                .clienteNombre(dto.getClienteNombre())
                .clienteTelefono(dto.getClienteTelefono())
                .clienteEmail(dto.getClienteEmail())
                .fecha(dto.getFecha())
                .turno(dto.getTurno())
                .numPersonas(dto.getNumPersonas())
                .estado(estadoReserva)
                .observaciones(dto.getObservaciones())
                .usuarioRegistro(usuarioRegistro)
                .horaComida(dto.getHoraComida())
                .comidaServidaCaliente(dto.isComidaServidaCaliente())
                .minutosAdicionales(dto.getMinutosAdicionales() != null ? dto.getMinutosAdicionales() : 0)
                .build();

        if (pedido != null) {
            // Guardamos el pedido primero
            pedido = pedidoRepository.save(pedido);
            reserva.setPedido(pedido);

            // Si se pagó online, emitimos factura
            // Si se pagó online, emitimos factura
            if (pagoEnLineaRealizado) {
                Factura.TipoComprobante tipoComp = dto.getTipoComprobante() != null ? dto.getTipoComprobante() : Factura.TipoComprobante.BOLETA;
                BigDecimal subtotal = pedido.getTotal().divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
                BigDecimal igv = pedido.getTotal().subtract(subtotal);

                String clienteNombre = dto.getClienteNombre();
                String clienteDocumento = dto.getClienteEmail();
                String razonSocial = null;

                if (tipoComp == Factura.TipoComprobante.FACTURA) {
                    if (dto.getClienteRuc() == null || dto.getClienteRuc().trim().length() != 11) {
                        throw new IllegalArgumentException("El RUC es obligatorio y debe tener 11 dígitos para una Factura.");
                    }
                    java.util.Map<String, String> sunatData = consultaService.consultarSunat(dto.getClienteRuc());
                    razonSocial = sunatData.get("razonSocial");
                    clienteNombre = razonSocial;
                } else {
                    if (clienteNombre == null || clienteNombre.trim().isEmpty()) {
                        clienteNombre = usuarioRegistro.getNombre();
                    }
                    if (usuarioRegistro.getDni() != null) {
                        clienteDocumento = usuarioRegistro.getDni();
                    }
                }

                Factura factura = Factura.builder()
                        .pedido(pedido)
                        .usuario(usuarioRegistro)
                        .numeroComprobante(generarNumeroComprobante(tipoComp))
                        .tipoComprobante(tipoComp)
                        .clienteNombre(clienteNombre)
                        .clienteDocumento(clienteDocumento)
                        .clienteRuc(dto.getClienteRuc())
                        .razonSocial(razonSocial)
                        .subtotal(subtotal)
                        .igv(igv)
                        .total(pedido.getTotal())
                        .metodoPago(dto.getMetodoPago())
                        .transaccionId(dto.getTransaccionId())
                        .montoPagado(pedido.getTotal())
                        .estadoPago(Factura.EstadoPago.APROBADO)
                        .fechaPago(LocalDateTime.now())
                        .detalles(new ArrayList<>())
                        .build();

                for (DetallePedido det : pedido.getDetalles()) {
                    DetalleFactura detalleFactura = DetalleFactura.builder()
                            .factura(factura)
                            .descripcion(det.getProducto().getNombre())
                            .cantidad(det.getCantidad())
                            .precioUnitario(det.getPrecioUnitario())
                            .build();
                    factura.getDetalles().add(detalleFactura);
                }

                facturaRepository.save(factura);
            }
        }

        // Solo marcar como RESERVADA si la reserva es para hoy
        if (dto.getFecha().equals(LocalDate.now())) {
            mesa.setEstado(Mesa.EstadoMesa.RESERVADA);
            mesaRepository.save(mesa);
        }

        return toDTO(reservaRepository.save(reserva));
    }

    @Transactional
    public ReservaDTO cambiarEstado(Long id, Reserva.EstadoReserva estado) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada con id: " + id));
        reserva.setEstado(estado);
        if (estado == Reserva.EstadoReserva.CANCELADA) {
            reserva.getMesa().setEstado(Mesa.EstadoMesa.LIBRE);
            mesaRepository.save(reserva.getMesa());

            if (reserva.getPedido() != null) {
                Pedido pedido = reserva.getPedido();
                pedido.setEstado(Pedido.EstadoPedido.CANCELADO);
                pedidoRepository.save(pedido);

                facturaRepository.findByPedidoId(pedido.getId()).ifPresent(factura -> {
                    factura.setEstadoPago(Factura.EstadoPago.ANULADO);
                    facturaRepository.save(factura);
                });
            }
        }
        if (estado == Reserva.EstadoReserva.CONFIRMADA) {
            reserva.getMesa().setEstado(Mesa.EstadoMesa.RESERVADA);
            mesaRepository.save(reserva.getMesa());
        }
        return toDTO(reservaRepository.save(reserva));
    }

    @Transactional
    public ReservaDTO ampliarMinutos(Long id, int minutos) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada con id: " + id));
        if (reserva.getEstado() == Reserva.EstadoReserva.CANCELADA || reserva.getEstado() == Reserva.EstadoReserva.COMPLETADA) {
            throw new IllegalArgumentException("No se puede ampliar los minutos de una reserva cancelada o completada.");
        }
        if (minutos < 0) {
            throw new IllegalArgumentException("Los minutos a ampliar deben ser mayores o iguales a cero.");
        }
        reserva.setMinutosAdicionales(reserva.getMinutosAdicionales() + minutos);
        return toDTO(reservaRepository.save(reserva));
    }

    private ReservaDTO toDTO(Reserva reserva) {
        String ruc = null;
        if (reserva.getPedido() != null) {
            Factura factura = facturaRepository.findByPedidoId(reserva.getPedido().getId()).orElse(null);
            if (factura != null) {
                ruc = factura.getClienteRuc();
            }
        }

        return ReservaDTO.builder()
                .id(reserva.getId())
                .mesaId(reserva.getMesa().getId())
                .mesaNumero(reserva.getMesa().getNumero())
                .clienteNombre(reserva.getClienteNombre())
                .clienteTelefono(reserva.getClienteTelefono())
                .clienteEmail(reserva.getClienteEmail())
                .fecha(reserva.getFecha())
                .turno(reserva.getTurno())
                .numPersonas(reserva.getNumPersonas())
                .estado(reserva.getEstado())
                .observaciones(reserva.getObservaciones())
                .fechaCreacion(reserva.getFechaCreacion())
                .usuarioRegistroId(reserva.getUsuarioRegistro() != null ? reserva.getUsuarioRegistro().getId() : null)
                .horaComida(reserva.getHoraComida())
                .comidaServidaCaliente(reserva.isComidaServidaCaliente())
                .minutosAdicionales(reserva.getMinutosAdicionales())
                .pedido(toPedidoDTO(reserva.getPedido()))
                .clienteRuc(ruc)
                .build();
    }

    private PedidoDTO toPedidoDTO(Pedido pedido) {
        if (pedido == null) return null;
        return PedidoDTO.builder()
                .id(pedido.getId())
                .mesaId(pedido.getMesa().getId())
                .mesaNumero(pedido.getMesa().getNumero())
                .usuarioId(pedido.getUsuario().getId())
                .usuarioNombre(pedido.getUsuario().getNombre())
                .estado(pedido.getEstado())
                .fechaHora(pedido.getFechaHora())
                .fechaHoraEntrega(pedido.getFechaHoraEntrega())
                .total(pedido.getTotal())
                .observaciones(pedido.getObservaciones())
                .detalles(pedido.getDetalles().stream().map(this::detalleToDTO).collect(Collectors.toList()))
                .build();
    }

    private DetallePedidoDTO detalleToDTO(DetallePedido detalle) {
        if (detalle == null) return null;
        return DetallePedidoDTO.builder()
                .id(detalle.getId())
                .pedidoId(detalle.getPedido().getId())
                .productoId(detalle.getProducto().getId())
                .productoNombre(detalle.getProducto().getNombre())
                .cantidad(detalle.getCantidad())
                .precioUnitario(detalle.getPrecioUnitario())
                .subtotal(detalle.getSubtotal())
                .notas(detalle.getNotas())
                .build();
    }

    private String generarNumeroComprobante(Factura.TipoComprobante tipo) {
        String prefijo = tipo == Factura.TipoComprobante.FACTURA ? "F001" : "B001";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        return prefijo + "-" + timestamp;
    }
}