import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../services/auth.service';
import { ReservaService } from '../../services/reserva.service';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatTableModule
  ],
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.css']
})
export class ClienteDashboardComponent implements OnInit {
  usuario: any;
  reservas: any[] = [];

  constructor(
    private authService: AuthService,
    private reservaService: ReservaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservaService.listarTodas().subscribe({
      next: (data) => {
        // Filtrar reservas que pertenezcan al usuario logueado
        this.reservas = data.filter(r => r.usuarioRegistroId === this.usuario.id);
      },
      error: (err) => console.error('Error al cargar historial de reservas', err)
    });
  }

  ampliarTolerancia(reservaId: number): void {
    this.reservaService.ampliarMinutos(reservaId, 15).subscribe({
      next: () => {
        alert('Tolerancia ampliada en 15 minutos con éxito.');
        this.cargarReservas();
      },
      error: (err) => alert('No se pudo ampliar la tolerancia: ' + err.error?.message)
    });
  }

  cancelarReserva(reservaId: number): void {
    if (confirm('¿Está seguro de cancelar esta reserva? Se liberará la mesa y se anularán los comprobantes.')) {
      this.reservaService.cambiarEstado(reservaId, 'CANCELADA').subscribe({
        next: () => {
          this.cargarReservas();
        },
        error: (err) => alert('Error al cancelar la reserva: ' + err.error?.message)
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
