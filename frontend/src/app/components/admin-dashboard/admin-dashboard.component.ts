import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../services/auth.service';
import { CrudGenericoService } from '../../services/crud-generico.service';
import { FacturaService } from '../../services/factura.service';
import { PedidoService } from '../../services/pedido.service';
import { ReservaService } from '../../services/reserva.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatTableModule
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
      .admin-badge {
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
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
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
      .date-badge {
        background-color: #0d1321;
        border: 1px solid #1c273a;
        padding: 8px 16px;
        font-size: 0.82rem;
        color: #94a3b8;
        font-weight: bold;
      }
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin-bottom: 30px;
      }
      .kpi-card {
        background-color: #0d1321;
        border: 1px solid #1c273a;
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        transition: transform 0.2s;
      }
      .kpi-card:hover {
        transform: translateY(-2px);
      }
      .kpi-red { border-left: 4px solid #e11d48; }
      .kpi-gold { border-left: 4px solid #d4af37; }
      .kpi-green { border-left: 4px solid #10b981; }
      .kpi-blue { border-left: 4px solid #00f2fe; }
      .kpi-info {
        display: flex;
        flex-direction: column;
      }
      .kpi-title {
        font-size: 0.68rem;
        color: #64748b;
        font-weight: bold;
        letter-spacing: 0.08em;
      }
      .kpi-value {
        font-size: 1.8rem;
        font-weight: 900;
        color: white;
        margin: 6px 0 2px 0;
      }
      .kpi-sub {
        font-size: 0.72rem;
        color: #94a3b8;
      }
      .kpi-icon {
        font-size: 2.2rem;
        color: rgba(255, 255, 255, 0.08);
      }
      .middle-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
        margin-bottom: 30px;
      }
      .card-widget {
        background-color: #0d1321;
        border: 1px solid #1c273a;
        display: flex;
        flex-direction: column;
      }
      .widget-header {
        padding: 16px 20px;
        border-bottom: 1px solid #1c273a;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .widget-title {
        font-size: 0.85rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: white;
      }
      .widget-action-link {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 0.72rem;
        font-weight: bold;
        cursor: pointer;
        letter-spacing: 0.05em;
        transition: color 0.2s;
      }
      .widget-action-link:hover {
        color: #e11d48;
      }
      .widget-body {
        padding: 20px;
        flex: 1;
      }
      .dashboard-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.82rem;
      }
      .dashboard-table th {
        color: #64748b;
        font-weight: bold;
        padding-bottom: 10px;
        border-bottom: 1px solid #1c273a;
        letter-spacing: 0.05em;
      }
      .dashboard-table td {
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        color: #94a3b8;
      }
      .estado-badge {
        padding: 3px 8px;
        font-size: 0.65rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .estado-pendiente { background-color: rgba(212, 175, 55, 0.12); color: #d4af37; }
      .estado-confirmado { background-color: rgba(16, 185, 129, 0.12); color: #10b981; }
      .estado-cancelado { background-color: rgba(225, 29, 72, 0.12); color: #e11d48; }
      .estado-entregado { background-color: rgba(0, 242, 254, 0.12); color: #00f2fe; }

      .reservas-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .reserva-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      }
      .reserva-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .reserva-details {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .mesa-number {
        font-size: 0.85rem;
        font-weight: bold;
        color: white;
      }
      .reserva-status {
        font-size: 0.72rem;
      }
      .reserva-time {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .time-text {
        font-size: 0.8rem;
        font-weight: bold;
        color: white;
      }
      .bottom-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
      .mini-stat-card {
        background-color: #0d1321;
        border: 1px solid #1c273a;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .icon-block {
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .bg-dark-red { background-color: rgba(225, 29, 72, 0.1); }
      .bg-dark-gold { background-color: rgba(212, 175, 55, 0.1); }
      .bg-dark-green { background-color: rgba(16, 185, 129, 0.1); }
      .stat-info {
        display: flex;
        flex-direction: column;
      }
      .stat-title {
        font-size: 0.65rem;
        color: #64748b;
        font-weight: bold;
        letter-spacing: 0.05em;
      }
      .stat-number {
        font-size: 1.15rem;
        font-weight: 900;
        color: white;
        margin-top: 2px;
      }

      /* Estilos para tablas en las otras secciones */
      .admin-table {
        width: 100%;
        background-color: #0d1321 !important;
        color: white !important;
        border: 1px solid #1c273a;
        border-collapse: collapse;
      }
      .admin-table th {
        color: #64748b !important;
        font-weight: bold !important;
        background-color: #080d19 !important;
        border-bottom: 1px solid #1c273a !important;
        text-transform: uppercase;
        font-size: 0.72rem;
        letter-spacing: 0.05em;
        padding: 12px 16px !important;
      }
      .admin-table td {
        color: #94a3b8 !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
        font-size: 0.82rem;
        padding: 12px 16px !important;
      }
      .admin-table tr:hover {
        background-color: rgba(255, 255, 255, 0.01);
      }

      .btn-xs {
        padding: 4px 10px;
        font-size: 0.72rem;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        letter-spacing: 0.05em;
      }

      /* Modal glass overlay */
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
        max-width: 600px;
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
      .btn-premium-secundario {
        background-color: transparent;
        color: #f8fafc;
        border: 1px solid #1c273a;
        font-size: 0.78rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: bold;
        cursor: pointer;
        padding: 10px 20px;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .btn-premium-secundario:hover {
        border-color: #e11d48;
        color: #e11d48;
      }

      .section-box {
        background-color: #0d1321;
        border: 1px solid #1c273a;
        padding: 20px;
        margin-bottom: 24px;
      }
      .section-subtitle {
        font-size: 0.72rem;
        text-transform: uppercase;
        color: #e11d48;
        font-weight: bold;
        letter-spacing: 0.1em;
        margin-bottom: 8px;
      }
      .section-title {
        font-size: 1.15rem;
        font-weight: 800;
        margin: 0 0 16px 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: white;
      }

      .badge {
        padding: 3px 8px;
        font-size: 0.65rem;
        font-weight: bold;
        letter-spacing: 0.05em;
      }
      .badge-role-admin { background: rgba(225, 29, 72, 0.12); color: #e11d48; }
      .badge-role-mozo { background: rgba(16, 185, 129, 0.12); color: #10b981; }
      .badge-role-cocinero { background: rgba(0, 242, 254, 0.12); color: #00f2fe; }
      .badge-role-cajero { background: rgba(212, 175, 55, 0.12); color: #d4af37; }
      .badge-role-cliente { background: rgba(147, 51, 234, 0.12); color: #a855f7; }

      input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="date"], select, textarea {
        background-color: #060913 !important;
        color: #f8fafc !important;
        border: 1px solid #1c273a !important;
        padding: 10px 14px;
        font-size: 0.88rem;
        outline: none;
        width: 100%;
      }
      input:focus, select:focus, textarea:focus {
        border-color: #e11d48 !important;
      }
      label {
        color: #94a3b8;
        font-size: 0.82rem;
        margin-bottom: 6px;
        display: block;
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
          <div class="admin-badge">PANEL ADMIN</div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-group">
            <span class="group-title">Principal</span>
            <button class="nav-item" [class.active]="seccionActiva === 'dashboard'" (click)="setSeccion('dashboard')">
              <span class="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </button>
            <button class="nav-item" [class.active]="seccionActiva === 'pedidos'" (click)="setSeccion('pedidos')">
              <span class="material-symbols-outlined">shopping_cart</span>
              <span>Pedidos</span>
              <span class="nav-count-badge" *ngIf="pedidosHoyCount > 0">{{ pedidosHoyCount }}</span>
            </button>
            <button class="nav-item" [class.active]="seccionActiva === 'reservas'" (click)="setSeccion('reservas')">
              <span class="material-symbols-outlined">calendar_today</span>
              <span>Reservas</span>
            </button>
          </div>

          <div class="nav-group">
            <span class="group-title">Gestión</span>
            <button class="nav-item" [class.active]="seccionActiva === 'productos'" (click)="setSeccion('productos')">
              <span class="material-symbols-outlined">flatware</span>
              <span>Productos</span>
            </button>
            <button class="nav-item" [class.active]="seccionActiva === 'facturacion'" (click)="setSeccion('facturacion')">
              <span class="material-symbols-outlined">description</span>
              <span>Facturación</span>
            </button>
            <button class="nav-item" [class.active]="seccionActiva === 'usuarios'" (click)="setSeccion('usuarios')">
              <span class="material-symbols-outlined">group</span>
              <span>Usuarios</span>
            </button>
          </div>

          <div class="nav-group">
            <span class="group-title">Sistema</span>
            <button class="nav-item" [class.active]="seccionActiva === 'configuracion'" (click)="setSeccion('configuracion')">
              <span class="material-symbols-outlined">settings</span>
              <span>Configuración</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- CONTENEDOR DERECHO (HEADER + CONTENIDO) -->
      <div class="content-container">
        <!-- HEADER SUPERIOR -->
        <header class="topbar">
          <div class="header-left">
            <span style="font-weight: bold; font-size: 0.85rem; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Gestor de Negocio y Finanzas</span>
          </div>
          <div class="header-right" style="display: flex; align-items: center;">
            <span class="user-greeting">Hola, <strong style="color: #d4af37;">{{ usuario?.nombre || 'ADMIN' }}</strong></span>
            <button class="btn-logout" (click)="logout()">
              <span class="material-symbols-outlined" style="font-size: 1.1rem; vertical-align: middle;">logout</span>
              <span>Salir</span>
            </button>
          </div>
        </header>

        <!-- CONTENIDO DINÁMICO -->
        <main class="main-content">
          
          <!-- SUB-VISTA: DASHBOARD -->
          <div *ngIf="seccionActiva === 'dashboard'">
            <div class="dashboard-header">
              <div>
                <span class="eyebrow">Panel de Control</span>
                <h2 class="title">Dashboard</h2>
              </div>
              <div class="date-badge">
                <span class="material-symbols-outlined" style="font-size: 1.15rem; vertical-align: middle; margin-right: 6px; color: #d4af37;">schedule</span>
                <span>{{ fechaHoyFormateada }}</span>
              </div>
            </div>

            <!-- 4 KPI CARDS -->
            <div class="kpi-grid">
              <!-- PEDIDOS HOY -->
              <div class="kpi-card kpi-red">
                <div class="kpi-info">
                  <span class="kpi-title">PEDIDOS HOY</span>
                  <span class="kpi-value">{{ pedidosHoyCount }}</span>
                  <span class="kpi-sub">{{ pedidosHoyCount === 0 ? 'Sin pedidos aún' : pedidosHoyCount + ' registrados' }}</span>
                </div>
                <span class="material-symbols-outlined kpi-icon">shopping_bag</span>
              </div>

              <!-- GANANCIAS DEL DÍA -->
              <div class="kpi-card kpi-gold">
                <div class="kpi-info">
                  <span class="kpi-title">GANANCIAS DEL DÍA</span>
                  <span class="kpi-value" style="color: #d4af37;">S/ {{ gananciasHoy | number:'1.2-2' }}</span>
                  <span class="kpi-sub">{{ gananciasHoy === 0 ? 'Sin ingresos aún' : 'Recaudado hoy' }}</span>
                </div>
                <span class="material-symbols-outlined kpi-icon">payments</span>
              </div>

              <!-- RESERVAS ACTIVAS -->
              <div class="kpi-card kpi-green">
                <div class="kpi-info">
                  <span class="kpi-title">RESERVAS ACTIVAS</span>
                  <span class="kpi-value">{{ reservasActivasCount }}</span>
                  <span class="kpi-sub">{{ reservasActivasCount === 0 ? 'Sin reservas hoy' : reservasActivasCount + ' activas' }}</span>
                </div>
                <span class="material-symbols-outlined kpi-icon">event_available</span>
              </div>

              <!-- CLIENTES REGISTRADOS -->
              <div class="kpi-card kpi-blue">
                <div class="kpi-info">
                  <span class="kpi-title">CLIENTES REGISTRADOS</span>
                  <span class="kpi-value">{{ clientesCount }}</span>
                  <span class="kpi-sub">{{ clientesCount === 0 ? 'Sin usuarios aún' : clientesCount + ' registrados' }}</span>
                </div>
                <span class="material-symbols-outlined kpi-icon">group</span>
              </div>
            </div>

            <!-- MIDDLE ROW (PEDIDOS Y RESERVAS) -->
            <div class="middle-grid">
              <!-- ÚLTIMOS PEDIDOS -->
              <div class="card-widget">
                <div class="widget-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="material-symbols-outlined" style="color: #e11d48; font-size: 1.25rem;">shopping_bag</span>
                    <span class="widget-title">Últimos Pedidos</span>
                  </div>
                  <button class="widget-action-link" (click)="setSeccion('pedidos')">VER TODOS →</button>
                </div>
                <div class="widget-body">
                  <div *ngIf="ultimosPedidos.length === 0" style="padding: 40px; text-align: center; color: #64748b;">
                    No hay pedidos registrados para hoy.
                  </div>
                  <table *ngIf="ultimosPedidos.length > 0" class="dashboard-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>CLIENTE</th>
                        <th>MONTO</th>
                        <th>ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let p of ultimosPedidos">
                        <td style="font-weight: bold; color: white;">#00{{ p.id }}</td>
                        <td>{{ p.usuarioNombre || 'Cliente General' }}</td>
                        <td style="font-weight: 900; color: white;">S/ {{ p.total | number:'1.2-2' }}</td>
                        <td>
                          <span class="estado-badge" [ngClass]="'estado-' + p.estado.toLowerCase()">
                            {{ p.estado }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- RESERVAS DE HOY -->
              <div class="card-widget">
                <div class="widget-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="material-symbols-outlined" style="color: #d4af37; font-size: 1.25rem;">calendar_month</span>
                    <span class="widget-title">Reservas de Hoy</span>
                  </div>
                  <button class="widget-action-link" (click)="setSeccion('reservas')">GESTIONAR →</button>
                </div>
                <div class="widget-body">
                  <div class="reservas-list">
                    <div *ngFor="let m of mesasConReservas" class="reserva-item">
                      <div class="reserva-details">
                        <span class="mesa-number">Mesa Nº {{ m.numero }} · {{ m.capacidad }} personas</span>
                        <span class="reserva-status" [style.color]="m.reservaHoy ? '#d4af37' : '#64748b'">
                          {{ m.reservaHoy ? '— Reservada por ' + m.reservaHoy.clienteNombre + ' —' : '— Sin reservas —' }}
                        </span>
                      </div>
                      <div class="reserva-time">
                        <span class="material-symbols-outlined" style="font-size: 1rem; color: #64748b;">schedule</span>
                        <span class="time-text">{{ m.reservaHoy ? (m.reservaHoy.fechaHora | date:'HH:mm') : '—' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- BOTTOM ROW (PRODUCTOS, FACTURAS, VENTAS MES) -->
            <div class="bottom-grid">
              <!-- PRODUCTOS EN CARTA -->
              <div class="mini-stat-card">
                <div class="icon-block bg-dark-red">
                  <span class="material-symbols-outlined" style="color: #e11d48; font-size: 1.5rem;">flatware</span>
                </div>
                <div class="stat-info">
                  <span class="stat-title">PRODUCTOS EN CARTA</span>
                  <span class="stat-number">{{ productosCount }}</span>
                </div>
              </div>

              <!-- FACTURAS EMITIDAS -->
              <div class="mini-stat-card">
                <div class="icon-block bg-dark-gold">
                  <span class="material-symbols-outlined" style="color: #d4af37; font-size: 1.5rem;">description</span>
                </div>
                <div class="stat-info">
                  <span class="stat-title">FACTURAS EMITIDAS</span>
                  <span class="stat-number">{{ facturasCount }}</span>
                </div>
              </div>

              <!-- VENTAS DEL MES -->
              <div class="mini-stat-card">
                <div class="icon-block bg-dark-green">
                  <span class="material-symbols-outlined" style="color: #10b981; font-size: 1.5rem;">bar_chart</span>
                </div>
                <div class="stat-info">
                  <span class="stat-title">VENTAS DEL MES</span>
                  <span class="stat-number">S/ {{ ventasMes | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SUB-VISTA: PEDIDOS -->
          <div *ngIf="seccionActiva === 'pedidos'">
            <div class="section-box">
              <span class="section-subtitle">Gestión de Compras</span>
              <h2 class="section-title">Pedidos del Restobar</h2>
              
              <div *ngIf="pedidos.length === 0" style="padding: 40px; text-align: center; color: #64748b;">
                No hay pedidos registrados en el sistema.
              </div>

              <table *ngIf="pedidos.length > 0" class="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>MESA</th>
                    <th>CLIENTE</th>
                    <th>MONTO</th>
                    <th>FECHA/HORA</th>
                    <th>ESTADO</th>
                    <th style="text-align: center;">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of pedidos">
                    <td><strong>#00{{ p.id }}</strong></td>
                    <td>Mesa N° {{ p.mesaNumero }}</td>
                    <td>{{ p.usuarioNombre }}</td>
                    <td style="font-weight: bold; color: white;">S/ {{ p.total | number:'1.2-2' }}</td>
                    <td>{{ p.fechaHora | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                    <td>
                      <span class="estado-badge" [ngClass]="'estado-' + p.estado.toLowerCase()">
                        {{ p.estado }}
                      </span>
                    </td>
                    <td style="text-align: center; display: flex; gap: 6px; justify-content: center;">
                      <button mat-raised-button color="accent" class="btn-xs" (click)="verDetallePedido(p)">
                        Detalles
                      </button>
                      <button *ngIf="p.estado === 'PENDIENTE'" mat-raised-button color="primary" class="btn-xs" style="background-color: #10b981;" (click)="actualizarEstadoPedido(p.id, 'CONFIRMADO')">
                        Confirmar
                      </button>
                      <button *ngIf="p.estado === 'PENDIENTE'" mat-raised-button color="warn" class="btn-xs" (click)="actualizarEstadoPedido(p.id, 'CANCELADO')">
                        Cancelar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- SUB-VISTA: RESERVAS -->
          <div *ngIf="seccionActiva === 'reservas'">
            <div class="flex-layout">
              <div class="table-container" style="flex: 1.5; min-width: 450px;">
                <div class="section-box" style="margin-bottom: 24px;">
                  <span class="section-subtitle">Gestión de Infraestructura</span>
                  <h2 class="section-title">Mantenimiento de Mesas</h2>
                  
                  <table class="admin-table" style="width:100%;">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Número</th>
                        <th>Capacidad</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let m of mesas">
                        <td>{{ m.id }}</td>
                        <td><strong>Mesa N° {{ m.numero }}</strong></td>
                        <td>{{ m.capacidad }} pers.</td>
                        <td>{{ m.tipo }}</td>
                        <td>
                          <span [style.color]="m.estado === 'LIBRE' ? '#10b981' : '#d4af37'" style="font-weight: bold;">
                            {{ m.estado }}
                          </span>
                        </td>
                        <td>
                          <button mat-button color="primary" class="btn-xs" (click)="editarMesa(m)">Editar</button>
                          <button mat-button color="warn" class="btn-xs" (click)="eliminarItem('mesas', m.id)">Borrar</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="section-box">
                  <span class="section-subtitle">Lista de Reservas Históricas</span>
                  <h2 class="section-title">Reservas Registradas</h2>

                  <div *ngIf="reservas.length === 0" style="padding: 20px; text-align: center; color: #64748b;">
                    No hay reservas en el sistema.
                  </div>

                  <table *ngIf="reservas.length > 0" class="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Mesa</th>
                        <th>Cliente</th>
                        <th>Personas</th>
                        <th>Fecha</th>
                        <th>Turno</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let r of reservas">
                        <td>{{ r.id }}</td>
                        <td>Mesa {{ r.mesaNumero }}</td>
                        <td><strong>{{ r.clienteNombre }}</strong></td>
                        <td>{{ r.numPersonas }}</td>
                        <td>{{ r.fecha | date:'dd/MM/yyyy' }}</td>
                        <td>{{ r.turno }}</td>
                        <td>
                          <span [style.color]="r.estado === 'CONFIRMADA' ? '#10b981' : (r.estado === 'CANCELADA' ? '#e11d48' : '#d4af37')" style="font-weight: bold;">
                            {{ r.estado }}
                          </span>
                        </td>
                        <td>
                          <button *ngIf="r.estado !== 'CANCELADA'" mat-button color="warn" class="btn-xs" (click)="cancelarReserva(r.id)">Cancelar</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="form-container" style="flex: 1; min-width: 300px;">
                <div class="section-box">
                  <span class="section-subtitle">Operaciones</span>
                  <h2 class="section-title">{{ mesaForm.id ? '🛠️ Editar Mesa' : '✨ Nueva Mesa' }}</h2>
                  <form (ngSubmit)="guardarMesa()">
                    <div style="margin-bottom: 12px;">
                      <label>Número de Mesa</label>
                      <input type="number" [(ngModel)]="mesaForm.numero" name="mNumero" required>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label>Capacidad (personas)</label>
                      <input type="number" [(ngModel)]="mesaForm.capacidad" name="mCapacidad" required>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label>Tipo de Mesa</label>
                      <select [(ngModel)]="mesaForm.tipo" name="mTipo" required>
                        <option value="PAREJA">Pareja</option>
                        <option value="PEQUENO">Pequeño</option>
                        <option value="GRUPO">Grupo</option>
                        <option value="EMPRESA">Empresa</option>
                        <option value="BARRA">Barra</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label>Ubicación</label>
                      <input type="text" [(ngModel)]="mesaForm.ubicacion" name="mUbicacion">
                    </div>
                    <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                      <input type="checkbox" [(ngModel)]="mesaForm.activa" name="mActiva" id="mActiva" style="width: auto;">
                      <label for="mActiva" style="margin: 0; cursor: pointer;">Mesa Activa</label>
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button class="btn-premium-secundario" style="flex: 1;" type="button" (click)="resetMesaForm()">Limpiar</button>
                      <button class="btn-premium-rojo" style="flex: 1.5;" type="submit">Guardar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- SUB-VISTA: PRODUCTOS -->
          <div *ngIf="seccionActiva === 'productos'">
            <div class="flex-layout">
              <div class="table-container" style="flex: 1.5; min-width: 450px;">
                
                <!-- Categorías -->
                <div class="section-box" style="margin-bottom: 24px;">
                  <span class="section-subtitle">Gestión de Agrupaciones</span>
                  <h2 class="section-title">Categorías de la Carta</h2>
                  <table class="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let cat of categorias">
                        <td>{{ cat.id }}</td>
                        <td><strong>{{ cat.nombre }}</strong></td>
                        <td>{{ cat.descripcion || '-' }}</td>
                        <td>{{ cat.activa ? 'Activa' : 'Inactiva' }}</td>
                        <td>
                          <button mat-button color="primary" class="btn-xs" (click)="editarCategoria(cat)">Editar</button>
                          <button mat-button color="warn" class="btn-xs" (click)="eliminarItem('categorias', cat.id)">Borrar</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Productos -->
                <div class="section-box">
                  <span class="section-subtitle">Gestión de Platos y Bebidas</span>
                  <h2 class="section-title">Productos de la Carta</h2>
                  <table class="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let p of productos">
                        <td>{{ p.id }}</td>
                        <td><strong>{{ p.nombre }}</strong></td>
                        <td>{{ p.categoriaNombre }}</td>
                        <td style="font-weight: bold; color: white;">S/ {{ p.precio | number:'1.2-2' }}</td>
                        <td>
                          <span [style.color]="p.disponible ? '#10b981' : '#e11d48'">{{ p.disponible ? 'Disponible' : 'Agotado' }}</span>
                        </td>
                        <td>
                          <button mat-button color="primary" class="btn-xs" (click)="editarProducto(p)">Editar</button>
                          <button mat-button color="warn" class="btn-xs" (click)="eliminarItem('productos', p.id)">Borrar</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              <!-- Formularios Productos / Categorías -->
              <div class="form-container" style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 24px;">
                <!-- Form Producto -->
                <div class="section-box">
                  <span class="section-subtitle">Operaciones</span>
                  <h2 class="section-title">{{ productoForm.id ? '🛠️ Editar Producto' : '✨ Nuevo Producto' }}</h2>
                  <form (ngSubmit)="guardarProducto()">
                    <div style="margin-bottom: 12px;">
                      <label>Categoría</label>
                      <select [(ngModel)]="productoForm.categoriaId" name="pCategoria" required>
                        <option *ngFor="let cat of categorias" [value]="cat.id">
                          {{ cat.nombre }}
                        </option>
                      </select>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label>Nombre</label>
                      <input type="text" [(ngModel)]="productoForm.nombre" name="pNombre" required>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label>Descripción</label>
                      <textarea rows="2" [(ngModel)]="productoForm.descripcion" name="pDesc"></textarea>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label>Precio (S/)</label>
                      <input type="number" step="0.1" [(ngModel)]="productoForm.precio" name="pPrecio" required>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label>Tiempo de Prep. (min)</label>
                      <input type="number" [(ngModel)]="productoForm.tiempoPreparacionMin" name="pTiempo">
                    </div>
                    <div style="margin-bottom: 16px; display: flex; gap: 20px;">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" [(ngModel)]="productoForm.disponible" name="pDisponible" id="pDisponible" style="width:auto;">
                        <label for="pDisponible" style="margin:0; cursor:pointer;">Disponible</label>
                      </div>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" [(ngModel)]="productoForm.activo" name="pActivo" id="pActivo" style="width:auto;">
                        <label for="pActivo" style="margin:0; cursor:pointer;">Activo</label>
                      </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button class="btn-premium-secundario" style="flex: 1;" type="button" (click)="resetProductoForm()">Limpiar</button>
                      <button class="btn-premium-rojo" style="flex: 1.5;" type="submit">Guardar</button>
                    </div>
                  </form>
                </div>

                <!-- Form Categoría -->
                <div class="section-box">
                  <span class="section-subtitle">Operaciones</span>
                  <h2 class="section-title">{{ categoriaForm.id ? '🛠️ Editar Categoría' : '✨ Nueva Categoría' }}</h2>
                  <form (ngSubmit)="guardarCategoria()">
                    <div style="margin-bottom: 12px;">
                      <label>Nombre</label>
                      <input type="text" [(ngModel)]="categoriaForm.nombre" name="catNombre" required>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label>Descripción</label>
                      <textarea rows="2" [(ngModel)]="categoriaForm.descripcion" name="catDesc"></textarea>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label>Orden Visual</label>
                      <input type="number" [(ngModel)]="categoriaForm.ordenDisplay" name="catOrden">
                    </div>
                    <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
                      <input type="checkbox" [(ngModel)]="categoriaForm.activa" name="catActiva" id="catActiva" style="width:auto;">
                      <label for="catActiva" style="margin:0; cursor:pointer;">Categoría Activa</label>
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button class="btn-premium-secundario" style="flex: 1;" type="button" (click)="resetCategoriaForm()">Limpiar</button>
                      <button class="btn-premium-rojo" style="flex: 1.5;" type="submit">Guardar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- SUB-VISTA: FACTURACIÓN (REPORTE DE VENTAS POR FECHA) -->
          <div *ngIf="seccionActiva === 'facturacion'">
            <div class="section-box" style="margin-bottom: 24px;">
              <span class="section-subtitle">Consultas y Auditoría</span>
              <h2 class="section-title">Reporte de Ventas por Fecha</h2>
              
              <!-- Filtro de Fecha -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 15px; background: #080d19; border: 1px solid #1c273a; padding: 15px; margin-bottom: 20px;">
                <div>
                  <h3 style="font-weight: bold; color: white; margin: 0; font-size: 1rem;">Filtro de Reporte de Ventas</h3>
                  <p style="color: #64748b; margin: 2px 0 0 0; font-size: 0.82rem;">Seleccione una fecha para revisar el balance global.</p>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-weight: bold; color: #94a3b8; font-size: 0.85rem;">Fecha de Consulta:</span>
                  <input type="date" [(ngModel)]="fechaConsulta" (change)="cargarReporteVentas()" style="width: auto; font-family: inherit; font-weight: bold;">
                </div>
              </div>

              <!-- Estadísticas Principales del Día Seleccionado -->
              <div class="kpi-grid" style="margin-bottom: 24px;">
                <div class="kpi-card kpi-red" style="padding: 16px;">
                  <div class="kpi-info">
                    <span class="kpi-title">VENTAS TOTALES</span>
                    <span class="kpi-value" style="font-size: 1.4rem;">S/ {{ totalVentas | number:'1.2-2' }}</span>
                  </div>
                </div>
                <div class="kpi-card kpi-gold" style="padding: 16px;">
                  <div class="kpi-info">
                    <span class="kpi-title">COMPROBANTES</span>
                    <span class="kpi-value" style="font-size: 1.4rem;">{{ cantComprobantes }}</span>
                  </div>
                </div>
                <div class="kpi-card kpi-green" style="padding: 16px;">
                  <div class="kpi-info">
                    <span class="kpi-title">RECAUDADO EFECTIVO</span>
                    <span class="kpi-value" style="font-size: 1.4rem; color: #10b981;">S/ {{ totalEfectivo | number:'1.2-2' }}</span>
                  </div>
                </div>
                <div class="kpi-card kpi-blue" style="padding: 16px;">
                  <div class="kpi-info">
                    <span class="kpi-title">RECAUDADO MP</span>
                    <span class="kpi-value" style="font-size: 1.4rem; color: #00f2fe;">S/ {{ totalMercadoPago | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>

              <!-- Tabla de Comprobantes del Día -->
              <h3 style="font-weight: bold; margin-bottom: 12px; color: white; font-size: 0.95rem;">Comprobantes Emitidos el {{ fechaConsulta | date:'dd/MM/yyyy' }}</h3>
              
              <div *ngIf="facturasFiltradas.length === 0" style="text-align: center; padding: 40px 0; color: #64748b;">
                No hay transacciones registradas para la fecha seleccionada.
              </div>

              <table *ngIf="facturasFiltradas.length > 0" class="admin-table">
                <thead>
                  <tr>
                    <th>N° Comprobante</th>
                    <th>Tipo</th>
                    <th>Cliente</th>
                    <th>Método de Pago</th>
                    <th>Total</th>
                    <th>Detalle Comida</th>
                    <th style="text-align: center;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let fact of facturasFiltradas">
                    <td><strong>{{ fact.numeroComprobante }}</strong></td>
                    <td>{{ fact.tipoComprobante }}</td>
                    <td>{{ fact.clienteNombre }}</td>
                    <td>{{ fact.metodoPago }}</td>
                    <td style="font-weight: bold; color: #d4af37;">S/ {{ fact.total | number:'1.2-2' }}</td>
                    <td style="font-size: 0.78rem; color: #94a3b8; max-width: 250px;">
                      <div *ngFor="let item of fact.detalles">
                        • {{ item.cantidad }}x {{ item.descripcion }} (S/ {{ item.precioUnitario | number:'1.2-2' }})
                      </div>
                    </td>
                    <td style="text-align: center;">
                      <button mat-raised-button color="primary" class="btn-xs" style="background-color: #e11d48;" (click)="previsualizarTicketAdmin(fact)">
                        🔍 Ver Ticket
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- SUB-VISTA: USUARIOS (PERSONAL Y CLIENTES) -->
          <div *ngIf="seccionActiva === 'usuarios'">
            <div class="flex-layout">
              <div class="table-container" style="flex: 1.5; min-width: 450px; display: flex; flex-direction: column; gap: 24px;">
                <!-- Trabajadores -->
                <div class="section-box">
                  <span class="section-subtitle">Mantenimiento de Personal</span>
                  <h2 class="section-title">Personal Interno (Trabajadores)</h2>
                  <table class="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let u of trabajadores">
                        <td>{{ u.id }}</td>
                        <td><strong>{{ u.nombre }}</strong></td>
                        <td>{{ u.email }}</td>
                        <td>
                          <span class="badge" [ngClass]="'badge-role-' + u.rol.toLowerCase()">
                            {{ u.rol }}
                          </span>
                        </td>
                        <td>
                          <button mat-button color="primary" class="btn-xs" (click)="editarUsuario(u)">Editar</button>
                          <button mat-button color="warn" class="btn-xs" (click)="eliminarItem('usuarios', u.id)">Borrar</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Clientes -->
                <div class="section-box">
                  <span class="section-subtitle">Monitoreo de Consumidores</span>
                  <h2 class="section-title">Clientes Registrados y Conexión</h2>
                  <table class="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>DNI</th>
                        <th>Email</th>
                        <th>Último Acceso</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let u of clientesRegistrados">
                        <td>{{ u.id }}</td>
                        <td><strong>{{ u.nombre }}</strong></td>
                        <td>{{ u.dni }}</td>
                        <td>{{ u.email }}</td>
                        <td>
                          <span *ngIf="u.ultimoAcceso" style="color: #10b981; font-weight: 500;">
                            🟢 {{ u.ultimoAcceso | date:'dd/MM/yyyy HH:mm' }}
                          </span>
                          <span *ngIf="!u.ultimoAcceso" style="color: #64748b; font-style: italic;">
                            Nunca
                          </span>
                        </td>
                        <td>
                          <button mat-flat-button color="accent" class="btn-xs" style="background-color: #d4af37; color: black; font-weight: bold;" (click)="verHistorialCompras(u)">
                            🛒 Ver Compras
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Formulario de Usuarios -->
              <div class="form-container" style="flex: 1; min-width: 300px;">
                <div class="section-box">
                  <span class="section-subtitle">Operaciones</span>
                  <h2 class="section-title">{{ usuarioForm.id ? '🛠️ Editar Trabajador' : '✨ Nuevo Trabajador' }}</h2>
                  <form (ngSubmit)="guardarUsuario()">
                    <div style="margin-bottom: 12px;">
                      <label>Nombre Completo</label>
                      <input type="text" [(ngModel)]="usuarioForm.nombre" name="uNombre" required>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label>Email</label>
                      <input type="email" [(ngModel)]="usuarioForm.email" name="uEmail" required placeholder="ejemplo@cronos.com">
                    </div>
                    <div style="margin-bottom: 12px;" *ngIf="!usuarioForm.id">
                      <label>Contraseña</label>
                      <input type="password" [(ngModel)]="usuarioForm.password" name="uPassword" required>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <label>Rol del Usuario</label>
                      <select [(ngModel)]="usuarioForm.rol" name="uRol" required>
                        <option value="ADMIN">Administrador (ADMIN)</option>
                        <option value="CAJERO">Cajero (CAJERO)</option>
                        <option value="MOZO">Mozo (MOZO)</option>
                        <option value="COCINERO">Cocinero (COCINERO)</option>
                      </select>
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button class="btn-premium-secundario" style="flex: 1;" type="button" (click)="resetUsuarioForm()">Limpiar</button>
                      <button class="btn-premium-rojo" style="flex: 1.5;" type="submit">Guardar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- SUB-VISTA: CONFIGURACIÓN -->
          <div *ngIf="seccionActiva === 'configuracion'">
            <div class="section-box" style="max-width: 800px;">
              <span class="section-subtitle">Parámetros del Sistema</span>
              <h2 class="section-title">Configuración General de CronosRestobar</h2>
              
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;">
                <div>
                  <label>Razón Social</label>
                  <input type="text" value="Cronos Restobar S.A.C." readonly>
                </div>
                <div>
                  <label>RUC Emisor</label>
                  <input type="text" value="20608754129" readonly>
                </div>
                <div>
                  <label>Dirección del Local</label>
                  <input type="text" value="Av. Restauración 123 - Miraflores, Lima" readonly>
                </div>
                <div>
                  <label>Impuesto General a las Ventas (IGV)</label>
                  <input type="text" value="18%" readonly>
                </div>
              </div>

              <span class="section-subtitle">Auditoría de Datos</span>
              <h3 style="font-weight: bold; margin-bottom: 12px; color: white;">Estadísticas del Servidor</h3>
              <div class="kpi-grid">
                <div class="kpi-card kpi-red" style="padding: 16px;">
                  <div class="kpi-info">
                    <span class="kpi-title">TOTAL MESAS</span>
                    <span class="kpi-value" style="font-size: 1.4rem;">{{ mesas.length }}</span>
                  </div>
                </div>
                <div class="kpi-card kpi-gold" style="padding: 16px;">
                  <div class="kpi-info">
                    <span class="kpi-title">CATEGORÍAS</span>
                    <span class="kpi-value" style="font-size: 1.4rem;">{{ categorias.length }}</span>
                  </div>
                </div>
                <div class="kpi-card kpi-green" style="padding: 16px;">
                  <div class="kpi-info">
                    <span class="kpi-title">INSUMOS STOCK</span>
                    <span class="kpi-value" style="font-size: 1.4rem;">{{ insumos.length }}</span>
                  </div>
                </div>
                <div class="kpi-card kpi-blue" style="padding: 16px;">
                  <div class="kpi-info">
                    <span class="kpi-title">USUARIOS BD</span>
                    <span class="kpi-value" style="font-size: 1.4rem;">{{ usuarios.length }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>

    <!-- MODAL: VISOR DE DETALLE DE PEDIDO -->
    <div class="modal-overlay" *ngIf="mostrarPedidoModal">
      <div class="modal-card">
        <h3 style="font-weight: bold; margin: 0 0 6px 0; color: #e11d48; font-size: 1.2rem; text-transform: uppercase;">🛒 Detalles del Pedido #00{{ pedidoSeleccionado?.id }}</h3>
        <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 20px;">
          Cliente: <strong>{{ pedidoSeleccionado?.usuarioNombre }}</strong> | Mesa N° {{ pedidoSeleccionado?.mesaNumero }}
        </p>

        <div style="border-top: 1px solid #1c273a; border-bottom: 1px solid #1c273a; padding: 15px 0; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;">
          <div *ngFor="let det of pedidoSeleccionado?.detalles" style="display: flex; justify-content: space-between; font-size: 0.9rem;">
            <span>{{ det.cantidad }}x {{ det.productoNombre || 'Item' }}</span>
            <span style="font-weight: bold; color: white;">S/ {{ det.subtotal | number:'1.2-2' }}</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 1.1rem; color: white; margin-bottom: 24px;">
          <span>Total del Pedido:</span>
          <span style="color: #d4af37;">S/ {{ pedidoSeleccionado?.total | number:'1.2-2' }}</span>
        </div>

        <div style="text-align: right;">
          <button class="btn-premium-rojo" (click)="cerrarPedidoModal()">Cerrar Detalles</button>
        </div>
      </div>
    </div>

    <!-- MODAL: VISOR DE HISTORIAL DE COMPRAS CLIENTE -->
    <div class="modal-overlay" *ngIf="mostrarHistorialModal">
      <div class="modal-card" style="max-width: 650px;">
        <h3 style="font-weight: bold; margin: 0 0 4px 0; color: #d4af37; font-size: 1.2rem; text-transform: uppercase;">🛒 Historial de Consumos del Cliente</h3>
        <p style="color: #94a3b8; margin-bottom: 20px; font-size: 0.85rem;">Cliente: <strong>{{ clienteSeleccionado?.nombre }}</strong> (DNI: {{ clienteSeleccionado?.dni }})</p>

        <div *ngIf="comprasCliente.length === 0" style="text-align: center; padding: 40px 0; color: #64748b; font-style: italic; font-size: 0.9rem;">
          Este cliente no registra compras ni pagos de pedidos en el sistema.
        </div>

        <div *ngIf="comprasCliente.length > 0" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; max-height: 50vh; overflow-y: auto; padding-right: 10px;">
          <div *ngFor="let compra of comprasCliente" style="border: 1px solid #1c273a; padding: 16px; background: #080d19;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dotted #1c273a; padding-bottom: 6px;">
              <span style="font-weight: bold; color: white;">{{ compra.numeroComprobante }} ({{ compra.tipoComprobante }})</span>
              <span style="font-weight: bold; color: #d4af37;">S/ {{ compra.total | number:'1.2-2' }}</span>
            </div>
            
            <div style="font-size: 0.82rem; line-height: 1.5; color: #94a3b8;">
              <div>Fecha: {{ compra.fechaEmision | date:'dd/MM/yyyy HH:mm:ss' }}</div>
              <div>Método: {{ compra.metodoPago }} <span *ngIf="compra.transaccionId">(TX: {{ compra.transaccionId }})</span></div>
              <div style="margin-top: 8px; font-weight: bold; color: white;">Platos consumidos:</div>
              <div *ngFor="let det of compra.detalles" style="padding-left: 10px; font-family: monospace;">
                • {{ det.cantidad }}x {{ det.descripcion }} (S/ {{ det.precioUnitario | number:'1.2-2' }})
              </div>
            </div>
            <div style="text-align: right; margin-top: 10px;">
              <button class="btn-premium-secundario btn-xs" (click)="previsualizarTicketAdmin(compra)">
                Visualizar Comprobante
              </button>
            </div>
          </div>
        </div>

        <div style="text-align: right;">
          <button class="btn-premium-rojo" (click)="cerrarHistorialModal()">Cerrar Historial</button>
        </div>
      </div>
    </div>

    <!-- MODAL: VISOR DE TICKET COMPROBANTE TÉRMICO (RE-IMPRESIÓN) -->
    <div class="modal-overlay" *ngIf="mostrarTicketAdminModal">
      <mat-card style="width: 100%; max-width: 440px; padding: 25px; background: #ffffff; border-radius: 0; overflow-y: auto; max-height: 90vh; color: #111111; font-family: 'Courier New', Courier, monospace; border: 1px solid #cccccc; border-top: 10px solid #e11d48; box-shadow: none !important;">
        
        <!-- Ticket Imprimible -->
        <div style="background: white; padding: 5px;">
          <div style="text-align: center; border-bottom: 1px dashed #333333; padding-bottom: 12px; margin-bottom: 12px;">
            <h2 style="font-weight: bold; margin: 0 0 4px 0; font-size: 1.4rem; color: #111; font-family: inherit;">CRONOS RESTOBAR</h2>
            <p style="font-size: 0.85em; margin: 2px 0; font-weight: 600;">RUC: 20608754129</p>
            <p style="font-size: 0.8em; margin: 2px 0;">Av. Restauración 123 - Miraflores, Lima</p>
            <p style="font-size: 0.8em; margin: 2px 0;">Telf: (01) 445-8902</p>
            
            <div style="font-size: 0.85em; font-weight: bold; margin: 10px 0; border: 1px solid #111; padding: 6px; display: inline-block; text-transform: uppercase;">
              {{ ticketAdminSeleccionado?.tipoComprobante === 'FACTURA' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA' }} <br>
              {{ ticketAdminSeleccionado?.numeroComprobante }}
            </div>
          </div>

          <div style="font-size: 0.8em; line-height: 1.4; margin-bottom: 12px; border-bottom: 1px dashed #333333; padding-bottom: 12px;">
            <div><strong>FECHA EMISIÓN:</strong> {{ ticketAdminSeleccionado?.fechaEmision | date:'dd/MM/yyyy HH:mm:ss' }}</div>
            <div><strong>CLIENTE:</strong> {{ ticketAdminSeleccionado?.clienteNombre | uppercase }}</div>
            
            <div *ngIf="ticketAdminSeleccionado?.tipoComprobante === 'FACTURA'">
              <div><strong>RUC:</strong> {{ ticketAdminSeleccionado?.clienteRuc }}</div>
              <div><strong>DIRECCIÓN:</strong> {{ ticketAdminSeleccionado?.razonSocial }}</div>
            </div>
            <div *ngIf="ticketAdminSeleccionado?.tipoComprobante === 'BOLETA'">
              <div><strong>DNI/DOC:</strong> {{ ticketAdminSeleccionado?.clienteDocumento || '00000000' }}</div>
            </div>
            
            <div style="margin-top: 6px; border-top: 1px dotted #ccc; padding-top: 6px;">
              <div><strong>CAJERO / EMISOR:</strong> {{ ticketAdminSeleccionado?.usuarioNombre || 'Caja Central' }}</div>
              <div><strong>MÉTODO DE PAGO:</strong> {{ ticketAdminSeleccionado?.metodoPago }}</div>
              <div *ngIf="ticketAdminSeleccionado?.transaccionId" style="word-break: break-all;"><strong>ID TRANSACCIÓN:</strong> {{ ticketAdminSeleccionado?.transaccionId }}</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 0.8em; margin-bottom: 12px;">
            <thead>
              <tr style="border-bottom: 1px dashed #333333;">
                <th style="padding: 4px 0; text-align: left;">DESCRIPCIÓN</th>
                <th style="padding: 4px 0; text-align: center; width: 45px;">CANT.</th>
                <th style="padding: 4px 0; text-align: right; width: 80px;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let det of ticketAdminSeleccionado?.detalles">
                <td style="padding: 6px 0; text-align: left; vertical-align: top;">{{ det.descripcion }}</td>
                <td style="padding: 6px 0; text-align: center; vertical-align: top;">{{ det.cantidad }}</td>
                <td style="padding: 6px 0; text-align: right; vertical-align: top;">S/ {{ det.subtotal | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: right; font-size: 0.85em; border-top: 1px dashed #333333; padding-top: 8px; margin-bottom: 15px;">
            <div>SUBTOTAL: S/ {{ ticketAdminSeleccionado?.subtotal | number:'1.2-2' }}</div>
            <div>IGV (18%): S/ {{ ticketAdminSeleccionado?.igv | number:'1.2-2' }}</div>
            <div style="font-weight: bold; font-size: 1.1em; margin-top: 4px;">
              TOTAL PAGADO: S/ {{ ticketAdminSeleccionado?.total | number:'1.2-2' }}
            </div>
          </div>

          <!-- Códigos SUNAT -->
          <div style="text-align: center; border-top: 1px dashed #333333; padding-top: 10px;">
            <svg width="220" height="25" style="margin: 5px auto; display: block;">
              <rect width="220" height="25" fill="white" />
              <rect x="10" y="2" width="2" height="20" fill="black" />
              <rect x="14" y="2" width="4" height="20" fill="black" />
              <rect x="20" y="2" width="1" height="20" fill="black" />
              <rect x="23" y="2" width="3" height="20" fill="black" />
              <rect x="28" y="2" width="2" height="20" fill="black" />
              <rect x="34" y="2" width="4" height="20" fill="black" />
              <rect x="40" y="2" width="1" height="20" fill="black" />
              <rect x="44" y="2" width="2" height="20" fill="black" />
              <rect x="48" y="2" width="4" height="20" fill="black" />
              <rect x="58" y="2" width="3" height="20" fill="black" />
              <rect x="68" y="2" width="4" height="20" fill="black" />
              <rect x="78" y="2" width="2" height="20" fill="black" />
              <rect x="88" y="2" width="4" height="20" fill="black" />
              <rect x="100" y="2" width="2" height="20" fill="black" />
              <rect x="110" y="2" width="1" height="20" fill="black" />
              <rect x="120" y="2" width="3" height="20" fill="black" />
              <rect x="130" y="2" width="4" height="20" fill="black" />
              <rect x="140" y="2" width="2" height="20" fill="black" />
              <rect x="150" y="2" width="1" height="20" fill="black" />
              <rect x="160" y="2" width="3" height="20" fill="black" />
              <rect x="170" y="2" width="4" height="20" fill="black" />
              <rect x="180" y="2" width="2" height="20" fill="black" />
              <rect x="190" y="2" width="3" height="20" fill="black" />
              <rect x="200" y="2" width="4" height="20" fill="black" />
            </svg>
            <div style="font-size: 0.7em; color: #555;">Comprobante Aprobado por SUNAT</div>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
          <button mat-raised-button color="accent" style="flex: 1; height: 36px; font-weight: bold; border-radius:0 !important; background-color: #d4af37; color: black;" (click)="imprimirTicketAdmin()">
            🖨️ Re-Imprimir
          </button>
          <button mat-flat-button color="primary" style="flex: 1; height: 36px; background-color: #e11d48; font-weight: bold; border-radius:0 !important;" (click)="cerrarTicketAdminModal()">
            Cerrar
          </button>
        </div>
      </mat-card>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  usuario: any;
  seccionActiva = 'dashboard';
  fechaHoyFormateada = '';

  // Estadísticas Dashboard
  pedidosHoyCount = 0;
  gananciasHoy = 0;
  reservasActivasCount = 0;
  clientesCount = 0;
  productosCount = 0;
  facturasCount = 0;
  ventasMes = 0;

  ultimosPedidos: any[] = [];
  mesasConReservas: any[] = [];

  // Listas de datos CRUD
  mesas: any[] = [];
  categorias: any[] = [];
  productos: any[] = [];
  insumos: any[] = [];
  usuarios: any[] = [];
  pedidos: any[] = [];
  reservas: any[] = [];
  facturasHistorial: any[] = [];

  // Sublistas filtradas de Usuarios
  trabajadores: any[] = [];
  clientesRegistrados: any[] = [];

  // Modelos de Formulario CRUD
  mesaForm: any = { id: null, numero: null, capacidad: null, tipo: 'PAREJA', ubicacion: '', activa: true };
  categoriaForm: any = { id: null, nombre: '', descripcion: '', ordenDisplay: 0, activa: true };
  productoForm: any = { id: null, categoriaId: null, nombre: '', descripcion: '', precio: null, tiempoPreparacionMin: 15, ordenDisplay: 0, imagenUrl: '', disponible: true, activo: true };
  insumoForm: any = { id: null, nombre: '', unidad: '', stockActual: 0.0, stockMinimo: 0.0, activo: true };
  usuarioForm: any = { id: null, nombre: '', dni: '', telefono: '', email: '', password: '', rol: 'MOZO', activo: true };

  // Variables para la visualización del Reporte de Ventas por Fecha
  fechaConsulta = '';
  facturasFiltradas: any[] = [];
  totalVentas = 0;
  cantComprobantes = 0;
  totalEfectivo = 0;
  totalMercadoPago = 0;

  // Variables para historial de compras del cliente
  mostrarHistorialModal = false;
  clienteSeleccionado: any = null;
  comprasCliente: any[] = [];

  // Variables para visualizar ticket térmico
  mostrarTicketAdminModal = false;
  ticketAdminSeleccionado: any = null;

  // Visualizar detalles pedido
  mostrarPedidoModal = false;
  pedidoSeleccionado: any = null;

  constructor(
    private authService: AuthService,
    private genericService: CrudGenericoService,
    private facturaService: FacturaService,
    private pedidoService: PedidoService,
    private reservaService: ReservaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    
    // Formatear fecha de hoy
    const hoy = new Date();
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    this.fechaHoyFormateada = `${dias[hoy.getDay()]}, ${hoy.getDate()} ${meses[hoy.getMonth()]} ${hoy.getFullYear()}`;
    this.fechaConsulta = hoy.toISOString().substring(0, 10);

    this.cargarDatos();
  }

  setSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar listas completas
    this.genericService.listar('mesas').subscribe(data => {
      this.mesas = data;
      this.actualizarReservasDeHoy();
    });

    this.genericService.listar('categorias').subscribe(data => this.categorias = data);

    this.genericService.listar('productos').subscribe(data => {
      this.productos = data;
      this.productosCount = data.length;
    });

    this.genericService.listar('insumos').subscribe(data => this.insumos = data);

    this.genericService.listar('usuarios').subscribe(data => {
      this.usuarios = data;
      this.trabajadores = data.filter(u => u.rol !== 'CLIENTE');
      this.clientesRegistrados = data.filter(u => u.rol === 'CLIENTE');
      this.clientesCount = this.clientesRegistrados.length;
    });

    this.facturaService.listarTodas().subscribe(data => {
      this.facturasHistorial = data;
      this.facturasCount = data.length;
      this.calcularGananciasHoyYVentasMes();
      this.cargarReporteVentas();
    });

    this.genericService.listar('pedidos').subscribe(data => {
      this.pedidos = data;
      this.calcularPedidosHoyYUltimos();
    });

    this.genericService.listar('reservas').subscribe(data => {
      this.reservas = data;
      this.actualizarReservasDeHoy();
      this.calcularReservasActivas();
    });
  }

  // CÁLCULOS KPI
  calcularPedidosHoyYUltimos(): void {
    const hoyStr = new Date().toISOString().substring(0, 10);
    const pedidosHoy = this.pedidos.filter(p => p.fechaHora && String(p.fechaHora).startsWith(hoyStr));
    this.pedidosHoyCount = pedidosHoy.length;

    // Ultimos pedidos para tabla dashboard (id descendente)
    this.ultimosPedidos = [...this.pedidos]
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);
  }

  calcularReservasActivas(): void {
    const hoyStr = new Date().toISOString().substring(0, 10);
    this.reservasActivasCount = this.reservas.filter(r => r.fecha === hoyStr && r.estado !== 'CANCELADA').length;
  }

  actualizarReservasDeHoy(): void {
    if (this.mesas.length === 0) return;
    const hoyStr = new Date().toISOString().substring(0, 10);

    this.mesasConReservas = this.mesas.map(mesa => {
      const res = this.reservas.find(r => r.mesaId === mesa.id && r.fecha === hoyStr && r.estado !== 'CANCELADA');
      return {
        ...mesa,
        reservaHoy: res ? { clienteNombre: res.clienteNombre, fechaHora: res.fechaHora || (res.fecha + 'T' + (res.horaComida || '12:00:00')) } : null
      };
    }).slice(0, 4); // Tomar solo las primeras 4 mesas para la vista de dashboard reducida
  }

  calcularGananciasHoyYVentasMes(): void {
    const hoyStr = new Date().toISOString().substring(0, 10);
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    const facturasHoy = this.facturasHistorial.filter(f => f.fechaEmision && String(f.fechaEmision).startsWith(hoyStr));
    this.gananciasHoy = facturasHoy.reduce((acc, f) => acc + f.total, 0);

    const facturasMes = this.facturasHistorial.filter(f => {
      if (!f.fechaEmision) return false;
      const fDate = new Date(f.fechaEmision);
      return fDate.getMonth() === mesActual && fDate.getFullYear() === anioActual;
    });
    this.ventasMes = facturasMes.reduce((acc, f) => acc + f.total, 0);
  }

  // DETALLES PEDIDO
  verDetallePedido(pedido: any): void {
    this.pedidoSeleccionado = pedido;
    this.mostrarPedidoModal = true;
  }

  cerrarPedidoModal(): void {
    this.mostrarPedidoModal = false;
    this.pedidoSeleccionado = null;
  }

  actualizarEstadoPedido(id: number, estado: string): void {
    this.pedidoService.cambiarEstado(id, estado).subscribe({
      next: () => {
        this.cargarDatos();
      },
      error: (err) => alert('Error al cambiar el estado del pedido: ' + (err.error?.message || err.message))
    });
  }

  cancelarReserva(id: number): void {
    if (confirm('¿Está seguro de cancelar esta reserva?')) {
      this.reservaService.cambiarEstado(id, 'CANCELADA').subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => alert('Error al cancelar la reserva: ' + (err.error?.message || err.message))
      });
    }
  }

  // CARGAR REPORTE DE VENTAS POR FECHA
  cargarReporteVentas(): void {
    // Filtrar facturas que coincidan con la fecha seleccionada (YYYY-MM-DD)
    this.facturasFiltradas = this.facturasHistorial.filter(f => {
      if (!f.fechaEmision) return false;
      return String(f.fechaEmision).startsWith(this.fechaConsulta);
    });

    // Calcular totales
    this.cantComprobantes = this.facturasFiltradas.length;
    this.totalVentas = this.facturasFiltradas.reduce((acc, f) => acc + f.total, 0);
    this.totalEfectivo = this.facturasFiltradas
      .filter(f => f.metodoPago === 'EFECTIVO')
      .reduce((acc, f) => acc + f.total, 0);
    this.totalMercadoPago = this.facturasFiltradas
      .filter(f => f.metodoPago === 'MERCADO_PAGO')
      .reduce((acc, f) => acc + f.total, 0);
  }

  // INSPECCIÓN DE HISTORIAL DE COMPRAS DE CLIENTE
  verHistorialCompras(cliente: any): void {
    this.clienteSeleccionado = cliente;
    this.comprasCliente = this.facturasHistorial.filter(f => f.usuarioId === cliente.id);
    this.mostrarHistorialModal = true;
  }

  cerrarHistorialModal(): void {
    this.mostrarHistorialModal = false;
    this.clienteSeleccionado = null;
    this.comprasCliente = [];
  }

  // PREVISUALIZAR TICKET DESDE EL ADMIN
  previsualizarTicketAdmin(factura: any): void {
    this.ticketAdminSeleccionado = factura;
    this.mostrarTicketAdminModal = true;
  }

  imprimirTicketAdmin(): void {
    window.print();
  }

  cerrarTicketAdminModal(): void {
    this.mostrarTicketAdminModal = false;
    this.ticketAdminSeleccionado = null;
  }

  // OPERACIONES MESAS
  editarMesa(mesa: any): void {
    this.mesaForm = { ...mesa };
  }
  resetMesaForm(): void {
    this.mesaForm = { id: null, numero: null, capacidad: null, tipo: 'PAREJA', ubicacion: '', activa: true };
  }
  guardarMesa(): void {
    if (this.mesaForm.id) {
      this.genericService.actualizar('mesas', this.mesaForm.id, this.mesaForm).subscribe({
        next: () => { this.cargarDatos(); this.resetMesaForm(); },
        error: (err) => alert('Error al actualizar mesa: ' + err.error?.message)
      });
    } else {
      this.genericService.crear('mesas', this.mesaForm).subscribe({
        next: () => { this.cargarDatos(); this.resetMesaForm(); },
        error: (err) => alert('Error al crear mesa: ' + err.error?.message)
      });
    }
  }

  // OPERACIONES CATEGORÍAS
  editarCategoria(cat: any): void {
    this.categoriaForm = { ...cat };
  }
  resetCategoriaForm(): void {
    this.categoriaForm = { id: null, nombre: '', descripcion: '', ordenDisplay: 0, activa: true };
  }
  guardarCategoria(): void {
    if (this.categoriaForm.id) {
      this.genericService.actualizar('categorias', this.categoriaForm.id, this.categoriaForm).subscribe({
        next: () => { this.cargarDatos(); this.resetCategoriaForm(); },
        error: (err) => alert('Error al actualizar categoría')
      });
    } else {
      this.genericService.crear('categorias', this.categoriaForm).subscribe({
        next: () => { this.cargarDatos(); this.resetCategoriaForm(); },
        error: (err) => alert('Error al crear categoría')
      });
    }
  }

  // OPERACIONES PRODUCTOS
  editarProducto(p: any): void {
    this.productoForm = { ...p };
  }
  resetProductoForm(): void {
    this.productoForm = { id: null, categoriaId: null, nombre: '', descripcion: '', precio: null, tiempoPreparacionMin: 15, ordenDisplay: 0, imagenUrl: '', disponible: true, activo: true };
  }
  guardarProducto(): void {
    if (this.productoForm.id) {
      this.genericService.actualizar('productos', this.productoForm.id, this.productoForm).subscribe({
        next: () => { this.cargarDatos(); this.resetProductoForm(); },
        error: (err) => alert('Error al actualizar producto: ' + err.error?.message)
      });
    } else {
      this.genericService.crear('productos', this.productoForm).subscribe({
        next: () => { this.cargarDatos(); this.resetProductoForm(); },
        error: (err) => alert('Error al crear producto: ' + err.error?.message)
      });
    }
  }

  // OPERACIONES INSUMOS
  editarInsumo(ins: any): void {
    this.insumoForm = { ...ins };
  }
  resetInsumoForm(): void {
    this.insumoForm = { id: null, nombre: '', unidad: '', stockActual: 0.0, stockMinimo: 0.0, activo: true };
  }
  guardarInsumo(): void {
    if (this.insumoForm.id) {
      this.genericService.actualizar('insumos', this.insumoForm.id, this.insumoForm).subscribe({
        next: () => { this.cargarDatos(); this.resetInsumoForm(); },
        error: (err) => alert('Error al actualizar insumo')
      });
    } else {
      this.genericService.crear('insumos', this.insumoForm).subscribe({
        next: () => { this.cargarDatos(); this.resetInsumoForm(); },
        error: (err) => alert('Error al crear insumo')
      });
    }
  }

  // OPERACIONES USUARIOS (TRABAJADORES Y ROLES)
  editarUsuario(u: any): void {
    this.usuarioForm = { ...u };
  }
  resetUsuarioForm(): void {
    this.usuarioForm = { id: null, nombre: '', dni: '', telefono: '', email: '', password: '', rol: 'MOZO', activo: true };
  }
  guardarUsuario(): void {
    const body: any = { ...this.usuarioForm };
    delete body.DNI; // Eliminar clave antigua por si acaso
    
    // Configurar 'nombres' con el 'nombre' completo para evitar que el backend consulte a la RENIEC
    body.nombres = body.nombre;
    body.apellidoPaterno = null;
    body.apellidoMaterno = null;

    // Autogenerar DNI y teléfono únicos para cumplir con las restricciones del backend (UsuarioDTO)
    if (!body.id) {
      body.dni = Math.floor(10000000 + Math.random() * 90000000).toString();
      body.telefono = '9' + Math.floor(10000000 + Math.random() * 90000000).toString();
    }

    if (body.id) {
      this.genericService.actualizar('usuarios', body.id, body).subscribe({
        next: () => { this.cargarDatos(); this.resetUsuarioForm(); },
        error: (err) => alert('Error al actualizar usuario')
      });
    } else {
      this.genericService.crear('usuarios', body).subscribe({
        next: () => { this.cargarDatos(); this.resetUsuarioForm(); },
        error: (err) => alert('Error al crear usuario: ' + (err.error?.message || ''))
      });
    }
  }

  // ELIMINAR ITEM GENÉRICO
  eliminarItem(endpoint: string, id: number): void {
    if (confirm(`¿Está seguro de eliminar este registro de ${endpoint}?`)) {
      this.genericService.eliminar(endpoint, id).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => alert(err.error?.message || 'Error al eliminar el registro. Puede que esté referenciado en otra tabla.')
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
