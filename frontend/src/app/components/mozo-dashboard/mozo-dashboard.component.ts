import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';
import { CrudGenericoService } from '../../services/crud-generico.service';

@Component({
  selector: 'app-mozo-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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
      .role-badge {
        font-size: 0.65rem;
        color: #d4af37;
        border: 1px solid #d4af37;
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
      .listos-badge {
        background-color: #10b981;
      }
      .nav-item.active .listos-badge {
        color: #10b981;
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
      .sse-notification-banner {
        background-color: rgba(16, 185, 129, 0.1);
        border: 1px solid #10b981;
        color: #10b981;
        padding: 14px 20px;
        margin-bottom: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .sse-banner-content {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: bold;
        font-size: 0.88rem;
      }
      .icon-alert {
        font-size: 1.3rem;
        animation: sse-blink 1s ease infinite;
      }
      @keyframes sse-blink {
        50% { opacity: 0.4; }
      }
      .btn-sse-close {
        background: transparent;
        border: 1px solid #10b981;
        color: #10b981;
        font-size: 0.72rem;
        font-weight: bold;
        text-transform: uppercase;
        padding: 4px 10px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-sse-close:hover {
        background-color: #10b981;
        color: black;
      }
      .mesas-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 24px;
      }
      .legend-container {
        display: flex;
        gap: 16px;
        margin-bottom: 6px;
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.78rem;
        color: #94a3b8;
        font-weight: bold;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .dot-libre { background-color: #10b981; }
      .dot-ocupada { background-color: #e11d48; }
      .dot-reservada { background-color: #d4af37; }
      .dot-inactiva { background-color: #475569; }

      .mesas-filters-row {
        margin-bottom: 24px;
        border-bottom: 1px solid #1c273a;
        padding-bottom: 12px;
      }
      .mesas-filters {
        display: flex;
        gap: 8px;
      }
      .filter-btn {
        background: transparent;
        border: 1px solid #1c273a;
        color: #94a3b8;
        padding: 8px 16px;
        font-size: 0.78rem;
        font-weight: bold;
        cursor: pointer;
        letter-spacing: 0.05em;
        transition: all 0.2s;
      }
      .filter-btn:hover {
        border-color: #94a3b8;
        color: white;
      }
      .filter-btn.active {
        background-color: white;
        border-color: white;
        color: #060913;
      }
      .mesas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
      }
      .mesa-card {
        background-color: #0d1321;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 160px;
        cursor: pointer;
        transition: transform 0.2s, background-color 0.2s;
      }
      .mesa-card:hover {
        transform: translateY(-2px);
        background-color: #111a2e;
      }
      .card-libre { border: 1.5px solid #10b981; }
      .card-ocupada { border: 1.5px solid #e11d48; }
      .card-reservada { border: 1.5px solid #d4af37; }
      .card-inactiva { border: 1.5px solid #475569; opacity: 0.5; }

      .mesa-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .mesa-card-code {
        font-size: 1.3rem;
        font-weight: 900;
        color: white;
      }
      .mesa-vip-badge {
        background-color: #d4af37;
        color: black;
        font-size: 0.6rem;
        font-weight: 900;
        padding: 2px 6px;
        letter-spacing: 0.05em;
      }
      .mesa-card-body {
        margin: 12px 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .mesa-card-capacity {
        font-size: 0.72rem;
        color: #64748b;
        text-transform: uppercase;
        font-weight: bold;
        letter-spacing: 0.05em;
      }
      .mesa-card-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .info-line {
        font-size: 0.8rem;
        font-weight: bold;
        color: #94a3b8;
      }
      .text-gold {
        color: #d4af37 !important;
      }
      .mesa-card-status {
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-top: auto;
      }
      .card-libre .mesa-card-status { color: #10b981; }
      .card-ocupada .mesa-card-status { color: #e11d48; }
      .card-reservada .mesa-card-status { color: #d4af37; }
      .card-inactiva .mesa-card-status { color: #475569; }

      /* Carta styling */
      .carta-layout {
        display: flex;
        gap: 30px;
      }
      .catalogo-section {
        flex: 1.8;
        min-width: 0;
      }
      .catalogo-header {
        margin-bottom: 24px;
      }
      .productos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
      .producto-card {
        background-color: #0d1321;
        border: 1px solid #1c273a;
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 120px;
      }
      .producto-title {
        font-size: 0.9rem;
        font-weight: bold;
        color: white;
        margin-bottom: 4px;
      }
      .producto-desc {
        font-size: 0.78rem;
        color: #64748b;
        margin-bottom: 12px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .producto-price-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
      }
      .producto-price {
        font-size: 1rem;
        font-weight: bold;
        color: #d4af37;
      }
      .btn-add-item {
        background-color: transparent;
        border: 1px solid #1c273a;
        color: #94a3b8;
        padding: 4px 10px;
        font-size: 0.72rem;
        font-weight: bold;
        text-transform: uppercase;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s;
      }
      .btn-add-item:hover {
        border-color: #e11d48;
        color: #e11d48;
      }

      .comanda-section {
        flex: 1.2;
        min-width: 320px;
      }
      .comanda-panel {
        background-color: #0d1321;
        border: 1px solid #1c273a;
        padding: 24px;
        position: sticky;
        top: 20px;
        display: flex;
        flex-direction: column;
      }
      .comanda-title {
        font-size: 1.15rem;
        font-weight: 800;
        text-transform: uppercase;
        margin: 0 0 16px 0;
        letter-spacing: 0.05em;
        color: white;
      }
      .comanda-select-mesa {
        background-color: #060913 !important;
        color: white !important;
        border: 1px solid #1c273a !important;
        padding: 10px;
        font-family: inherit;
        font-size: 0.85rem;
        width: 100%;
      }
      .comanda-items-wrapper {
        min-height: 180px;
        border: 1px dashed #1c273a;
        background-color: rgba(6, 9, 19, 0.5);
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
      }
      .comanda-empty {
        padding: 40px 20px;
        text-align: center;
        color: #64748b;
        font-size: 0.8rem;
        margin: auto;
      }
      .comanda-items {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .comanda-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.02);
        padding-bottom: 10px;
      }
      .item-name {
        font-size: 0.82rem;
        font-weight: bold;
        color: white;
      }
      .item-price {
        font-size: 0.72rem;
        color: #64748b;
        margin-top: 2px;
      }
      .item-quantity-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .btn-qty {
        width: 22px;
        height: 22px;
        background-color: #060913;
        border: 1px solid #1c273a;
        color: white;
        font-size: 0.8rem;
        font-weight: bold;
        cursor: pointer;
      }
      .btn-qty:hover {
        border-color: #e11d48;
      }
      .item-qty {
        font-size: 0.85rem;
        font-weight: bold;
        color: white;
        min-width: 16px;
        text-align: center;
      }
      .btn-delete {
        background: transparent;
        border: none;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
      }
      .btn-delete:hover {
        color: #e11d48;
      }

      .comanda-notes {
        background-color: #060913 !important;
        color: white !important;
        border: 1px solid #1c273a !important;
        padding: 10px;
        width: 100%;
        font-family: inherit;
        font-size: 0.82rem;
        outline: none;
        resize: none;
      }
      .comanda-notes:focus {
        border-color: #e11d48 !important;
      }
      .comanda-total-row {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        font-size: 1rem;
        color: white;
        margin-top: 15px;
        border-top: 1px solid #1c273a;
        padding-top: 12px;
      }
      .total-price {
        color: #d4af37;
        font-size: 1.25rem;
        font-weight: 900;
      }
      .comanda-error {
        color: #e11d48;
        font-size: 0.78rem;
        margin-top: 10px;
      }
      .comanda-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }

      /* Tables for status monitoring */
      .section-box {
        background-color: #0d1321;
        border: 1px solid #1c273a;
        padding: 24px;
      }
      .section-subtitle {
        font-size: 0.65rem;
        color: #e11d48;
        font-weight: bold;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }
      .section-title {
        font-size: 1.5rem;
        font-weight: 800;
        margin: 4px 0 20px 0;
        color: white;
      }
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
        text-align: left;
      }
      .admin-table td {
        color: #94a3b8 !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
        font-size: 0.82rem;
        padding: 12px 16px !important;
      }
      .estado-badge {
        padding: 3px 8px;
        font-size: 0.65rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .estado-pendiente { background-color: rgba(212, 175, 55, 0.12); color: #d4af37; }
      .estado-en_preparacion { background-color: rgba(2, 119, 189, 0.12); color: #00f2fe; }
      .estado-listo { background-color: rgba(16, 185, 129, 0.12); color: #10b981; animation: blinker 1.5s linear infinite; }

      @keyframes blinker {
        50% { opacity: 0.5; }
      }

      .btn-xs {
        padding: 4px 10px;
        font-size: 0.72rem;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        letter-spacing: 0.05em;
        cursor: pointer;
      }

      /* Listos grid styling */
      .listos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
      .listo-card {
        background-color: #0d1321;
        border: 1px solid #10b981;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .listo-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #1c273a;
        padding-bottom: 10px;
        margin-bottom: 12px;
      }
      .listo-card-title {
        font-weight: bold;
        font-size: 0.9rem;
        color: white;
      }
      .listo-card-mesa {
        font-weight: 900;
        color: #10b981;
        font-size: 0.95rem;
      }
      .listo-card-body {
        font-size: 0.8rem;
        color: #94a3b8;
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .listo-item-desc {
        font-weight: bold;
        color: white;
      }
      .listo-time {
        margin-top: 8px;
        font-size: 0.72rem;
        color: #64748b;
      }

      /* Modals styling */
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
          <div class="role-badge">MESERO</div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-group">
            <span class="group-title">Principal</span>
            <button class="nav-item" [class.active]="seccionActiva === 'mesas'" (click)="setSeccion('mesas')">
              <span class="material-symbols-outlined">grid_view</span>
              <span>Mesas</span>
            </button>
            <button class="nav-item" [class.active]="seccionActiva === 'pedidos'" (click)="setSeccion('pedidos')">
              <span class="material-symbols-outlined">receipt_long</span>
              <span>Pedidos</span>
              <span class="nav-count-badge" *ngIf="pedidosActivosCount > 0">{{ pedidosActivosCount }}</span>
            </button>
            <button class="nav-item" [class.active]="seccionActiva === 'listos'" (click)="setSeccion('listos')">
              <span class="material-symbols-outlined">notifications_active</span>
              <span>Listos</span>
              <span class="nav-count-badge listos-badge" *ngIf="listosCount > 0">{{ listosCount }}</span>
            </button>
          </div>

          <div class="nav-group">
            <span class="group-title">Carta</span>
            <button class="nav-item" [class.active]="seccionActiva === 'carta' && categoriaSeleccionada === 'Entradas'" (click)="setSeccionCarta('Entradas')">
              <span class="material-symbols-outlined">soup_kitchen</span>
              <span>Entradas</span>
            </button>
            <button class="nav-item" [class.active]="seccionActiva === 'carta' && categoriaSeleccionada === 'Platos de Fondo'" (click)="setSeccionCarta('Platos de Fondo')">
              <span class="material-symbols-outlined">flatware</span>
              <span>Platos</span>
            </button>
            <button class="nav-item" [class.active]="seccionActiva === 'carta' && categoriaSeleccionada === 'Bebidas'" (click)="setSeccionCarta('Bebidas')">
              <span class="material-symbols-outlined">local_bar</span>
              <span>Bebidas</span>
            </button>
            <button class="nav-item" [class.active]="seccionActiva === 'carta' && categoriaSeleccionada === 'Postres'" (click)="setSeccionCarta('Postres')">
              <span class="material-symbols-outlined">bakery_dining</span>
              <span>Postres</span>
            </button>
            <button class="nav-item" [class.active]="seccionActiva === 'carta' && categoriaSeleccionada === 'Snacks'" (click)="setSeccionCarta('Snacks')">
              <span class="material-symbols-outlined">tasty</span>
              <span>Snacks</span>
            </button>
            <button class="nav-item" [class.active]="seccionActiva === 'carta' && categoriaSeleccionada === 'Licores'" (click)="setSeccionCarta('Licores')">
              <span class="material-symbols-outlined">liquor</span>
              <span>Licores</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- CONTENEDOR DERECHO (HEADER + CONTENIDO) -->
      <div class="content-container">
        <!-- HEADER SUPERIOR -->
        <header class="topbar">
          <div class="header-left">
            <span class="topbar-title">GESTIÓN DE SALA Y PEDIDOS</span>
          </div>
          <div class="header-right" style="display: flex; align-items: center;">
            <span class="user-greeting">Hola, <strong style="color: #d4af37;">{{ usuario?.nombre || 'MESERO' }}</strong></span>
            <button class="btn-logout" (click)="logout()">
              <span class="material-symbols-outlined" style="font-size: 1.1rem; vertical-align: middle;">logout</span>
              <span>Salir</span>
            </button>
          </div>
        </header>

        <!-- CONTENIDO DINÁMICO -->
        <main class="main-content">
          <!-- ALERTA SSE -->
          <div class="sse-notification-banner" *ngIf="alertaSse">
            <div class="sse-banner-content">
              <span class="material-symbols-outlined icon-alert">notifications_active</span>
              <span>{{ alertaSse }}</span>
            </div>
            <button class="btn-sse-close" (click)="alertaSse = null">Entendido</button>
          </div>

          <!-- SECCION: MESAS -->
          <div *ngIf="seccionActiva === 'mesas'">
            <div class="mesas-view-container">
              <div class="mesas-header">
                <div>
                  <span class="eyebrow">Vista Principal</span>
                  <h2 class="title">Mesas</h2>
                </div>
                
                <div class="legend-container">
                  <div class="legend-item"><span class="dot dot-libre"></span> <span>Libre</span></div>
                  <div class="legend-item"><span class="dot dot-ocupada"></span> <span>Ocupada</span></div>
                  <div class="legend-item"><span class="dot dot-reservada"></span> <span>Reservada</span></div>
                  <div class="legend-item"><span class="dot dot-inactiva"></span> <span>Inactiva</span></div>
                </div>
              </div>

              <div class="mesas-filters-row">
                <div class="mesas-filters">
                  <button class="filter-btn" [class.active]="filtroUbicacion === 'TODOS'" (click)="setFiltroUbicacion('TODOS')">TODOS</button>
                  <button class="filter-btn" [class.active]="filtroUbicacion === 'SALÓN'" (click)="setFiltroUbicacion('SALÓN')">SALÓN</button>
                  <button class="filter-btn" [class.active]="filtroUbicacion === 'TERRAZA'" (click)="setFiltroUbicacion('TERRAZA')">TERRAZA</button>
                  <button class="filter-btn" [class.active]="filtroUbicacion === 'BAR'" (click)="setFiltroUbicacion('BAR')">BAR</button>
                </div>
              </div>

              <div class="mesas-grid">
                <div *ngFor="let m of getMesasFiltradas()" 
                     class="mesa-card" 
                     [class.card-libre]="m.estadoFinal === 'LIBRE'"
                     [class.card-ocupada]="m.estadoFinal === 'OCUPADA'"
                     [class.card-reservada]="m.estadoFinal === 'RESERVADA'"
                     [class.card-inactiva]="m.estadoFinal === 'INACTIVA'"
                     (click)="seleccionarMesaCard(m)">
                  
                  <div class="mesa-card-header">
                    <span class="mesa-card-code">{{ m.codigo }}</span>
                    <span class="mesa-vip-badge" *ngIf="m.tipo === 'VIP'">VIP</span>
                  </div>
                  
                  <div class="mesa-card-body">
                    <span class="mesa-card-capacity">{{ m.capacidad }} personas · {{ m.ubicacion || 'Salón' }}</span>
                    
                    <div class="mesa-card-info" *ngIf="m.estadoFinal === 'OCUPADA'">
                      <div class="info-line text-gold">{{ m.pedidoActivo?.usuarioNombre }}</div>
                      <div class="info-line">Ingresó {{ m.pedidoActivo?.fechaHora | date:'HH:mm' }}</div>
                    </div>

                    <div class="mesa-card-info" *ngIf="m.estadoFinal === 'RESERVADA'">
                      <div class="info-line text-gold">{{ m.reservaHoy?.clienteNombre }}</div>
                      <div class="info-line">Reserva: {{ m.reservaHoy?.hora }}</div>
                    </div>

                    <div class="mesa-card-info" *ngIf="m.estadoFinal === 'INACTIVA'">
                      <div class="info-line">Fuera de servicio</div>
                    </div>
                  </div>

                  <div class="mesa-card-status">
                    {{ m.estadoFinal }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECCION: CARTA (TOMAR PEDIDO) -->
          <div *ngIf="seccionActiva === 'carta'">
            <div class="carta-layout">
              <!-- Columna Izquierda: Catálogo -->
              <div class="catalogo-section">
                <div class="catalogo-header">
                  <span class="eyebrow">Carta Restobar</span>
                  <h2 class="title">{{ categoriaSeleccionada }}</h2>
                </div>

                <div class="productos-grid">
                  <div *ngFor="let p of getProductosFiltrados()" class="producto-card">
                    <div class="producto-info">
                      <div class="producto-title">{{ p.nombre }}</div>
                      <div class="producto-desc">{{ p.descripcion }}</div>
                      <div class="producto-price-row">
                        <span class="producto-price">S/ {{ p.precio | number:'1.2-2' }}</span>
                        <button class="btn-add-item" (click)="agregarProductoAComanda(p)">
                          <span class="material-symbols-outlined" style="font-size: 1.1rem; vertical-align: middle; margin-right: 4px;">add</span>
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Columna Derecha: Comanda -->
              <div class="comanda-section">
                <div class="comanda-panel">
                  <h3 class="comanda-title">Comanda Actual</h3>
                  
                  <div style="margin-bottom: 20px;">
                    <label style="color: #64748b; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Mesa Designada</label>
                    <select [(ngModel)]="mesaSeleccionadaId" class="comanda-select-mesa" [disabled]="mesaBloqueada">
                      <option [ngValue]="null">-- Seleccione Mesa --</option>
                      <option *ngFor="let m of mesasDisponiblesParaPedido()" [value]="m.id">
                        {{ m.codigo }} ({{ m.capacidad }} pers · {{ m.estadoFinal }})
                      </option>
                    </select>
                  </div>

                  <div class="comanda-items-wrapper">
                    <div class="comanda-empty" *ngIf="itemsPedido.length === 0">
                      <span class="material-symbols-outlined" style="font-size: 2.5rem; color: #1c273a; margin-bottom: 8px;">flatware</span>
                      <p>Agrega platos o bebidas de la carta para empezar el pedido.</p>
                    </div>

                    <div class="comanda-items" *ngIf="itemsPedido.length > 0">
                      <div *ngFor="let item of itemsPedido; let idx = index" class="comanda-item">
                        <div class="item-details">
                          <div class="item-name">{{ item.producto.nombre }}</div>
                          <div class="item-price">S/ {{ item.producto.precio | number:'1.2-2' }} c/u</div>
                        </div>
                        <div class="item-quantity-controls">
                          <button class="btn-qty" (click)="ajustarCantidadDraft(idx, -1)">-</button>
                          <span class="item-qty">{{ item.cantidad }}</span>
                          <button class="btn-qty" (click)="ajustarCantidadDraft(idx, 1)">+</button>
                          <button class="btn-delete" (click)="eliminarItemDraft(idx)">
                            <span class="material-symbols-outlined" style="font-size: 1.1rem;">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="itemsPedido.length > 0" class="comanda-footer">
                    <div style="margin-bottom: 12px;">
                      <label style="color: #64748b; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 6px;">Observaciones Cocina</label>
                      <textarea [(ngModel)]="observaciones" rows="2" class="comanda-notes" placeholder="Ej: Sin sal, cremas aparte, etc."></textarea>
                    </div>

                    <div class="comanda-total-row">
                      <span>Total:</span>
                      <span class="total-price">S/ {{ totalPedido | number:'1.2-2' }}</span>
                    </div>

                    <div *ngIf="pedidoError" class="comanda-error">{{ pedidoError }}</div>

                    <div class="comanda-actions">
                      <button class="btn-premium-secundario" (click)="limpiarFormularioComanda()">Limpiar</button>
                      <button class="btn-premium-rojo" style="flex: 1.5;" (click)="enviarComandaACocina()">Enviar a Cocina</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECCION: PEDIDOS -->
          <div *ngIf="seccionActiva === 'pedidos'">
            <div class="section-box">
              <span class="section-subtitle">Principal / Órdenes</span>
              <h2 class="section-title">Pedidos Activos en Cocina</h2>

              <div *ngIf="getPedidosActivosFiltrados().length === 0" style="padding: 40px; text-align: center; color: #64748b;">
                No hay pedidos activos registrados en preparación.
              </div>

              <table *ngIf="getPedidosActivosFiltrados().length > 0" class="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mesa</th>
                    <th>Estado</th>
                    <th>Fecha/Hora</th>
                    <th>Observaciones</th>
                    <th>Total</th>
                    <th style="text-align: center;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of getPedidosActivosFiltrados()">
                    <td><strong>#00{{ p.id }}</strong></td>
                    <td><strong>Mesa {{ p.mesaNumero }}</strong></td>
                    <td>
                      <span class="estado-badge" [ngClass]="'estado-' + p.estado.toLowerCase()">
                        {{ p.estado }}
                      </span>
                    </td>
                    <td>{{ p.fechaHora | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                    <td>{{ p.observaciones || '-' }}</td>
                    <td style="font-weight: bold; color: white;">S/ {{ p.total | number:'1.2-2' }}</td>
                    <td style="text-align: center; display: flex; gap: 6px; justify-content: center;">
                      <button class="btn-xs btn-premium-secundario" (click)="verDetallePedido(p)">Detalle</button>
                      <button *ngIf="p.estado === 'LISTO'" class="btn-xs btn-premium-rojo" (click)="entregarPedido(p.id)">Entregar</button>
                      <button *ngIf="p.estado === 'PENDIENTE'" class="btn-xs btn-premium-secundario" style="border-color: #e11d48; color: #e11d48;" (click)="cancelarPedido(p.id)">Cancelar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- SECCION: LISTOS -->
          <div *ngIf="seccionActiva === 'listos'">
            <div class="section-box">
              <span class="section-subtitle">Principal / Servir</span>
              <h2 class="section-title">Pedidos Listos para Entregar (Comida Caliente)</h2>

              <div *ngIf="getPedidosListosFiltrados().length === 0" style="padding: 40px; text-align: center; color: #10b981; font-weight: bold;">
                ¡Todo servido! No hay pedidos pendientes de entrega.
              </div>

              <div *ngIf="getPedidosListosFiltrados().length > 0" class="listos-grid">
                <div *ngFor="let p of getPedidosListosFiltrados()" class="listo-card">
                  <div class="listo-card-header">
                    <span class="listo-card-title">Pedido #00{{ p.id }}</span>
                    <span class="listo-card-mesa">Mesa {{ p.mesaNumero }}</span>
                  </div>
                  <div class="listo-card-body">
                    <div class="listo-item-desc" *ngFor="let det of p.detalles">
                      • {{ det.cantidad }}x {{ det.productoNombre || 'Item' }}
                    </div>
                    <div class="listo-time">Preparado hace poco · Total: S/ {{ p.total | number:'1.2-2' }}</div>
                  </div>
                  <div class="listo-card-actions">
                    <button class="btn-premium-rojo" style="width: 100%;" (click)="entregarPedido(p.id)">
                      <span class="material-symbols-outlined" style="font-size: 1.15rem; vertical-align: middle; margin-right: 6px;">done_all</span>
                      <span>MARCAR COMO ENTREGADO</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- MODAL: DETALLES DE PEDIDO -->
    <div class="modal-overlay" *ngIf="mostrarPedidoModal">
      <div class="modal-card">
        <h3 style="font-weight: bold; margin: 0 0 6px 0; color: #e11d48; font-size: 1.2rem; text-transform: uppercase;">🛒 Detalles del Pedido #00{{ pedidoSeleccionado?.id }}</h3>
        <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 20px;">
          Cuentas de Mesa N° {{ pedidoSeleccionado?.mesaNumero }} | Mozo: {{ usuario?.nombre }}
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

    <!-- MODAL: DETALLE MESA CARD -->
    <div class="modal-overlay" *ngIf="mostrarMesaModal">
      <div class="modal-card" style="max-width: 480px;">
        <h3 style="font-weight: bold; margin: 0 0 6px 0; color: #e11d48; font-size: 1.2rem; text-transform: uppercase;">🪟 Detalle de Mesa {{ mesaSeleccionadaCard?.codigo }}</h3>
        <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 20px;">
          Capacidad: {{ mesaSeleccionadaCard?.capacidad }} personas | Ubicación: {{ mesaSeleccionadaCard?.ubicacion || 'Salón' }}
        </p>

        <div style="background-color: #060913; border: 1px solid #1c273a; padding: 15px; margin-bottom: 24px;">
          <div style="font-size: 0.85rem; color: #64748b; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">Estado Actual</div>
          <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 12px;" 
               [style.color]="mesaSeleccionadaCard?.estadoFinal === 'LIBRE' ? '#10b981' : (mesaSeleccionadaCard?.estadoFinal === 'RESERVADA' ? '#d4af37' : '#e11d48')">
            {{ mesaSeleccionadaCard?.estadoFinal }}
          </div>

          <!-- Info del Pedido Activo si está Ocupada -->
          <div *ngIf="mesaSeleccionadaCard?.estadoFinal === 'OCUPADA' && mesaSeleccionadaCard?.pedidoActivo">
            <div style="border-top: 1px dotted #1c273a; padding-top: 10px; margin-top: 10px;">
              <div style="color: white; font-weight: bold;">Cliente: {{ mesaSeleccionadaCard?.pedidoActivo.usuarioNombre }}</div>
              <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 4px;">Ingresó: {{ mesaSeleccionadaCard?.pedidoActivo.fechaHora | date:'HH:mm' }}</div>
              <div style="font-size: 0.82rem; color: #94a3b8;">Estado Cocina: {{ mesaSeleccionadaCard?.pedidoActivo.estado }}</div>
              <div style="font-size: 1rem; color: white; font-weight: 900; margin-top: 8px;">Consumo Actual: S/ {{ mesaSeleccionadaCard?.pedidoActivo.total | number:'1.2-2' }}</div>
            </div>
          </div>

          <!-- Info de la Reserva si está Reservada -->
          <div *ngIf="mesaSeleccionadaCard?.estadoFinal === 'RESERVADA' && mesaSeleccionadaCard?.reservaHoy">
            <div style="border-top: 1px dotted #1c273a; padding-top: 10px; margin-top: 10px;">
              <div style="color: white; font-weight: bold;">Reserva a nombre de: {{ mesaSeleccionadaCard?.reservaHoy.clienteNombre }}</div>
              <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 4px;">Hora de Comida: {{ mesaSeleccionadaCard?.reservaHoy.hora }}</div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn-premium-secundario" (click)="cerrarMesaModal()">Cerrar</button>
          
          <!-- Si está libre o reservada, iniciar comanda -->
          <button *ngIf="mesaSeleccionadaCard?.estadoFinal === 'LIBRE' || mesaSeleccionadaCard?.estadoFinal === 'RESERVADA'" 
                  class="btn-premium-rojo" 
                  (click)="iniciarPedidoDesdeMesa(mesaSeleccionadaCard)">
            Tomar Comanda
          </button>

          <!-- Si está ocupada, agregar más platos -->
          <button *ngIf="mesaSeleccionadaCard?.estadoFinal === 'OCUPADA'" 
                  class="btn-premium-rojo" 
                  (click)="iniciarPedidoDesdeMesa(mesaSeleccionadaCard)">
            Agregar Productos
          </button>
        </div>
      </div>
    </div>
  `
})
export class MozoDashboardComponent implements OnInit, OnDestroy {
  usuario: any;
  seccionActiva = 'mesas';
  categoriaSeleccionada = 'Entradas';
  filtroUbicacion = 'TODOS';

  // Listas de datos principales
  mesas: any[] = [];
  mesasMapeadas: any[] = [];
  productos: any[] = [];
  productosFiltrados: any[] = [];
  pedidosActivos: any[] = [];
  reservas: any[] = [];

  // Conteos para los badges de la barra lateral
  pedidosActivosCount = 0;
  listosCount = 0;

  // Draft/Comanda actual de toma de pedidos
  mesaSeleccionadaId: number | null = null;
  mesaBloqueada = false;
  observaciones = '';
  itemsPedido: any[] = [];
  totalPedido = 0;
  pedidoError = '';

  // Modales
  mostrarPedidoModal = false;
  pedidoSeleccionado: any = null;
  mostrarMesaModal = false;
  mesaSeleccionadaCard: any = null;

  // Alertas SSE
  alertaSse: string | null = null;
  private sseSub?: Subscription;

  constructor(
    private authService: AuthService,
    private genericService: CrudGenericoService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    this.cargarDatos();
    this.inicializarSse();
  }

  ngOnDestroy(): void {
    if (this.sseSub) {
      this.sseSub.unsubscribe();
    }
  }

  setSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    this.cargarDatos();
  }

  setSeccionCarta(categoria: string): void {
    this.seccionActiva = 'carta';
    this.categoriaSeleccionada = categoria;
    this.filtrarProductos();
  }

  setFiltroUbicacion(ubicacion: string): void {
    this.filtroUbicacion = ubicacion;
  }

  cargarDatos(): void {
    // Cargar mesas
    this.genericService.listar('mesas').subscribe(data => {
      this.mesas = data;
      this.mapearMesas();
    });

    // Cargar productos
    this.genericService.listar('productos').subscribe(data => {
      this.productos = data;
      this.filtrarProductos();
    });

    // Cargar pedidos
    this.pedidoService.listarTodos().subscribe(data => {
      this.pedidosActivos = data.filter(p => p.estado !== 'CANCELADO' && p.estado !== 'ENTREGADO');
      this.mapearMesas();
    });

    // Cargar reservas
    this.genericService.listar('reservas').subscribe(data => {
      this.reservas = data;
      this.mapearMesas();
    });
  }

  mapearMesas(): void {
    if (this.mesas.length === 0) return;
    const hoyStr = new Date().toISOString().substring(0, 10);

    this.mesasMapeadas = this.mesas.map(mesa => {
      // 1. Determinar el código según número y ubicación
      let codigo = '';
      const ubicacionLower = (mesa.ubicacion || '').toLowerCase();
      if (mesa.tipo === 'VIP') {
        codigo = 'M-VIP';
      } else if (ubicacionLower.includes('terraza')) {
        codigo = `T-${String(mesa.numero).padStart(2, '0')}`;
      } else if (ubicacionLower.includes('barra') || ubicacionLower.includes('bar') || mesa.tipo === 'BARRA') {
        codigo = `B-${String(mesa.numero).padStart(2, '0')}`;
      } else {
        codigo = `M-${String(mesa.numero).padStart(2, '0')}`;
      }

      // 2. Buscar si está ocupada (tiene pedido activo PENDIENTE, EN_PREPARACION, o LISTO)
      const pedidoActivo = this.pedidosActivos.find(p => p.mesaId === mesa.id && ['PENDIENTE', 'EN_PREPARACION', 'LISTO'].includes(p.estado));

      // 3. Buscar si está reservada para hoy
      const reservaHoy = this.reservas.find(r => r.mesaId === mesa.id && r.fecha === hoyStr && r.estado !== 'CANCELADA' && r.estado !== 'COMPLETADA');

      // 4. Determinar estado final
      let estadoFinal = mesa.estado;
      if (!mesa.activa) {
        estadoFinal = 'INACTIVA';
      } else if (pedidoActivo) {
        estadoFinal = 'OCUPADA';
      } else if (reservaHoy) {
        estadoFinal = 'RESERVADA';
      } else if (mesa.estado === 'OCUPADA' && !pedidoActivo) {
        // Fallback si la BD dice ocupada pero no hay pedido en el frontend
        estadoFinal = 'LIBRE';
      }

      return {
        ...mesa,
        codigo,
        estadoFinal,
        pedidoActivo: pedidoActivo ? {
          id: pedidoActivo.id,
          usuarioNombre: pedidoActivo.usuarioNombre || 'Cliente General',
          fechaHora: pedidoActivo.fechaHora,
          total: pedidoActivo.total,
          detalles: pedidoActivo.detalles || [],
          estado: pedidoActivo.estado
        } : null,
        reservaHoy: reservaHoy ? {
          clienteNombre: reservaHoy.clienteNombre,
          hora: reservaHoy.horaComida || (reservaHoy.turno === 'ALMUERZO' ? '13:00' : reservaHoy.turno === 'CENA' ? '20:00' : '17:00')
        } : null
      };
    });

    this.actualizarConteosBadges();
  }

  actualizarConteosBadges(): void {
    this.pedidosActivosCount = this.pedidosActivos.filter(p => ['PENDIENTE', 'EN_PREPARACION'].includes(p.estado)).length;
    this.listosCount = this.pedidosActivos.filter(p => p.estado === 'LISTO').length;
  }

  filtrarProductos(): void {
    this.productosFiltrados = this.productos.filter(p => {
      if (!p.disponible || !p.activo) return false;
      
      const catName = p.categoriaNombre;
      if (this.categoriaSeleccionada === 'Platos de Fondo') {
        return catName === 'Platos de Fondo' || catName === 'Fondos';
      }
      return catName === this.categoriaSeleccionada;
    });
  }

  getMesasFiltradas(): any[] {
    if (this.filtroUbicacion === 'TODOS') return this.mesasMapeadas;
    
    return this.mesasMapeadas.filter(m => {
      const code = (m.codigo || '').toUpperCase();
      if (this.filtroUbicacion === 'SALÓN') {
        return code.startsWith('M-');
      }
      if (this.filtroUbicacion === 'TERRAZA') {
        return code.startsWith('T-');
      }
      if (this.filtroUbicacion === 'BAR') {
        return code.startsWith('B-');
      }
      return false;
    });
  }

  getProductosFiltrados(): any[] {
    return this.productosFiltrados;
  }

  getPedidosActivosFiltrados(): any[] {
    return this.pedidosActivos;
  }

  getPedidosListosFiltrados(): any[] {
    return this.pedidosActivos.filter(p => p.estado === 'LISTO');
  }

  mesasDisponiblesParaPedido(): any[] {
    return this.mesasMapeadas.filter(m => m.estadoFinal !== 'INACTIVA');
  }

  // Interacción Mesa Card
  seleccionarMesaCard(mesa: any): void {
    if (mesa.estadoFinal === 'INACTIVA') {
      alert('Esta mesa está fuera de servicio temporalmente.');
      return;
    }
    this.mesaSeleccionadaCard = mesa;
    this.mostrarMesaModal = true;
  }

  cerrarMesaModal(): void {
    this.mostrarMesaModal = false;
    this.mesaSeleccionadaCard = null;
  }

  iniciarPedidoDesdeMesa(mesa: any): void {
    this.mesaSeleccionadaId = mesa.id;
    this.mesaBloqueada = true;
    this.mostrarMesaModal = false;
    this.setSeccionCarta('Entradas');
  }

  // Comanda Draft Logic
  agregarProductoAComanda(producto: any): void {
    const existe = this.itemsPedido.find(item => item.producto.id === producto.id);
    if (existe) {
      existe.cantidad += 1;
    } else {
      this.itemsPedido.push({
        producto: producto,
        cantidad: 1
      });
    }
    this.calcularTotal();
  }

  ajustarCantidadDraft(index: number, diff: number): void {
    const item = this.itemsPedido[index];
    item.cantidad += diff;
    if (item.cantidad <= 0) {
      this.eliminarItemDraft(index);
    } else {
      this.calcularTotal();
    }
  }

  eliminarItemDraft(index: number): void {
    this.itemsPedido.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.totalPedido = this.itemsPedido.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  }

  limpiarFormularioComanda(): void {
    this.mesaSeleccionadaId = null;
    this.mesaBloqueada = false;
    this.observaciones = '';
    this.itemsPedido = [];
    this.totalPedido = 0;
    this.pedidoError = '';
  }

  enviarComandaACocina(): void {
    this.pedidoError = '';

    if (!this.mesaSeleccionadaId) {
      this.pedidoError = 'Por favor, asigne una mesa a la comanda.';
      return;
    }
    if (this.itemsPedido.length === 0) {
      this.pedidoError = 'Por favor, agregue al menos un producto a la comanda.';
      return;
    }

    const pedidoDto = {
      mesaId: this.mesaSeleccionadaId,
      usuarioId: this.usuario.id,
      observaciones: this.observaciones,
      detalles: this.itemsPedido.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad
      }))
    };

    this.pedidoService.crear(pedidoDto).subscribe({
      next: () => {
        alert('Comanda registrada exitosamente y enviada a cocina.');
        this.limpiarFormularioComanda();
        this.setSeccion('mesas');
      },
      error: (err) => {
        this.pedidoError = err.error?.message || 'Error al registrar la comanda.';
      }
    });
  }

  // Monitor e interacciones en vivo
  entregarPedido(pedidoId: number): void {
    this.pedidoService.cambiarEstado(pedidoId, 'ENTREGADO').subscribe({
      next: () => {
        this.cargarDatos();
      },
      error: (err) => {
        alert(err.error?.message || 'Error al entregar el pedido.');
      }
    });
  }

  cancelarPedido(pedidoId: number): void {
    if (confirm('¿Está seguro de cancelar este pedido?')) {
      this.pedidoService.cancelar(pedidoId).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => {
          alert('Error al cancelar el pedido.');
        }
      });
    }
  }

  verDetallePedido(pedido: any): void {
    this.pedidoSeleccionado = pedido;
    this.mostrarPedidoModal = true;
  }

  cerrarPedidoModal(): void {
    this.mostrarPedidoModal = false;
    this.pedidoSeleccionado = null;
  }

  inicializarSse(): void {
    this.sseSub = this.pedidoService.obtenerNotificacionesStream().subscribe({
      next: (evento) => {
        if (evento.type === 'PEDIDO_LISTO') {
          this.alertaSse = `¡ATENCIÓN! El Pedido N° ${evento.data.id} para la Mesa N° ${evento.data.mesaNumero} está LISTO para servir.`;
          this.cargarDatos();
        } else if (evento.type === 'ESTADO_PEDIDO') {
          this.cargarDatos();
        }
      },
      error: (err) => {
        console.error('Error SSE canal mesero:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

