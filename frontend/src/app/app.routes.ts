import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { MenuComponent } from './components/menu/menu.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ClienteDashboardComponent } from './components/cliente-dashboard/cliente-dashboard.component';
import { MozoDashboardComponent } from './components/mozo-dashboard/mozo-dashboard.component';
import { CocineroDashboardComponent } from './components/cocinero-dashboard/cocinero-dashboard.component';
import { CajeroDashboardComponent } from './components/cajero-dashboard/cajero-dashboard.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'checkout', 
    component: CheckoutComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'cliente', 
    component: ClienteDashboardComponent, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['CLIENTE'] } 
  },
  { 
    path: 'mozo', 
    component: MozoDashboardComponent, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['MOZO'] } 
  },
  { 
    path: 'cocinero', 
    component: CocineroDashboardComponent, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['COCINERO'] } 
  },
  { 
    path: 'cajero', 
    component: CajeroDashboardComponent, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['CAJERO'] } 
  },
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['ADMIN'] } 
  },
  { path: '**', redirectTo: '' }
];
