import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private apiUrl = '/api/facturas';

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  buscarPorNumero(numero: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/comprobante/${numero}`);
  }

  emitir(facturaDto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, facturaDto);
  }

  crearPreferencia(pedidoId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear-preferencia`, { pedidoId });
  }

  anular(id: number, motivo?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/anular`, { motivo });
  }
}
