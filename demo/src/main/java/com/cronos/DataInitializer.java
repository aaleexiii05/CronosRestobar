package com.cronos;

import com.cronos.entity.Categoria;
import com.cronos.entity.Mesa;
import com.cronos.entity.Producto;
import com.cronos.entity.Usuario;
import com.cronos.repository.CategoriaRepository;
import com.cronos.repository.MesaRepository;
import com.cronos.repository.ProductoRepository;
import com.cronos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final MesaRepository mesaRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    @Override
    public void run(String... args) throws Exception {
        inicializarAdmin();
        inicializarMesas();
        inicializarCategoriasYProductos();
    }

    private void inicializarAdmin() {
        Usuario admin = usuarioRepository.findByEmail("admin@cronos.com").orElse(null);
        if (admin == null) {
            log.info("Creando usuario administrador por defecto...");
            admin = Usuario.builder()
                    .nombre("Administrador Principal")
                    .dni("00000000")
                    .nombres("Administrador")
                    .apellidoPaterno("Principal")
                    .apellidoMaterno("Cronos")
                    .telefono("999999999")
                    .email("admin@cronos.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .rol(Usuario.Rol.ADMIN)
                    .activo(true)
                    .build();
            usuarioRepository.save(admin);
            log.info("Usuario administrador creado con éxito: admin@cronos.com / admin123");
        } else {
            log.info("Usuario administrador ya existe. Actualizando credenciales por defecto...");
            admin.setNombre("Administrador Principal");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRol(Usuario.Rol.ADMIN);
            admin.setActivo(true);
            usuarioRepository.save(admin);
            log.info("Usuario administrador actualizado con éxito: admin@cronos.com / admin123");
        }
    }

    private void inicializarMesas() {
        if (mesaRepository.count() == 0) {
            log.info("Inicializando mesas por defecto...");
            List<Mesa> mesas = List.of(
                    Mesa.builder().numero(1).capacidad(2).tipo(Mesa.TipoMesa.PAREJA).ubicacion("Zona Ventana").estado(Mesa.EstadoMesa.LIBRE).activa(true).build(),
                    Mesa.builder().numero(2).capacidad(4).tipo(Mesa.TipoMesa.PEQUENO).ubicacion("Zona Centro").estado(Mesa.EstadoMesa.LIBRE).activa(true).build(),
                    Mesa.builder().numero(3).capacidad(4).tipo(Mesa.TipoMesa.PEQUENO).ubicacion("Zona Terraza").estado(Mesa.EstadoMesa.LIBRE).activa(true).build(),
                    Mesa.builder().numero(4).capacidad(6).tipo(Mesa.TipoMesa.GRUPO).ubicacion("Zona Terraza").estado(Mesa.EstadoMesa.LIBRE).activa(true).build(),
                    Mesa.builder().numero(5).capacidad(10).tipo(Mesa.TipoMesa.EMPRESA).ubicacion("Salón Privado").estado(Mesa.EstadoMesa.LIBRE).activa(true).build(),
                    Mesa.builder().numero(6).capacidad(2).tipo(Mesa.TipoMesa.BARRA).ubicacion("Barra Central").estado(Mesa.EstadoMesa.LIBRE).activa(true).build(),
                    Mesa.builder().numero(7).capacidad(4).tipo(Mesa.TipoMesa.VIP).ubicacion("Zona VIP").estado(Mesa.EstadoMesa.LIBRE).activa(true).build()
            );
            mesaRepository.saveAll(mesas);
            log.info("Mesas inicializadas.");
        }
    }

    private void inicializarCategoriasYProductos() {
        log.info("Verificando e inicializando categorías y productos del restaurante...");
        
        Categoria entradas = categoriaRepository.findByNombre("Entradas").orElseGet(() -> 
            categoriaRepository.save(Categoria.builder().nombre("Entradas").descripcion("Aperitivos y entradas frías o calientes").ordenDisplay(1).activa(true).build())
        );
        Categoria fondos = categoriaRepository.findByNombre("Platos de Fondo").orElseGet(() -> 
            categoriaRepository.save(Categoria.builder().nombre("Platos de Fondo").descripcion("Platos principales y especialidades").ordenDisplay(2).activa(true).build())
        );
        Categoria bebidas = categoriaRepository.findByNombre("Bebidas").orElseGet(() -> 
            categoriaRepository.save(Categoria.builder().nombre("Bebidas").descripcion("Refrescos, jugos, tragos y licores").ordenDisplay(3).activa(true).build())
        );
        Categoria postres = categoriaRepository.findByNombre("Postres").orElseGet(() -> 
            categoriaRepository.save(Categoria.builder().nombre("Postres").descripcion("Postres tradicionales y helados").ordenDisplay(4).activa(true).build())
        );
        Categoria snacks = categoriaRepository.findByNombre("Snacks").orElseGet(() -> 
            categoriaRepository.save(Categoria.builder().nombre("Snacks").descripcion("Piqueos, snacks y entradas rápidas para compartir").ordenDisplay(5).activa(true).build())
        );
        Categoria licores = categoriaRepository.findByNombre("Licores").orElseGet(() -> 
            categoriaRepository.save(Categoria.builder().nombre("Licores").descripcion("Coctelería fina y destilados de autor").ordenDisplay(6).activa(true).build())
        );

        // Guardar productos si no existen
        // Entradas
        guardarProductoSiNoExiste(entradas, "Ceviche Carretillero", "Ceviche de pescado fresco con chicharrón de calamar, camote y choclo", 38.00, 10);
        guardarProductoSiNoExiste(entradas, "Papa a la Huancaína", "Papas cocidas bañadas en crema de ají amarillo, queso y leche", 18.00, 5);
        guardarProductoSiNoExiste(entradas, "Tequeños de Queso", "Tequeños rellenos de queso andino con salsa guacamole", 15.00, 8);
        
        // Fondos
        guardarProductoSiNoExiste(fondos, "Lomo Saltado", "Dados de lomo fino salteados al wok con cebolla, tomate, papas fritas y arroz", 45.00, 15);
        guardarProductoSiNoExiste(fondos, "Arroz con Mariscos", "Arroz criollo sazonado con mixtura de mariscos, arvejas y pimiento", 38.00, 15);
        guardarProductoSiNoExiste(fondos, "Ají de Gallina", "Pechuga de gallina deshilachada en crema de ají amarillo y nueces, con arroz", 28.00, 12);
        
        // Bebidas
        guardarProductoSiNoExiste(bebidas, "Chicha Morada (1L)", "Bebida tradicional de maíz morado con piña, manzana y canela", 12.00, 3);
        guardarProductoSiNoExiste(bebidas, "Inca Kola (500ml)", "Gaseosa tradicional peruana", 5.00, 2);
        
        // Postres
        guardarProductoSiNoExiste(postres, "Suspiro a la Limeña", "Crema de manjar blanco con merengue al oporto", 12.00, 4);
        guardarProductoSiNoExiste(postres, "Tres Leches", "Bizcocho bañado en tres tipos de leche con chantilly", 14.00, 4);
        guardarProductoSiNoExiste(postres, "Tres Leches de Lúcuma", "Bizcocho bañado en tres tipos de leche con pulpa de lúcuma y chantilly", 14.00, 4);

        // Snacks
        guardarProductoSiNoExiste(snacks, "Tequeños Cronos", "Masa de wantán rellena de queso andino y jamón del país. Acompañado de salsa de guacamole especial.", 18.00, 8);
        guardarProductoSiNoExiste(snacks, "Papas Nativas con Huancaína", "Papas nativas sancochadas bañadas en una cremosa salsa de ají amarillo, queso y leche fresca.", 16.00, 5);

        // Licores
        guardarProductoSiNoExiste(licores, "Pisco Sour Clásico", "Nuestra bebida bandera. Pisco Acholado, jarabe de goma, zumo de limón verde fresco, clara de huevo y gotas de amargo de angostura.", 22.00, 5);
        guardarProductoSiNoExiste(licores, "Maracuyá Sour", "Cóctel refrescante a base de Pisco quebranta, zumo concentrado de maracuyá y clara de huevo.", 22.00, 5);
    }

    private void guardarProductoSiNoExiste(Categoria cat, String nombre, String desc, double precio, int tiempoPrep) {
        if (!productoRepository.existsByNombre(nombre)) {
            productoRepository.save(Producto.builder()
                    .categoria(cat)
                    .nombre(nombre)
                    .descripcion(desc)
                    .precio(BigDecimal.valueOf(precio))
                    .tiempoPreparacionMin(tiempoPrep)
                    .disponible(true)
                    .activo(true)
                    .build());
            log.info("Producto creado en BD: " + nombre);
        }
    }
}
