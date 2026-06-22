import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';
import { FacturaService } from '../../services/factura.service';
import { ConsultaService } from '../../services/consulta.service';

@Component({
  selector: 'app-cajero-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule
  ],
  template: `
    <div style="padding: 20px;">
      <!-- CABECERA -->
      <mat-card style="margin-bottom: 20px; padding: 16px; background-color: #ff9800; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2>Bienvenido, {{ usuario?.nombre }} (Cajero)</h2>
            <p>Email: {{ usuario?.email }} | Rol: {{ usuario?.rol }}</p>
          </div>
          <button mat-flat-button color="warn" (click)="logout()">Cerrar Sesión</button>
        </div>
      </mat-card>

      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <!-- TABLA PEDIDOS PENDIENTES DE COBRO -->
        <mat-card style="flex: 1.5; min-width: 400px; padding: 20px;">
          <h3>Pedidos Pendientes de Cobro</h3>
          <div *ngIf="pedidosPendientes.length === 0" style="padding: 20px; text-align: center; color: gray;">
            No hay pedidos pendientes de cobro en este momento.
          </div>

          <table mat-table [dataSource]="pedidosPendientes" class="mat-elevation-z1" style="width: 100%;" *ngIf="pedidosPendientes.length > 0">
            <ng-container matColumnDef="id">
              <th mat-header-cell *header-cellDef> ID </th>
              <td mat-cell *matCellDef="let p"> {{ p.id }} </td>
            </ng-container>

            <ng-container matColumnDef="mesa">
              <th mat-header-cell *header-cellDef> Mesa </th>
              <td mat-cell *matCellDef="let p"> N° {{ p.mesaNumero }} </td>
            </ng-container>

            <ng-container matColumnDef="total">
              <th mat-header-cell *header-cellDef> Total </th>
              <td mat-cell *matCellDef="let p"> S/ {{ p.total | number:'1.2-2' }} </td>
            </ng-container>

            <ng-container matColumnDef="estado">
              <th mat-header-cell *header-cellDef> Estado </th>
              <td mat-cell *matCellDef="let p"> {{ p.estado }} </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *header-cellDef> Acción </th>
              <td mat-cell *matCellDef="let p">
                <button mat-raised-button color="primary" (click)="seleccionarPedido(p)">
                  Cobrar
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnasPedidos"></tr>
            <tr mat-row *matRowDef="let row; columns: columnasPedidos;"></tr>
          </table>
        </mat-card>

        <!-- FORMULARIO DE COBRO Y EMISIÓN DE COMPROBANTE -->
        <mat-card style="flex: 1; min-width: 320px; padding: 20px;" *ngIf="pedidoSeleccionado">
          <h3>Cobrar Pedido N° {{ pedidoSeleccionado.id }} (Mesa {{ pedidoSeleccionado.mesaNumero }})</h3>
          <h2 style="color: #ff9800; font-size: 2em; text-align: center; margin-bottom: 20px;">
            Total: S/ {{ pedidoSeleccionado.total | number:'1.2-2' }}
          </h2>

          <form (ngSubmit)="procesarPago()">
            <!-- Tipo Comprobante -->
            <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 12px;">
              <mat-label>Tipo de Comprobante</mat-label>
              <mat-select [(ngModel)]="tipoComprobante" name="tipoComprobante" required>
                <mat-option value="BOLETA">Boleta de Venta</mat-option>
                <mat-option value="FACTURA">Factura Comercial</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Datos Boleta -->
            <div *ngIf="tipoComprobante === 'BOLETA'">
              <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 12px;">
                <mat-label>Nombre del Cliente (Opcional)</mat-label>
                <input matInput type="text" [(ngModel)]="clienteNombre" name="clienteNombre">
              </mat-form-field>
              <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 12px;">
                <mat-label>DNI del Cliente (Opcional)</mat-label>
                <input matInput type="text" [(ngModel)]="clienteDocumento" name="clienteDocumento" maxlength="8">
              </mat-form-field>
            </div>

            <!-- Datos Factura -->
            <div *ngIf="tipoComprobante === 'FACTURA'">
              <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 12px;">
                <mat-form-field appearance="fill" style="flex: 1; margin-bottom: 0;">
                  <mat-label>RUC Empresa</mat-label>
                  <input matInput type="text" [(ngModel)]="clienteRuc" name="clienteRuc" maxlength="11" required>
                </mat-form-field>
                <button mat-raised-button color="accent" type="button" style="height: 56px;" (click)="buscarRuc()">
                  SUNAT
                </button>
              </div>
              <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 12px;">
                <mat-label>Razón Social (Autocompletado)</mat-label>
                <input matInput type="text" [(ngModel)]="razonSocial" name="razonSocial" readonly required>
              </mat-form-field>
            </div>

            <!-- Método Pago -->
            <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 12px;">
              <mat-label>Método de Pago</mat-label>
              <mat-select [(ngModel)]="metodoPago" name="metodoPago" required>
                <mat-option value="EFECTIVO">Efectivo</mat-option>
                <mat-option value="MERCADO_PAGO">Mercado Pago</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Lógica Efectivo -->
            <div *ngIf="metodoPago === 'EFECTIVO'">
              <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 12px;">
                <mat-label>Monto Recibido</mat-label>
                <input matInput type="number" [(ngModel)]="montoRecibido" name="montoRecibido" step="0.1" (input)="calcularVuelto()" required>
              </mat-form-field>
              <div *ngIf="vuelto >= 0" style="background-color: #e8f5e9; color: #2e7d32; font-size: 1.2em; font-weight: bold; text-align: center; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
                Vuelto: S/ {{ vuelto | number:'1.2-2' }}
              </div>
              <div *ngIf="vuelto < 0" style="color: red; margin-bottom: 12px;">
                El monto recibido es menor al total del pedido.
              </div>
            </div>

            <!-- Lógica Mercado Pago -->
            <div *ngIf="metodoPago === 'MERCADO_PAGO'">
              <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 12px;">
                <mat-label>ID de Transacción</mat-label>
                <input matInput type="text" [(ngModel)]="transaccionId" name="transaccionId" required>
              </mat-form-field>
            </div>

            <!-- Botones -->
            <div *ngIf="error" style="color: red; margin-bottom: 12px; text-align: center;">
              {{ error }}
            </div>

            <div style="display: flex; gap: 8px;">
              <button mat-stroked-button color="primary" style="flex: 1;" type="button" (click)="cancelarSeleccion()">
                Cancelar
              </button>
              <button mat-raised-button color="accent" style="flex: 1.5;" type="submit" [disabled]="metodoPago === 'EFECTIVO' && vuelto < 0">
                Emitir
              </button>
            </div>
          </form>
        </mat-card>
      </div>

      <!-- COMPROBANTE EMITIDO MODAL/ALERT POPUP -->
      <mat-card *ngIf="comprobanteEmitido" style="margin-top: 20px; padding: 20px; border: 2px dashed #ff9800; background-color: #fffde7; max-width: 500px; margin-left: auto; margin-right: auto;">
        <h3 style="text-align: center; color: #ff9800; font-weight: bold; margin-bottom: 0;">CRONOS RESTOBAR</h3>
        <p style="text-align: center; margin: 0; font-size: 0.85em;">Av. Restauración 123 - Lima</p>
        <hr style="border-top: 1px dashed #ccc; margin: 12px 0;">
        
        <div style="font-size: 0.95em;">
          <strong>COMPROBANTE:</strong> {{ comprobanteEmitido.numeroComprobante }} <br>
          <strong>FECHA EMISIÓN:</strong> {{ comprobanteEmitido.fechaEmision | date:'dd/MM/yyyy HH:mm:ss' }} <br>
          <strong>CLIENTE:</strong> {{ comprobanteEmitido.clienteNombre }} <br>
          <span *ngIf="comprobanteEmitido.clienteRuc"><strong>RUC:</strong> {{ comprobanteEmitido.clienteRuc }}<br></span>
          <span *ngIf="comprobanteEmitido.clienteDocumento"><strong>DNI/Doc:</strong> {{ comprobanteEmitido.clienteDocumento }}<br></span>
          <strong>MÉTODO PAGO:</strong> {{ comprobanteEmitido.metodoPago }} <br>
          <span *ngIf="comprobanteEmitido.transaccionId"><strong>TRANS. ID:</strong> {{ comprobanteEmitido.transaccionId }}<br></span>
        </div>
        <hr style="border-top: 1px dashed #ccc; margin: 12px 0;">

        <!-- Detalles del comprobante -->
        <table style="width: 100%; font-size: 0.9em; text-align: left;">
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Descripción</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let det of comprobanteEmitido.detalles">
              <td>{{ det.cantidad }}</td>
              <td>{{ det.descripcion }}</td>
              <td style="text-align: right;">S/ {{ det.subtotal | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>
        
        <hr style="border-top: 1px dashed #ccc; margin: 12px 0;">
        <div style="text-align: right; font-size: 0.95em;">
          <div>Subtotal: S/ {{ comprobanteEmitido.subtotal | number:'1.2-2' }}</div>
          <div>IGV (18%): S/ {{ comprobanteEmitido.igv | number:'1.2-2' }}</div>
          <div style="font-weight: bold; font-size: 1.1em; margin-top: 4px;">TOTAL: S/ {{ comprobanteEmitido.total | number:'1.2-2' }}</div>
        </div>

        <div *ngIf="comprobanteEmitido.metodoPago === 'EFECTIVO'" style="text-align: right; font-size: 0.9em; margin-top: 8px; color: #555;">
          <div>Monto Recibido: S/ {{ comprobanteEmitido.montoRecibido | number:'1.2-2' }}</div>
          <div style="font-weight: bold; color: green;">Vuelto: S/ {{ comprobanteEmitido.vuelto | number:'1.2-2' }}</div>
        </div>

        <hr style="border-top: 1px dashed #ccc; margin: 12px 0;">
        <p style="text-align: center; margin: 0; font-size: 0.9em; font-style: italic;">¡Gracias por su preferencia!</p>
        <div style="text-align: center; margin-top: 16px;">
          <button mat-raised-button color="primary" (click)="comprobanteEmitido = null">Cerrar Recibo</button>
        </div>
      </mat-card>
    </div>
  `
})
export class CajeroDashboardComponent implements OnInit {
  usuario: any;
  pedidosPendientes: any[] = [];
  columnasPedidos = ['id', 'mesa', 'total', 'estado', 'acciones'];

  // Formulario cobro
  pedidoSeleccionado: any = null;
  tipoComprobante = 'BOLETA';
  clienteNombre = '';
  clienteDocumento = '';
  clienteRuc = '';
  razonSocial = '';
  metodoPago = 'EFECTIVO';
  montoRecibido: number | null = null;
  vuelto = 0;
  transaccionId = '';

  error = '';
  comprobanteEmitido: any = null;

  constructor(
    private authService: AuthService,
    private pedidoService: PedidoService,
    private facturaService: FacturaService,
    private consultaService: ConsultaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    this.cargarPedidosPendientes();
  }

  cargarPedidosPendientes(): void {
    this.pedidoService.listarPendientesDeCobro().subscribe({
      next: (data) => this.pedidosPendientes = data,
      error: (err) => console.error('Error al cargar pedidos pendientes de cobro', err)
    });
  }

  seleccionarPedido(pedido: any): void {
    this.comprobanteEmitido = null;
    this.pedidoSeleccionado = pedido;
    this.tipoComprobante = 'BOLETA';
    this.clienteNombre = '';
    this.clienteDocumento = '';
    this.clienteRuc = '';
    this.razonSocial = '';
    this.metodoPago = 'EFECTIVO';
    this.montoRecibido = null;
    this.vuelto = 0;
    this.transaccionId = '';
    this.error = '';
  }

  buscarRuc(): void {
    this.error = '';
    if (!this.clienteRuc || this.clienteRuc.length !== 11) {
      this.error = 'El RUC debe tener 11 dígitos.';
      return;
    }
    this.consultaService.consultarSunat(this.clienteRuc).subscribe({
      next: (res) => {
        this.razonSocial = res.razonSocial;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al conectar con la consulta de RUC.';
      }
    });
  }

  calcularVuelto(): void {
    if (this.montoRecibido && this.pedidoSeleccionado) {
      this.vuelto = this.montoRecibido - this.pedidoSeleccionado.total;
    } else {
      this.vuelto = -1;
    }
  }

  cancelarSeleccion(): void {
    this.pedidoSeleccionado = null;
  }

  procesarPago(): void {
    this.error = '';

    if (!this.pedidoSeleccionado) {
      return;
    }

    const facturaDto: any = {
      pedidoId: this.pedidoSeleccionado.id,
      usuarioId: this.usuario.id,
      tipoComprobante: this.tipoComprobante,
      metodoPago: this.metodoPago
    };

    if (this.tipoComprobante === 'BOLETA') {
      facturaDto.clienteNombre = this.clienteNombre;
      facturaDto.clienteDocumento = this.clienteDocumento;
    } else if (this.tipoComprobante === 'FACTURA') {
      facturaDto.clienteRuc = this.clienteRuc;
      facturaDto.razonSocial = this.razonSocial;
    }

    if (this.metodoPago === 'EFECTIVO') {
      facturaDto.montoRecibido = this.montoRecibido;
    } else if (this.metodoPago === 'MERCADO_PAGO') {
      facturaDto.transaccionId = this.transaccionId;
    }

    this.facturaService.emitir(facturaDto).subscribe({
      next: (res) => {
        this.comprobanteEmitido = res;
        this.pedidoSeleccionado = null;
        this.cargarPedidosPendientes();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al emitir el comprobante de pago.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
