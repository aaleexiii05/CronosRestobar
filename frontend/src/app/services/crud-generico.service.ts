import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudGenericoService {
  constructor(private http: HttpClient) {}

  listar(endpoint: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/${endpoint}`);
  }

  buscarPorId(endpoint: string, id: number): Observable<any> {
    return this.http.get<any>(`/api/${endpoint}/${id}`);
  }

  crear(endpoint: string, item: any): Observable<any> {
    return this.http.post<any>(`/api/${endpoint}`, item);
  }

  actualizar(endpoint: string, id: number, item: any): Observable<any> {
    return this.http.put<any>(`/api/${endpoint}/${id}`, item);
  }

  eliminar(endpoint: string, id: number): Observable<any> {
    return this.http.delete<any>(`/api/${endpoint}/${id}`);
  }
}
