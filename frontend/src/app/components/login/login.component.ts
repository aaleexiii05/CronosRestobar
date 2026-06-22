import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Por favor complete todos los campos.';
      return;
    }

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        const rol = res.usuario.rol;
        this.redirectByRol(rol);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error de inicio de sesión. Verifique sus credenciales.';
      }
    });
  }

  private redirectByRol(rol: string): void {
    switch (rol) {
      case 'CLIENTE':
        const local = localStorage.getItem('temp_cart');
        const cart = local ? JSON.parse(local) : [];
        if (cart.length > 0) {
          this.router.navigate(['/checkout']);
        } else {
          this.router.navigate(['/']);
        }
        break;
      case 'MOZO':
        this.router.navigate(['/mozo']);
        break;
      case 'COCINERO':
        this.router.navigate(['/cocinero']);
        break;
      case 'CAJERO':
        this.router.navigate(['/cajero']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }
}
