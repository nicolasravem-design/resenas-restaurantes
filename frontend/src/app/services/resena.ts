import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Resena } from '../models/resena';

// El token se agrega automaticamente con el interceptor
@Injectable({
  providedIn: 'root'
})
export class ResenaService {
  private url = environment.apiUrl + '/resenas';

  constructor(private http: HttpClient) {}

  listar(): Observable<Resena[]> {
    return this.http.get<Resena[]>(this.url);
  }

  crear(resena: Resena): Observable<Resena> {
    return this.http.post<Resena>(this.url, resena);
  }

  actualizar(id: string, resena: Resena): Observable<Resena> {
    return this.http.put<Resena>(this.url + '/' + id, resena);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(this.url + '/' + id);
  }
}
