import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ResenaService } from '../../services/resena';
import { Resena } from '../../models/resena';

@Component({
  selector: 'app-resenas',
  imports: [FormsModule, DatePipe],
  templateUrl: './resenas.html',
  styleUrl: './resenas.css'
})
export class Resenas implements OnInit {
  resenas: Resena[] = [];
  nombreUsuario = '';
  mensaje = '';
  error = '';

  // Formulario
  resena: Resena = this.resenaVacia();
  idEditando: string | null = null;

  constructor(
    private resenaService: ResenaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = this.authService.getNombre();
    this.cargarResenas();
  }

  resenaVacia(): Resena {
    return { nombreRestaurante: '', calificacion: 5, fechaVisita: '', observaciones: '' };
  }

  // READ
  cargarResenas() {
    this.resenaService.listar().subscribe({
      next: (datos) => (this.resenas = datos),
      error: () => (this.error = 'Error al cargar las reseñas')
    });
  }

  guardar() {
    this.mensaje = '';
    this.error = '';

    if (!this.resena.nombreRestaurante || !this.resena.fechaVisita) {
      this.error = 'El nombre del restaurante y la fecha de visita son obligatorios';
      return;
    }

    if (this.idEditando) {
      // UPDATE
      this.resenaService.actualizar(this.idEditando, this.resena).subscribe({
        next: () => {
          this.mensaje = 'Reseña actualizada';
          this.cancelar();
          this.cargarResenas();
        },
        error: (err) => (this.error = err.error?.mensaje || 'Error al actualizar')
      });
    } else {
      // CREATE
      this.resenaService.crear(this.resena).subscribe({
        next: () => {
          this.mensaje = 'Reseña creada';
          this.cancelar();
          this.cargarResenas();
        },
        error: (err) => (this.error = err.error?.mensaje || 'Error al crear')
      });
    }
  }

  editar(r: Resena) {
    this.idEditando = r._id!;
    // Copiamos los datos para no modificar la tabla mientras se edita
    this.resena = {
      nombreRestaurante: r.nombreRestaurante,
      calificacion: r.calificacion,
      fechaVisita: r.fechaVisita.substring(0, 10), // formato yyyy-MM-dd para el input date
      observaciones: r.observaciones
    };
    window.scrollTo(0, 0);
  }

  // DELETE
  eliminar(r: Resena) {
    if (!confirm('¿Seguro que desea eliminar la reseña de "' + r.nombreRestaurante + '"?')) {
      return;
    }
    this.resenaService.eliminar(r._id!).subscribe({
      next: () => {
        this.mensaje = 'Reseña eliminada';
        this.cargarResenas();
      },
      error: (err) => (this.error = err.error?.mensaje || 'Error al eliminar')
    });
  }

  cancelar() {
    this.idEditando = null;
    this.resena = this.resenaVacia();
  }

  estrellas(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
