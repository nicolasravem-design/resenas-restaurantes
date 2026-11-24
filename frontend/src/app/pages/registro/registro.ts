import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  nombre = '';
  correo = '';
  password = '';
  error = '';
  exito = '';

  constructor(private authService: AuthService, private router: Router) {}

  registrar() {
    this.error = '';
    this.exito = '';

    if (!this.nombre || !this.correo || !this.password) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.authService.registro(this.nombre, this.correo, this.password).subscribe({
      next: () => {
        this.exito = 'Usuario registrado. Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'No se pudo conectar con el servidor';
      }
    });
  }
}
