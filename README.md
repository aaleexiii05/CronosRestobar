# Cronos Restobar

Sistema de gestión para restaurante/bar con arquitectura de microservicios. Incluye reservas, pedidos, facturación electrónica (Boleta/Factura con IGV), consulta RUC/DNI vía API SUNAT/RENIEC, inventario, notificaciones SSE, y pagos online con Mercado Pago.

## Arquitectura

```
                    ┌──────────────┐
                    │   Eureka     │
                    │  Server 8761 │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │   Gateway    │
                    │    8080      │
                    └──┬──┬──┬──┬─┘
         ┌─────────────┘  │  │  └──────────────┐
         │    ┌────────────┘  └───────────┐     │
    ┌────┴───┐ ┌────┴───┐ ┌──────┴──┐ ┌───┴──┐ ┌┴────────┐
    │  Auth  │ │  Menu  │ │ Order   │ │Bill. │ │Inventory │
    │  8081  │ │ 8082   │ │ 8083    │ │8084  │ │ 8085     │
    └────────┘ └────────┘ └─────────┘ └──────┘ └──────────┘
    ┌────────┐ ┌────────┐ ┌─────────┐ ┌──────┐
    │Reserv. │ │Consulta│ │Notif.   │ │Eureka│
    │ 8086   │ │ 8087   │ │ 8088    │ │ 8761 │
    └────────┘ └────────┘ └─────────┘ └──────┘
```

### Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **gateway-service** | 8080 | Spring Cloud Gateway — punto de entrada único, JWT filter, routing basado en Eureka |
| **eureka-server** | 8761 | Netflix Eureka — discovery service |
| **auth-service** | 8081 | Autenticación JWT + BCrypt, registro/login, CRUD usuarios |
| **menu-service** | 8082 | Catálogo de productos y categorías |
| **order-service** | 8083 | Gestión de pedidos con detalle, pendientes de cobro |
| **billing-service** | 8084 | Facturación (Boleta/Factura), integración Mercado Pago |
| **inventory-service** | 8085 | Insumos y movimientos de stock |
| **reservation-service** | 8086 | Mesas y reservas |
| **consulta-service** | 8087 | Consultas DNI/RUC vía API Perú (RENIEC/SUNAT) |
| **notification-service** | 8088 | Hub SSE centralizado para notificaciones en tiempo real |

### Stack Tecnológico

- **Backend**: Java 21, Spring Boot 3.2.4, Spring Cloud 2023.0.1
- **Frontend**: Angular 18.2, Angular Material, TypeScript 5.5
- **Base de datos**: MySQL 8.3 (base separada por servicio)
- **Discovery**: Netflix Eureka
- **Gateway**: Spring Cloud Gateway + JWT Filter
- **Pagos**: Mercado Pago SDK Java (Checkout Pro)
- **Build**: Maven wrapper por servicio, npm para frontend
- **Infraestructura**: Docker Compose (MySQL)

## Requisitos

- Java 21 (Temurin/OpenJDK)
- Node.js 18+
- Docker Desktop (para MySQL)
- Maven (o usar los wrappers `./mvnw`)

## Inicio Rápido

### 1. Base de Datos

```bash
docker compose up -d
```

Crea las 6 bases de datos (`menu_db`, `auth_db`, `order_db`, `billing_db`, `inventory_db`, `reservation_db`).
Los schemas se generan automáticamente vía `spring.jpa.hibernate.ddl-auto=update`.

### 2. Eureka Server

```bash
cd eureka-server && ./mvnw spring-boot:run
```

### 3. Servicios (orden recomendado)

```bash
# En terminales separadas:
cd auth-service       && ./mvnw spring-boot:run   # 8081
cd menu-service       && ./mvnw spring-boot:run   # 8082
cd order-service      && ./mvnw spring-boot:run   # 8083
cd billing-service    && ./mvnw spring-boot:run   # 8084
cd inventory-service  && ./mvnw spring-boot:run   # 8085
cd reservation-service && ./mvnw spring-boot:run  # 8086
cd consulta-service   && ./mvnw spring-boot:run   # 8087
cd notification-service && ./mvnw spring-boot:run # 8088
```

### 4. Gateway

```bash
cd gateway-service && ./mvnw spring-boot:run      # 8080
```

### 5. Frontend

```bash
cd frontend && npm install && npm start            # 4200
```

Acceder a: `http://localhost:4200`

## Endpoints del Gateway

| Ruta | Auth | Servicio destino |
|------|------|------------------|
| `/api/auth/**` | No | auth-service |
| `/api/internal/**` | No | auth-service |
| `/api/consultas/**` | No | consulta-service |
| `/api/facturas/webhook` | No | billing-service (webhook MP) |
| `/api/productos/**` | Sí | menu-service |
| `/api/categorias/**` | Sí | menu-service |
| `/api/pedidos/**` | Sí | order-service |
| `/api/facturas/**` | Sí | billing-service |
| `/api/insumos/**` | Sí | inventory-service |
| `/api/movimientos-stock/**` | Sí | inventory-service |
| `/api/mesas/**` | Sí | reservation-service |
| `/api/reservas/**` | Sí | reservation-service |
| `/api/notificaciones/**` | Sí | notification-service |

## Roles de Usuario

| Rol | Acceso |
|-----|--------|
| `CLIENTE` | Menú, reservas propias, checkout |
| `CAJERO` | Dashboard de cobros, emitir comprobantes |
| `ADMIN` | CRUD completo de todos los servicios, reportes |

## Mercado Pago

### Configuración

En `billing-service/src/main/resources/application.properties`:

```properties
mercadopago.access.token=APP_USR-xxxx-xxxx
mercadopago.back-urls.success=http://localhost:4200/cliente
mercadopago.back-urls.failure=http://localhost:4200/checkout
mercadopago.webhook-url=https://tu-domain.ngrok-free.app/api/facturas/webhook
```

### Flujo Checkout Pro

```
Frontend                    Backend                        Mercado Pago
   │                           │                               │
   ├── POST /api/reservas ────►│                               │
   │                           ├── crear pedido                │
   │                           ├── crear factura (PENDIENTE)   │
   │◄── { pedidoId } ──────────┤                               │
   │                           │                               │
   ├── POST /crear-preferencia►│                               │
   │                           ├── POST /preferences ─────────►│
   │                           │◄── preference + init_point ───│
   │◄── { initPoint } ────────┤                               │
   │                           │                               │
   ├── redirect a initPoint ───┼──────────────────────────────►│
   │                           │                               │  (usuario paga)
   │                           │◄── POST /webhook ─────────────┤
   │                           │    (notification)             │
   │                           ├── GET /payments/{id} ────────►│
   │                           │◄── status: approved ──────────│
   │                           │                               │
   │◄── redirect a back_url ───┼───────────────────────────────┤
```

### Webhook

El endpoint `/api/facturas/webhook` es público en el gateway y recibe notificaciones de Mercado Pago. Para desarrollo, exponer con ngrok:

```bash
ngrok http http://localhost:8080
```

## API endpoints principales

### Auth (`/api/auth`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/registro` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión (devuelve JWT) |
| GET | `/api/auth/me` | Datos del usuario autenticado |

### Facturación (`/api/facturas`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/facturas` | Listar todas |
| GET | `/api/facturas/{id}` | Buscar por ID |
| POST | `/api/facturas` | Emitir comprobante |
| POST | `/api/facturas/{id}/anular` | Anular factura (con reembolso MP) |
| POST | `/api/facturas/crear-preferencia` | Crear preferencia MP |
| POST | `/api/facturas/webhook` | Webhook MP |
| GET | `/api/facturas/mercadopago/{id}` | Consultar pago en MP |

### Pedidos (`/api/pedidos`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/pedidos` | Listar todos |
| GET | `/api/pedidos/pendientes-cobro` | Pendientes de cobro |
| POST | `/api/pedidos` | Crear pedido |
| PATCH | `/{id}/estado?estado=X` | Cambiar estado |

### Reservas (`/api/reservas`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reservas` | Listar todas |
| GET | `/{id}` | Buscar por ID |
| POST | `/api/reservas` | Crear reserva (con pre-pedido) |
| PUT | `/{id}` | Actualizar |
| DELETE | `/{id}` | Eliminar |

## Pruebas con Mercado Pago

1. Usar el `APP_USR` de prueba de la sección **Pruebas** de tu aplicación en Mercado Pago
2. Crear una **cuenta de prueba compradora** desde *Tus integraciones > tu aplicación > Pruebas > Cuentas de prueba*
3. El `init_point` generado es la URL del checkout (NO `sandbox_init_point`)
4. Iniciar sesión en el checkout con la cuenta compradora de prueba
5. Si pide validación por email, el código de 6 dígitos se obtiene desde la misma sección

## Base de Datos

Cada microservicio tiene su propia base de datos en MySQL:

| Servicio | Base de datos |
|----------|--------------|
| auth-service | `auth_db` |
| menu-service | `menu_db` |
| order-service | `order_db` |
| billing-service | `billing_db` |
| inventory-service | `inventory_db` |
| reservation-service | `reservation_db` |

Los schemas se gestionan con `spring.jpa.hibernate.ddl-auto=update`.

## JWT

- Secret compartido entre gateway y auth-service
- Claims: `userId`, `role`
- El gateway inyecta headers `X-User-Id` y `X-User-Role` a los servicios internos
- Las rutas públicas no requieren token: `/api/auth/**`, `/api/internal/**`, `/api/consultas/**`, `/api/facturas/webhook`

## Desarrollo

### Compilar un servicio

```bash
cd <service-name> && ./mvnw compile
```

### Compilar todos los servicios

```bash
for d in */; do
  [ -f "$d/mvnw" ] && (cd "$d" && ./mvnw compile -q)
done
```

### Verificar TypeScript

```bash
cd frontend && npx tsc --noEmit
```

### Proxy Frontend

El frontend usa `proxy.conf.json` para redirigir `/api/*` al gateway (`localhost:8080`) durante desarrollo.
