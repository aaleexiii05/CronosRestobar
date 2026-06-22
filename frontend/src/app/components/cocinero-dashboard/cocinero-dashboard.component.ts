import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-cocinero-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  template: `
    <style>
      .admin-layout {
        display: flex;
        min-height: 100vh;
        background-color: #060913;
        color: #f8fafc;
        font-family: 'Outfit', sans-serif;
      }
      .sidebar {
        width: 250px;
        background-color: #080d19;
        border-right: 1px solid #1c273a;
        display: flex;
        flex-direction: column;
        padding: 24px;
        flex-shrink: 0;
      }
      .logo-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
        position: relative;
        flex-wrap: wrap;
      }
      .logo-icon {
        color: var(--dorado, #d4af37);
        font-size: 1.8rem;
      }
      .logo-text-block {
        display: flex;
        flex-direction: column;
      }
      .logo-title {
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: 0.15em;
        color: white;
        line-height: 1;
      }
      .logo-subtitle {
        font-size: 0.72rem;
        color: #94a3b8;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-top: 2px;
      }
      .role-badge {
        font-size: 0.65rem;
        color: #e11d48;
        border: 1px solid #e11d48;
        padding: 2px 8px;
        font-weight: bold;
        letter-spacing: 0.08em;
        margin-top: 6px;
        width: fit-content;
      }
      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 24px;
        margin-top: 15px;
      }
      .nav-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .group-title {
        font-size: 0.68rem;
        text-transform: uppercase;
        color: #64748b;
        font-weight: 800;
        letter-spacing: 0.12em;
        margin-bottom: 4px;
        padding-left: 10px;
      }
      .nav-item {
        background: transparent;
        border: none;
        color: #94a3b8;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
        text-align: left;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        transition: all 0.2s ease;
        position: relative;
      }
      .nav-item:hover {
        background-color: rgba(255, 255, 255, 0.03);
        color: white;
      }
      .nav-item.active {
        background-color: #e11d48;
        color: white;
      }
      .nav-count-badge {
        position: absolute;
        right: 14px;
        background-color: #be123c;
        color: white;
        font-size: 0.7rem;
        font-weight: bold;
        padding: 2px 6px;
      }
      .nav-item.active .nav-count-badge {
        background-color: white;
        color: #e11d48;
      }
      .content-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .topbar {
        height: 65px;
        background-color: #060913;
        border-bottom: 1px solid #1c273a;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 30px;
        flex-shrink: 0;
      }
      .topbar-title {
        font-weight: bold;
        font-size: 0.85rem;
        color: #64748b;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .user-greeting {
        font-size: 0.85rem;
        color: #94a3b8;
        margin-right: 20px;
      }
      .btn-logout {
        background: transparent;
        border: 1px solid #1c273a;
        color: #94a3b8;
        padding: 6px 12px;
        font-size: 0.72rem;
        font-weight: bold;
        text-transform: uppercase;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
      }
      .btn-logout:hover {
        border-color: #e11d48;
        color: #e11d48;
      }
      .main-content {
        flex: 1;
        padding: 30px;
        overflow-y: auto;
      }
      .eyebrow {
        font-size: 0.65rem;
        color: #e11d48;
        font-weight: bold;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }
      .title {
        font-size: 2.2rem;
        font-weight: 900;
        margin: 4px 0 0 0;
        color: white;
        letter-spacing: -0.01em;
      }
      .stats-row {
        display: flex;
        gap: 16px;
        margin-top: 12px;
      }
      .stat-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: #0d1321;
        border: 1px solid #1c273a;
        padding: 6px 12px;
        font-size: 0.75rem;
        font-weight: bold;
        color: #94a3b8;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .dot-pendiente { background-color: #d4af37; }
      .dot-preparacion { background-color: #00f2fe; }
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
        background-color: #0d1321;
        border: 1px solid #1c273a;
        margin-top: 24px;
      }
      .empty-icon {
        font-size: 3rem;
        color: #10b981;
        margin-bottom: 12px;
      }
      .pedidos-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-top: 24px;
      }
      .pedido-card {
        background-color: #0d1321;
        border: 1px solid #1c273a;
        border-top: 5px solid #d4af37;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 280px;
        transition: transform 0.2s, border-color 0.2s;
      }
      .pedido-card:hover {
        transform: translateY(-2px);
      }
      .pedido-card.card-preparando {
        border-top-color: #00f2fe;
      }
      .pedido-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid #1c273a;
        padding-bottom: 12px;
        margin-bottom: 16px;
      }
      .pedido-id-block {
        display: flex;
        flex-direction: column;
      }
      .pedido-id {
        font-size: 1.15rem;
        font-weight: 800;
        color: white;
      }
      .pedido-time {
        font-size: 0.72rem;
        color: #64748b;
        margin-top: 2px;
      }
      .mesa-badge {
        background-color: #1c273a;
        color: #f8fafc;
        font-size: 0.75rem;
        font-weight: bold;
        padding: 4px 10px;
        border-radius: 2px;
      }
      .pedido-card-body {
        flex: 1;
        margin-bottom: 20px;
      }
      .platos-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .plato-item {
        display: flex;
        flex-direction: column;
      }
      .plato-main {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .plato-qty {
        font-size: 1.1rem;
        font-weight: 900;
        color: #d4af37;
      }
      .plato-name {
        font-size: 0.92rem;
        font-weight: bold;
        color: white;
      }
      .plato-notes {
        font-size: 0.75rem;
        color: #e11d48;
        font-style: italic;
        padding-left: 28px;
        margin-top: 2px;
        display: flex;
        align-items: center;
      }
      .observaciones-container {
        margin-bottom: 16px;
      }
      .btn-ver-obs {
        background-color: rgba(212, 175, 55, 0.08);
        border: 1px solid rgba(212, 175, 55, 0.3);
        color: #d4af37;
        width: 100%;
        padding: 8px;
        font-size: 0.75rem;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        letter-spacing: 0.05em;
        transition: all 0.2s;
      }
      .btn-ver-obs:hover {
        background-color: rgba(212, 175, 55, 0.15);
        border-color: #d4af37;
      }
      .pedido-card-actions {
        display: flex;
      }
      .btn-iniciar {
        background-color: #ff9800;
        color: black;
        border: none;
        font-size: 0.8rem;
        font-weight: bold;
        padding: 12px;
        width: 100%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        letter-spacing: 0.08em;
        transition: background-color 0.2s, transform 0.1s;
        position: relative;
        overflow: hidden;
      }
      .btn-iniciar:hover {
        background-color: #e65100;
      }
      .btn-iniciar::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: radial-gradient(circle, rgba(255,152,0,0.4) 0%, rgba(0,0,0,0) 70%);
        opacity: 0;
        transition: opacity 0.2s;
      }
      .btn-iniciar:hover::before {
        opacity: 1;
      }
      .btn-listo {
        background-color: #10b981;
        color: white;
        border: none;
        font-size: 0.8rem;
        font-weight: bold;
        padding: 12px;
        width: 100%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        letter-spacing: 0.08em;
        transition: background-color 0.2s;
      }
      .btn-listo:hover {
        background-color: #059669;
      }
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        padding: 20px;
      }
      .modal-card {
        background: #0d1321 !important;
        border: 1px solid #1c273a !important;
        color: white !important;
        width: 100%;
        max-width: 500px;
        padding: 24px;
        overflow-y: auto;
        max-height: 85vh;
      }
      .btn-premium-rojo {
        background-color: #e11d48;
        color: #ffffff;
        border: none;
        font-size: 0.78rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: bold;
        cursor: pointer;
        padding: 10px 20px;
        transition: background-color 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .btn-premium-rojo:hover {
        background-color: #be123c;
      }
    </style>

    <div class="admin-layout">
      <!-- SIDEBAR IZQUIERDA -->
      <aside class="sidebar">
        <div class="logo-wrapper">
          <span class="material-symbols-outlined logo-icon">hourglass_empty</span>
          <div class="logo-text-block">
            <span class="logo-title">CRONOS</span>
            <span class="logo-subtitle">RESTOBAR</span>
          </div>
          <div class="role-badge">COCINERO</div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-group">
            <span class="group-title">Operaciones</span>
            <button class="nav-item active">
              <span class="material-symbols-outlined">soup_kitchen</span>
              <span>Cocina</span>
              <span class="nav-count-badge" *ngIf="pedidosCocina.length > 0">{{ pedidosCocina.length }}</span>
            </button>
          </div>
        </nav>

        <div style="margin-top: auto; padding-top: 20px;">
          <button class="btn-logout" style="width: 100%;" (click)="logout()">
            <span class="material-symbols-outlined" style="font-size: 1.1rem; vertical-align: middle;">logout</span>
            <span>Salir</span>
          </button>
        </div>
      </aside>

      <!-- CONTENEDOR DERECHO -->
      <div class="content-container">
        <!-- HEADER SUPERIOR -->
        <header class="topbar">
          <div class="header-left">
            <span class="topbar-title">COLA DE PRODUCCIÓN Y PREPARACIÓN</span>
          </div>
          <div class="header-right" style="display: flex; align-items: center;">
            <span class="user-greeting">Hola, Chef <strong style="color: #d4af37;">{{ usuario?.nombre || 'COCINERO' }}</strong></span>
          </div>
        </header>

        <!-- CONTENIDO DINÁMICO -->
        <main class="main-content">
          <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px;">
            <div>
              <span class="eyebrow">Producción en Vivo</span>
              <h2 class="title">Cola de Pedidos</h2>
            </div>
            <div class="stats-row">
              <div class="stat-pill">
                <span class="dot dot-pendiente"></span>
                <span>Pendientes: {{ getPendientesCount() }}</span>
              </div>
              <div class="stat-pill" style="border-color: rgba(0, 242, 254, 0.3);">
                <span class="dot dot-preparacion"></span>
                <span>En Preparación: {{ getPreparandoCount() }}</span>
              </div>
            </div>
          </div>

          <div *ngIf="pedidosCocina.length === 0" class="empty-state">
            <span class="material-symbols-outlined empty-icon">check_circle</span>
            <h3 style="color: white; font-weight: bold; font-size: 1.25rem;">¡Felicidades Chef!</h3>
            <p style="margin-top: 6px;">No hay pedidos pendientes en la cola de cocina. Todos los platos han sido despachados.</p>
          </div>

          <!-- GRID DE PEDIDOS - 3 COLUMNAS -->
          <div class="pedidos-grid" *ngIf="pedidosCocina.length > 0">
            <div *ngFor="let p of pedidosCocina" class="pedido-card" [class.card-preparando]="p.estado === 'EN_PREPARACION'">
              <div class="pedido-card-header">
                <div class="pedido-id-block">
                  <span class="pedido-id">Pedido #00{{ p.id }}</span>
                  <span class="pedido-time">{{ p.fechaHora | date:'HH:mm:ss' }}</span>
                </div>
                <div class="mesa-badge">Mesa {{ p.mesaNumero }}</div>
              </div>

              <div class="pedido-card-body">
                <div class="platos-list">
                  <div *ngFor="let d of p.detalles" class="plato-item">
                    <div class="plato-main">
                      <span class="plato-qty">{{ d.cantidad }}x</span>
                      <span class="plato-name">{{ d.productoNombre }}</span>
                    </div>
                    <div *ngIf="d.notas" class="plato-notes">
                      <span class="material-symbols-outlined" style="font-size: 0.82rem; vertical-align: middle; margin-right: 4px;">info</span>
                      <span>{{ d.notas }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BOTÓN DETALLES / OBSERVACIONES DE COCINA (SOLO SI TIENE OBSERVACIONES) -->
              <div class="observaciones-container" *ngIf="p.observaciones">
                <button class="btn-ver-obs" (click)="verObservaciones(p)">
                  <span class="material-symbols-outlined" style="font-size: 1.1rem; vertical-align: middle;">chat_bubble</span>
                  <span>VER DETALLES</span>
                </button>
              </div>

              <div class="pedido-card-actions">
                <!-- BOTÓN INICIAR (Si está PENDIENTE) -->
                <button *ngIf="p.estado === 'PENDIENTE'" class="btn-iniciar" (click)="cambiarEstado(p.id, 'EN_PREPARACION')">
                  <span class="material-symbols-outlined" style="font-size: 1.2rem; vertical-align: middle;">local_fire_department</span>
                  <span>INICIAR</span>
                </button>

                <!-- BOTÓN LISTO (Si está EN_PREPARACION) -->
                <button *ngIf="p.estado === 'EN_PREPARACION'" class="btn-listo" (click)="marcarComoListo(p.id)">
                  <span class="material-symbols-outlined" style="font-size: 1.2rem; vertical-align: middle;">done</span>
                  <span>LISTO</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- MODAL DE OBSERVACIONES -->
    <div class="modal-overlay" *ngIf="mostrarObsModal">
      <div class="modal-card">
        <h3 style="font-weight: bold; margin: 0 0 6px 0; color: #d4af37; font-size: 1.25rem; text-transform: uppercase;">
          <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 6px;">chef_hat</span>
          Observaciones de Cocina
        </h3>
        <p style="color: #64748b; font-size: 0.82rem; margin-bottom: 20px;">
          Pedido #00{{ pedidoSeleccionado?.id }} · Mesa: <strong>{{ pedidoSeleccionado?.mesaNumero }}</strong>
        </p>

        <div style="background-color: #060913; border-left: 4px solid #d4af37; padding: 20px; font-style: italic; font-size: 1rem; color: #f8fafc; margin-bottom: 24px; line-height: 1.5; font-family: inherit; border-radius: 2px;">
          "{{ pedidoSeleccionado?.observaciones }}"
        </div>

        <div style="text-align: right;">
          <button class="btn-premium-rojo" (click)="cerrarObsModal()">Entendido</button>
        </div>
      </div>
    </div>
  `
})
export class CocineroDashboardComponent implements OnInit, OnDestroy {
  usuario: any;
  pedidosCocina: any[] = [];
  
  // Modal de observaciones
  mostrarObsModal = false;
  pedidoSeleccionado: any = null;

  private sseSub?: Subscription;

  constructor(
    private authService: AuthService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    this.cargarPedidos();
    this.inicializarSse();
    // Fallback polling cada 15 segundos
    setInterval(() => this.cargarPedidos(), 15000);
  }

  ngOnDestroy(): void {
    if (this.sseSub) {
      this.sseSub.unsubscribe();
    }
  }

  cargarPedidos(): void {
    this.pedidoService.listarTodos().subscribe({
      next: (data) => {
        // Cocinero solo se enfoca en pedidos PENDIENTE y EN_PREPARACION, ordenados cronológicamente (id ascendente)
        this.pedidosCocina = data
          .filter(p => p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION')
          .sort((a, b) => a.id - b.id);
      }
    });
  }

  inicializarSse(): void {
    this.sseSub = this.pedidoService.obtenerNotificacionesStream().subscribe({
      next: () => {
        this.cargarPedidos();
      },
      error: (err) => {
        console.error('Error SSE canal cocinero:', err);
      }
    });
  }

  getPendientesCount(): number {
    return this.pedidosCocina.filter(p => p.estado === 'PENDIENTE').length;
  }

  getPreparandoCount(): number {
    return this.pedidosCocina.filter(p => p.estado === 'EN_PREPARACION').length;
  }

  verObservaciones(pedido: any): void {
    this.pedidoSeleccionado = pedido;
    this.mostrarObsModal = true;
  }

  cerrarObsModal(): void {
    this.mostrarObsModal = false;
    this.pedidoSeleccionado = null;
  }

  cambiarEstado(id: number, nuevoEstado: string): void {
    this.pedidoService.cambiarEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.cargarPedidos();
      },
      error: (err) => {
        alert('Error al actualizar el estado del pedido: ' + (err.error?.message || ''));
      }
    });
  }

  marcarComoListo(id: number): void {
    this.pedidoService.marcarListo(id).subscribe({
      next: () => {
        this.cargarPedidos();
      },
      error: (err) => {
        alert('Error al marcar el pedido como listo: ' + (err.error?.message || ''));
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
