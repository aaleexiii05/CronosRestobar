import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { ConsultaService } from '../../services/consulta.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  dni = '';
  nombres = '';
  apellidoPaterno = '';
  apellidoMaterno = '';
  email = '';
  telefono = '';
  password = '';
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private consultaService: ConsultaService,
    private router: Router
  ) {}

  buscarDni(): void {
    this.error = '';
    this.success = '';
    if (!this.dni || this.dni.length !== 8) {
      this.error = 'Por favor ingrese un DNI válido de 8 dígitos.';
      return;
    }

    this.consultaService.consultarReniec(this.dni).subscribe({
      next: (res) => {
        this.nombres = res.nombres;
        this.apellidoPaterno = res.apellidoPaterno;
        this.apellidoMaterno = res.apellidoMaterno;
        this.success = 'Datos recuperados exitosamente desde RENIEC.';
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al conectar con la consulta de DNI.';
      }
    });
  }

  onRegister(): void {
    this.error = '';
    this.success = '';
    
    if (!this.dni || !this.nombres || !this.email || !this.telefono || !this.password) {
      this.error = 'Por favor, complete todos los campos obligatorios.';
      return;
    }

    const payload = {
      dni: this.dni,
      nombres: this.nombres,
      apellidoPaterno: this.apellidoPaterno,
      apellidoMaterno: this.apellidoMaterno,
      email: this.email,
      telefono: this.telefono,
      password: this.password,
      rol: 'CLIENTE'
    };

    this.authService.registrar(payload).subscribe({
      next: () => {
        this.success = 'Cuenta creada con éxito. Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al registrar la cuenta. Verifique los datos.';
      }
    });
  }
}
