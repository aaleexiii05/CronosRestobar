import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  login(credenciales: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('cronos_token', res.token);
          localStorage.setItem('cronos_user', JSON.stringify(res.usuario));
        }
      })
    );
  }

  registrar(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, usuario);
  }

  logout(): void {
    localStorage.removeItem('cronos_token');
    localStorage.removeItem('cronos_user');
  }

  getToken(): string | null {
    return localStorage.getItem('cronos_token');
  }

  getUsuario(): any {
    const user = localStorage.getItem('cronos_user');
    return user ? JSON.parse(user) : null;
  }

  getRol(): string | null {
    const user = this.getUsuario();
    return user ? user.rol : null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}
