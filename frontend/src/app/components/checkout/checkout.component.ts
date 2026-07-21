import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { ReservaService } from '../../services/reserva.service';
import { ConsultaService } from '../../services/consulta.service';
import { FacturaService } from '../../services/factura.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  usuarioActual: any = null;
  isLoggedIn = false;

  cart: any[] = [];
  totalCart = 0;

  // Formulario reserva
  fechaBusqueda = '';
  turnoBusqueda = 'ALMUERZO';
  personasBusqueda = 2;
  mesasDisponibles: any[] = [];
  buscarRealizado = false;

  mesaSeleccionada: any = null;
  comidaServidaCaliente = false;
  metodoPago = 'EFECTIVO';
  transaccionId = '';
  tipoComprobante = 'BOLETA';
  clienteRuc = '';
  razonSocial = '';

  resError = '';
  resSuccess = '';

  // Visor PDF interactivo
  mostrarPdfSimulado = false;
  ticketEmitido: any = null;

  constructor(
    private authService: AuthService,
    private reservaService: ReservaService,
    private consultaService: ConsultaService,
    private facturaService: FacturaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.getUsuario();
    this.isLoggedIn = this.authService.isLoggedIn();

    // Cargar fecha local de hoy por defecto (evitando el desfase de zona horaria)
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const localHoy = new Date(hoy.getTime() - (offset * 60 * 1000));
    this.fechaBusqueda = localHoy.toISOString().substring(0, 10);

    // Cargar carrito de localStorage
    this.loadCart();
  }

  loadCart(): void {
    const local = localStorage.getItem('temp_cart');
    if (local) {
      this.cart = JSON.parse(local);
      this.calculateCartTotals();
    }
  }

  saveCart(): void {
    localStorage.setItem('temp_cart', JSON.stringify(this.cart));
  }

  calculateCartTotals(): void {
    this.totalCart = this.cart.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  }

  modifyQty(index: number, cambio: number): void {
    const item = this.cart[index];
    item.cantidad += cambio;
    if (item.cantidad <= 0) {
      this.removeFromCart(index);
    } else {
      this.calculateCartTotals();
      this.saveCart();
    }
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
    this.calculateCartTotals();
    this.saveCart();
  }

  getGradient(categoria: string): string {
    const cat = categoria ? categoria.toLowerCase() : '';
    if (cat.includes('fondo') || cat.includes('carne')) return 'linear-gradient(135deg, #1e0810 0%, #2a0f15 100%)';
    if (cat.includes('entrada') || cat.includes('marisco')) return 'linear-gradient(135deg, #0e1808 0%, #162210 100%)';
    if (cat.includes('bebida') || cat.includes('refresco')) return 'linear-gradient(135deg, #140a1a 0%, #1c0e24 100%)';
    if (cat.includes('licor') || cat.includes('coctel') || cat.includes('premium')) return 'linear-gradient(135deg, #180c04 0%, #241408 100%)';
    return 'linear-gradient(135deg, #1a120a 0%, #241808 100%)';
  }

  getEmoji(categoria: string, nombre: string): string {
    const nom = nombre.toLowerCase();
    if (nom.includes('ceviche')) return '🐟';
    if (nom.includes('papa')) return '🥔';
    if (nom.includes('tequeño')) return '🥟';
    if (nom.includes('lomo') || nom.includes('res')) return '🥩';
    if (nom.includes('arroz') || nom.includes('chaufa')) return '🍲';
    if (nom.includes('gallina') || nom.includes('pollo')) return '🍗';
    if (nom.includes('chicha') || nom.includes('gaseosa') || nom.includes('kola')) return '🥤';
    if (nom.includes('pisco') || nom.includes('sour')) return '🍹';
    if (nom.includes('maracuyá')) return '🍸';
    if (nom.includes('suspiro') || nom.includes('tres leches') || nom.includes('postre')) return '🍰';
    return '🍛';
  }

  buscarMesasDisponibles(): void {
    this.buscarRealizado = false;
    this.mesasDisponibles = [];
    this.mesaSeleccionada = null;

    if (!this.fechaBusqueda || !this.turnoBusqueda || !this.personasBusqueda) {
      return;
    }

    this.reservaService.listarMesasDisponibles(this.fechaBusqueda, this.turnoBusqueda, this.personasBusqueda).subscribe({
      next: (data) => {
        const comensales = this.personasBusqueda;
        // Filtrar mesas para que la capacidad sea adecuada y cercana (capacidad <= comensales + 2)
        this.mesasDisponibles = data.filter(m => m.capacidad >= comensales && m.capacidad <= comensales + 2);
        this.buscarRealizado = true;
      }
    });
  }

  buscarRuc(): void {
    this.resError = '';
    if (!this.clienteRuc || this.clienteRuc.length !== 11) {
      this.resError = 'El RUC debe tener 11 dígitos.';
      return;
    }
    this.consultaService.consultarSunat(this.clienteRuc).subscribe({
      next: (res) => {
        this.razonSocial = res.razonSocial;
      },
      error: (err) => {
        this.resError = err.error?.message || 'Error al conectar con la consulta de RUC.';
      }
    });
  }

  redirigirAlLogin(): void {
    // El carrito ya está guardado en localStorage. Al iniciar sesión, LoginComponent lo redirigirá aquí.
    alert('Por favor inicie sesión o regístrese para poder confirmar su reserva.');
    this.router.navigate(['/login']);
  }

  confirmarReserva(): void {
    this.resError = '';
    this.resSuccess = '';

    if (!this.isLoggedIn) {
      this.redirigirAlLogin();
      return;
    }

    if (!this.mesaSeleccionada) {
      this.resError = 'Seleccione una mesa disponible de la lista.';
      return;
    }

    if (this.personasBusqueda >= 3 && this.cart.length === 0) {
      this.resError = 'Para reservas de 3 o más personas, es obligatorio realizar un pre-pedido.';
      return;
    }

    if (this.personasBusqueda >= 3 && this.metodoPago !== 'MERCADO_PAGO') {
      this.resError = 'Para reservas de 3 o más personas, el pago mediante Mercado Pago es obligatorio.';
      return;
    }

    if (this.metodoPago === 'MERCADO_PAGO' && this.transaccionId && this.personasBusqueda >= 3) {
      // Manual transaccionId is only allowed for small groups; for 3+ use Checkout Pro
      this.resError = 'Para reservas de 3 o más personas, use el pago con Mercado Pago online.';
      return;
    }

    if (this.tipoComprobante === 'FACTURA' && (!this.clienteRuc || !this.razonSocial)) {
      this.resError = 'Para emitir Factura, ingrese el RUC y realice la búsqueda de Razón Social.';
      return;
    }

    // Armar DTO
    const reservaDto: any = {
      mesaId: this.mesaSeleccionada.id,
      clienteNombre: this.tipoComprobante === 'FACTURA' ? this.razonSocial : this.usuarioActual.nombre,
      clienteTelefono: this.usuarioActual.telefono,
      clienteEmail: this.usuarioActual.email,
      fecha: this.fechaBusqueda,
      turno: this.turnoBusqueda,
      numPersonas: this.personasBusqueda,
      observaciones: 'Reserva Realizada desde Checkout Web',
      comidaServidaCaliente: this.comidaServidaCaliente,
      usuarioRegistroId: this.usuarioActual.id
    };

    if (this.cart.length > 0) {
      reservaDto.detallesPedido = this.cart.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        notas: item.notas
      }));
    }

    reservaDto.metodoPago = this.metodoPago;
    if (this.metodoPago === 'MERCADO_PAGO') {
      reservaDto.transaccionId = this.transaccionId;
    }
    reservaDto.tipoComprobante = this.tipoComprobante;
    if (this.tipoComprobante === 'FACTURA') {
      reservaDto.clienteRuc = this.clienteRuc;
    }

    this.reservaService.crear(reservaDto).subscribe({
      next: (res: any) => {
        // Si es Mercado Pago sin transaccionId manual, redirigir a Checkout Pro
        if (this.metodoPago === 'MERCADO_PAGO' && res.pedidoId) {
          this.facturaService.crearPreferencia(res.pedidoId).subscribe({
            next: (mpRes: any) => {
              if (mpRes.initPoint) {
                window.location.href = mpRes.initPoint;
              } else {
                this.resError = 'Error al obtener el enlace de pago de Mercado Pago.';
              }
            },
            error: (mpErr) => {
              this.resError = mpErr.error?.mensaje || 'Error al crear la preferencia de pago.';
            }
          });
          return;
        }

        this.resSuccess = 'Reserva registrada con éxito.';
        
        // Armar el ticket emitido para mostrar en PDF simulado
        this.ticketEmitido = {
          numeroComprobante: this.tipoComprobante === 'FACTURA' ? 'F001-' + Date.now().toString().slice(-8) : 'B001-' + Date.now().toString().slice(-8),
          fechaEmision: new Date(),
          clienteNombre: reservaDto.clienteNombre,
          clienteRuc: this.clienteRuc,
          razonSocial: this.razonSocial,
          clienteDocumento: this.usuarioActual.dni,
          metodoPago: this.metodoPago,
          transaccionId: this.transaccionId || (res as any)?.pedidoId?.toString(),
          total: this.totalCart,
          subtotal: this.totalCart / 1.18,
          igv: this.totalCart - (this.totalCart / 1.18),
          detalles: this.cart.map(item => ({
            descripcion: item.producto.nombre,
            cantidad: item.cantidad,
            subtotal: item.producto.precio * item.cantidad
          }))
        };

        this.mostrarPdfSimulado = true;
        this.clearCart();
      },
      error: (err) => {
        this.resError = err.error?.message || 'Error al procesar la reserva. Por favor reintente.';
      }
    });
  }

  printTicket(): void {
    window.print();
  }

  closePdfModal(): void {
    this.mostrarPdfSimulado = false;
    this.ticketEmitido = null;
    this.router.navigate(['/cliente']); // Redirigir directamente a ver sus reservas
  }

  clearCart(): void {
    this.cart = [];
    this.totalCart = 0;
    localStorage.removeItem('temp_cart');
    this.mesaSeleccionada = null;
    this.mesasDisponibles = [];
    this.transaccionId = '';
    this.clienteRuc = '';
    this.razonSocial = '';
    this.buscarRealizado = false;
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.usuarioActual = null;
    this.router.navigate(['/']);
  }
}
