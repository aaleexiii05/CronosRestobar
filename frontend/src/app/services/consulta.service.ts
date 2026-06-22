import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  private apiUrl = '/api/consultas';

  constructor(private http: HttpClient) {}

  consultarReniec(dni: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reniec/${dni}`);
  }

  consultarSunat(ruc: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sunat/${ruc}`);
  }
}
