import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { CrudGenericoService } from '../../services/crud-generico.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  usuarioActual: any = null;
  isLoggedIn = false;

  // Catálogo
  destacados: any[] = [];
  snacks: any[] = [];
  bebidas: any[] = [];
  licores: any[] = [];

  // Carrito
  cart: any[] = [];
  cartCount = 0;
  totalCart = 0;
  isCartOpen = false;
  cartCheckMap: { [key: number]: boolean } = {};
  toasts: any[] = [];
  toastId = 0;

  constructor(
    private authService: AuthService,
    private genericService: CrudGenericoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.getUsuario();
    this.isLoggedIn = this.authService.isLoggedIn();

    this.cargarCatalogo();
    this.loadCartFromStorage();
  }

  cargarCatalogo(): void {
    this.genericService.listar('productos').subscribe({
      next: (data) => {
        const activos = data.filter(p => p.disponible && p.activo);
        this.destacados = activos.filter(p => p.categoriaNombre === 'Entradas' || p.categoriaNombre === 'Platos de Fondo').slice(0, 3);
        this.snacks = activos.filter(p => p.categoriaNombre === 'Snacks').slice(0, 3);
        this.bebidas = activos.filter(p => p.categoriaNombre === 'Bebidas').slice(0, 3);
        this.licores = activos.filter(p => p.categoriaNombre === 'Licores').slice(0, 3);
      },
      error: () => {
        const mockActivos = [
          { id: 1, nombre: 'Lomo Saltado Premium', descripcion: 'Dados de lomo de res saltados al wok, cebolla roja, tomates frescos, papas amarillas fritas y arroz graneado.', precio: 45.0, disponible: true, activo: true, categoriaNombre: 'Platos de Fondo' },
          { id: 2, nombre: 'Ceviche Carretillero', descripcion: 'Pescado fresco marinado en zumo de limón de Chulucanas, ají limo, cebolla roja, camote glaseado, choclo desgranado y chicharrón de calamar.', precio: 38.0, disponible: true, activo: true, categoriaNombre: 'Entradas' },
          { id: 3, nombre: 'Ají de Gallina Tradicional', descripcion: 'Pechuga de gallina deshilachada en crema de ají amarillo, pan, leche, queso andino y pecanas. Servido con arroz.', precio: 29.0, disponible: true, activo: true, categoriaNombre: 'Platos de Fondo' },
          { id: 4, nombre: 'Tequeños Cronos', descripcion: 'Masa de wantán rellena de queso andino y jamón del país. Acompañado de salsa de guacamole especial.', precio: 18.0, disponible: true, activo: true, categoriaNombre: 'Snacks' },
          { id: 5, nombre: 'Papas Nativas con Huancaína', descripcion: 'Papas nativas sancochadas bañadas en una cremosa salsa de ají amarillo, queso y leche fresca.', precio: 16.0, disponible: true, activo: true, categoriaNombre: 'Snacks' },
          { id: 6, nombre: 'Chicha Morada de la Casa', descripcion: 'Bebida tradicional a base de maíz morado hervido con piña, manzana, membrillo, canela y clavo.', precio: 12.0, disponible: true, activo: true, categoriaNombre: 'Bebidas' },
          { id: 7, nombre: 'Inca Kola 500ml', descripcion: 'Gaseosa tradicional peruana fría.', precio: 5.0, disponible: true, activo: true, categoriaNombre: 'Bebidas' },
          { id: 8, nombre: 'Pisco Sour Clásico', descripcion: 'Nuestra bebida bandera. Pisco Acholado, jarabe de goma, zumo de limón verde fresco, clara de huevo y gotas de amargo de angostura.', precio: 22.0, disponible: true, activo: true, categoriaNombre: 'Licores' },
          { id: 9, nombre: 'Maracuyá Sour', descripcion: 'Cóctel refrescante a base de Pisco quebranta, zumo concentrado de maracuyá y clara de huevo.', precio: 22.0, disponible: true, activo: true, categoriaNombre: 'Licores' }
        ];

        this.destacados = mockActivos.filter(p => p.categoriaNombre === 'Platos de Fondo' || p.categoriaNombre === 'Entradas').slice(0, 3);
        this.snacks = mockActivos.filter(p => p.categoriaNombre === 'Snacks').slice(0, 3);
        this.bebidas = mockActivos.filter(p => p.categoriaNombre === 'Bebidas').slice(0, 3);
        this.licores = mockActivos.filter(p => p.categoriaNombre === 'Licores').slice(0, 3);
      }
    });
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
    return '🍛';
  }

  loadCartFromStorage(): void {
    const local = localStorage.getItem('temp_cart');
    if (local) {
      this.cart = JSON.parse(local);
      this.calculateCartTotals();
    }
  }

  saveCartToStorage(): void {
    localStorage.setItem('temp_cart', JSON.stringify(this.cart));
  }

  showToast(mensaje: string): void {
    const id = this.toastId++;
    this.toasts.push({ id, mensaje });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  }

  addToCart(producto: any): void {
    const existe = this.cart.find(item => item.producto.id === producto.id);
    if (existe) {
      existe.cantidad++;
    } else {
      this.cart.push({ producto, cantidad: 1, notas: '' });
    }
    
    this.showToast(`${producto.nombre} añadido al pedido`);

    this.calculateCartTotals();
    this.saveCartToStorage();
  }

  modifyQty(index: number, cambio: number): void {
    const item = this.cart[index];
    item.cantidad += cambio;
    if (item.cantidad <= 0) {
      this.removeFromCart(index);
    } else {
      this.calculateCartTotals();
      this.saveCartToStorage();
    }
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
    this.calculateCartTotals();
    this.saveCartToStorage();
  }

  calculateCartTotals(): void {
    this.cartCount = this.cart.reduce((acc, item) => acc + item.cantidad, 0);
    this.totalCart = this.cart.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  confirmarPedidoCart(): void {
    this.isCartOpen = false;
    this.router.navigate(['/checkout']); // Redirigir directamente al checkout
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.usuarioActual = null;
    this.router.navigate(['/']);
  }
}
