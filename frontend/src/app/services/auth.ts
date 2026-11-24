import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {}

  registro(nombre: string, correo: string, password: string): Observable<any> {
    return this.http.post(this.url + '/registro', { nombre, correo, password });
  }

  login(correo: string, password: string): Observable<any> {
    return this.http.post<any>(this.url + '/login', { correo, password }).pipe(
      tap((respuesta) => {
        // Guardamos el token de la sesion en el session storage
        sessionStorage.setItem('token', respuesta.token);
        sessionStorage.setItem('nombre', respuesta.usuario.nombre);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('nombre');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getNombre(): string {
    return sessionStorage.getItem('nombre') || '';
  }

  estaLogueado(): boolean {
    return this.getToken() != null;
  }
}
