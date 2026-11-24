import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// Agrega el header Authorization: Bearer <token> a cada peticion
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: 'Bearer ' + token }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el token expiro o no es valido, cerramos sesion
      if (error.status === 401 && token) {
        sessionStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
