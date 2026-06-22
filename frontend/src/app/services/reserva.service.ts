import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private baseReservasUrl = '/api/reservas';
  private baseMesasUrl = '/api/mesas';

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.baseReservasUrl);
  }

  listarPorFecha(fecha: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseReservasUrl}/fecha/${fecha}`);
  }

  listarPorEstado(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseReservasUrl}/estado/${estado}`);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseReservasUrl}/${id}`);
  }

  crear(reservaDto: any): Observable<any> {
    return this.http.post<any>(this.baseReservasUrl, reservaDto);
  }

  cambiarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.baseReservasUrl}/${id}/estado`, null, {
      params: { estado }
    });
  }

  ampliarMinutos(id: number, minutos: number): Observable<any> {
    return this.http.patch<any>(`${this.baseReservasUrl}/${id}/ampliar-minutos`, null, {
      params: { minutos: minutos.toString() }
    });
  }

  listarMesasDisponibles(fecha: string, turno: string, numPersonas?: number): Observable<any[]> {
    const params: any = { fecha, turno };
    if (numPersonas) {
      params.numPersonas = numPersonas.toString();
    }
    return this.http.get<any[]>(`${this.baseMesasUrl}/disponibles`, { params });
  }
}
