import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  correo = '';
  password = '';
  verPassword = false;
  error = '';
  cargando = false;

  constructor(private authService: AuthService, private router: Router) {
    // Si ya hay sesion iniciada, va directo a las reseñas
    if (this.authService.estaLogueado()) {
      this.router.navigate(['/resenas']);
    }
  }

  iniciarSesion() {
    this.error = '';
    if (!this.correo.trim() || !this.password) {
      this.error = 'Ingresa tu correo y tu contraseña';
      return;
    }

    this.cargando = true;
    this.authService.login(this.correo.trim(), this.password).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/resenas']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'No se pudo conectar con el servidor';
      }
    });
  }
}
