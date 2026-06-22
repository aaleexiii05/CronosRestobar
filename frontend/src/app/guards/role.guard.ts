import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesEsperados = route.data['roles'] as Array<string>;
  const rolUsuario = authService.getRol();

  if (authService.isLoggedIn() && rolUsuario && rolesEsperados.includes(rolUsuario)) {
    return true;
  }

  // Si no está autorizado, redirigir al login
  router.navigate(['/login']);
  return false;
};
