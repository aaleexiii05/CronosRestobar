import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { CrudGenericoService } from '../../services/crud-generico.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  usuarioActual: any = null;
  isLoggedIn = false;

  categoriasDisponibles = ['Entradas', 'Platos de Fondo', 'Snacks', 'Postres', 'Bebidas', 'Licores'];
  productos: any[] = [];
  filtroActivo = 'TODOS';

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
        this.productos = data.filter(p => p.disponible && p.activo);
        if (this.productos.length === 0) {
          this.cargarMockProductos();
        }
      },
      error: () => {
        this.cargarMockProductos();
      }
    });
  }

  cargarMockProductos(): void {
    this.productos = [
      { id: 1, nombre: 'Lomo Saltado Premium', descripcion: 'Dados de lomo de res saltados al wok, cebolla roja, tomates frescos, papas amarillas fritas y arroz graneado.', precio: 45.0, disponible: true, activo: true, categoriaNombre: 'Platos de Fondo' },
      { id: 2, nombre: 'Ceviche Carretillero', descripcion: 'Pescado fresco marinado en zumo de limón de Chulucanas, ají limo, cebolla roja, camote glaseado, choclo desgranado y chicharrón de calamar.', precio: 38.0, disponible: true, activo: true, categoriaNombre: 'Entradas' },
      { id: 3, nombre: 'Ají de Gallina Tradicional', descripcion: 'Pechuga de gallina deshilachada en crema de ají amarillo, pan, leche, queso andino y pecanas. Servido con arroz.', precio: 29.0, disponible: true, activo: true, categoriaNombre: 'Platos de Fondo' },
      { id: 4, nombre: 'Tequeños Cronos', descripcion: 'Masa de wantán rellena de queso andino y jamón del país. Acompañado de salsa de guacamole especial.', precio: 18.0, disponible: true, activo: true, categoriaNombre: 'Snacks' },
      { id: 5, nombre: 'Papas Nativas con Huancaína', descripcion: 'Papas nativas sancochadas bañadas en una cremosa salsa de ají amarillo, queso y leche fresca.', precio: 16.0, disponible: true, activo: true, categoriaNombre: 'Snacks' },
      { id: 6, nombre: 'Chicha Morada de la Casa', descripcion: 'Bebida tradicional a base de maíz morado hervido con piña, manzana, membrillo, canela y clavo.', precio: 12.0, disponible: true, activo: true, categoriaNombre: 'Bebidas' },
      { id: 7, nombre: 'Inca Kola 500ml', descripcion: 'Gaseosa tradicional peruana fría.', precio: 5.0, disponible: true, activo: true, categoriaNombre: 'Bebidas' },
      { id: 8, nombre: 'Pisco Sour Clásico', descripcion: 'Nuestra bebida bandera. Pisco Acholado, jarabe de goma, zumo de limón verde fresco, clara de huevo y gotas de amargo de angostura.', precio: 22.0, disponible: true, activo: true, categoriaNombre: 'Licores' },
      { id: 9, nombre: 'Maracuyá Sour', descripcion: 'Cóctel refrescante a base de Pisco quebranta, zumo concentrado de maracuyá y clara de huevo.', precio: 22.0, disponible: true, activo: true, categoriaNombre: 'Licores' },
      { id: 10, nombre: 'Tres Leches de Lúcuma', descripcion: 'Bizcocho bañado en tres tipos de leche con pulpa de lúcuma y chantilly.', precio: 14.0, disponible: true, activo: true, categoriaNombre: 'Postres' },
      { id: 11, nombre: 'Suspiro a la Limeña', descripcion: 'Tradicional postre limeño con manjarblanco de yemas y merengue al oporto.', precio: 12.0, disponible: true, activo: true, categoriaNombre: 'Postres' }
    ];
  }

  getProductosPorCategoria(cat: string): any[] {
    return this.productos.filter(p => p.categoriaNombre === cat);
  }

  setFiltro(cat: string): void {
    this.filtroActivo = cat;
  }

  getGradient(categoria: string): string {
    const cat = categoria ? categoria.toLowerCase() : '';
    if (cat.includes('fondo') || cat.includes('carne')) return 'linear-gradient(135deg, #1e0810 0%, #2a0f15 100%)';
    if (cat.includes('entrada') || cat.includes('marisco')) return 'linear-gradient(135deg, #0e1808 0%, #162210 100%)';
    if (cat.includes('bebida') || cat.includes('refresco')) return 'linear-gradient(135deg, #140a1a 0%, #1c0e24 100%)';
    if (cat.includes('licor') || cat.includes('coctel') || cat.includes('premium')) return 'linear-gradient(135deg, #180c04 0%, #241408 100%)';
    return 'linear-gradient(135deg, #1a120a 0%, #241808 100%)';
  }

  getIconForCategory(cat: string): string {
    const nom = cat ? cat.toLowerCase() : '';
    if (nom.includes('entrada')) return 'restaurant';
    if (nom.includes('fondo') || nom.includes('principal')) return 'flatware';
    if (nom.includes('snack')) return 'cookie';
    if (nom.includes('postre')) return 'cake';
    if (nom.includes('bebida')) return 'local_drink';
    if (nom.includes('licor') || nom.includes('coctel')) return 'local_bar';
    return 'restaurant';
  }

  // Carrito
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
    this.router.navigate(['/checkout']);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.usuarioActual = null;
    this.router.navigate(['/menu']);
  }
}
