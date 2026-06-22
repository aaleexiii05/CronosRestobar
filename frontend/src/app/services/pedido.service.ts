import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = '/api/pedidos';

  constructor(private http: HttpClient, private zone: NgZone) {}

  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  listarPorEstado(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estado/${estado}`);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crear(pedidoDto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pedidoDto);
  }

  cambiarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/estado`, null, {
      params: { estado }
    });
  }

  cancelar(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancelar`, null);
  }

  marcarListo(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/listo`, null);
  }

  listarPendientesDeCobro(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pendientes-cobro`);
  }

  obtenerNotificacionesStream(): Observable<any> {
    return new Observable<any>(observer => {
      const eventSource = new EventSource('/api/pedidos/notificaciones');

      eventSource.addEventListener('PEDIDO_LISTO', (event: any) => {
        this.zone.run(() => observer.next({ type: 'PEDIDO_LISTO', data: JSON.parse(event.data) }));
      });

      eventSource.addEventListener('ESTADO_PEDIDO', (event: any) => {
        this.zone.run(() => observer.next({ type: 'ESTADO_PEDIDO', data: JSON.parse(event.data) }));
      });

      eventSource.onerror = error => {
        this.zone.run(() => observer.error(error));
      };

      return () => {
        eventSource.close();
      };
    });
  }
}
