import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html'
})
export class Registro implements OnDestroy {
  nombre = '';
  correo = '';
  password = '';
  confirmar = '';
  verPassword = false;
  error = '';
  exito = '';
  cargando = false;
  private temporizador: any;

  constructor(private authService: AuthService, private router: Router) {}

  registrar() {
    this.error = '';
    this.exito = '';

    if (!this.nombre.trim() || !this.correo.trim() || !this.password) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo.trim())) {
      this.error = 'El correo no es válido';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    if (this.password !== this.confirmar) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.cargando = true;
    this.authService.registro(this.nombre.trim(), this.correo.trim(), this.password).subscribe({
      next: () => {
        this.cargando = false;
        this.exito = '¡Cuenta creada! Te llevamos al inicio de sesión...';
        this.temporizador = setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'No se pudo conectar con el servidor';
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }
}
