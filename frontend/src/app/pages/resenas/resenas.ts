import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ResenaService } from '../../services/resena';
import { Resena } from '../../models/resena';
import { Estrellas } from '../../components/estrellas/estrellas';

@Component({
  selector: 'app-resenas',
  imports: [FormsModule, DatePipe, DecimalPipe, Estrellas],
  templateUrl: './resenas.html',
  styleUrl: './resenas.css'
})
export class Resenas implements OnInit, OnDestroy {
  resenas: Resena[] = [];
  nombreUsuario = '';
  cargando = true;

  // Filtros
  busqueda = '';
  filtroCalificacion = 0; // 0 = todas
  orden = 'recientes';

  // Formulario (modal)
  mostrarFormulario = false;
  resena: Resena = this.resenaVacia();
  idEditando: string | null = null;
  errorFormulario = '';
  intentoGuardar = false;
  guardando = false;
  hoy = new Date().toISOString().substring(0, 10); // para no permitir fechas futuras

  // Confirmacion para eliminar
  resenaAEliminar: Resena | null = null;
  eliminando = false;

  // Mensaje tipo "toast"
  toast = '';
  toastError = false;
  private temporizadorToast: any;

  constructor(
    private resenaService: ResenaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = this.authService.getNombre();
    this.cargarResenas();
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizadorToast);
  }

  resenaVacia(): Resena {
    return { nombreRestaurante: '', calificacion: 0, fechaVisita: '', observaciones: '' };
  }

  // ---------- READ ----------
  cargarResenas() {
    this.cargando = true;
    this.resenaService.listar().subscribe({
      next: (datos) => {
        this.resenas = datos;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.mostrarToast('No se pudieron cargar las reseñas', true);
      }
    });
  }

  // Lista que se muestra en pantalla (aplicando busqueda, filtro y orden)
  get resenasFiltradas(): Resena[] {
    const texto = this.busqueda.trim().toLowerCase();

    const lista = this.resenas.filter((r) => {
      const coincideTexto =
        r.nombreRestaurante.toLowerCase().includes(texto) ||
        (r.observaciones || '').toLowerCase().includes(texto);
      const coincideNota = this.filtroCalificacion == 0 || r.calificacion == this.filtroCalificacion;
      return coincideTexto && coincideNota;
    });

    switch (this.orden) {
      case 'antiguas':
        lista.sort((a, b) => a.fechaVisita.localeCompare(b.fechaVisita));
        break;
      case 'mejores':
        lista.sort((a, b) => b.calificacion - a.calificacion);
        break;
      case 'peores':
        lista.sort((a, b) => a.calificacion - b.calificacion);
        break;
      case 'nombre':
        lista.sort((a, b) => a.nombreRestaurante.localeCompare(b.nombreRestaurante));
        break;
      default: // recientes
        lista.sort((a, b) => b.fechaVisita.localeCompare(a.fechaVisita));
    }
    return lista;
  }

  // ---------- Estadisticas ----------
  get promedio(): number {
    if (this.resenas.length === 0) return 0;
    const suma = this.resenas.reduce((total, r) => total + r.calificacion, 0);
    return suma / this.resenas.length;
  }

  get favorito(): Resena | null {
    if (this.resenas.length === 0) return null;
    return [...this.resenas].sort((a, b) => b.calificacion - a.calificacion)[0];
  }

  get ultimaVisita(): Resena | null {
    if (this.resenas.length === 0) return null;
    return [...this.resenas].sort((a, b) => b.fechaVisita.localeCompare(a.fechaVisita))[0];
  }

  hayFiltros(): boolean {
    return this.busqueda.trim() !== '' || this.filtroCalificacion != 0;
  }

  limpiarFiltros() {
    this.busqueda = '';
    this.filtroCalificacion = 0;
  }

  // ---------- Formulario ----------
  nuevaResena() {
    this.idEditando = null;
    this.resena = this.resenaVacia();
    this.abrirFormulario();
  }

  editar(r: Resena) {
    this.idEditando = r._id!;
    // Copiamos los datos para no modificar la tarjeta mientras se edita
    this.resena = {
      nombreRestaurante: r.nombreRestaurante,
      calificacion: r.calificacion,
      fechaVisita: r.fechaVisita.substring(0, 10), // formato yyyy-MM-dd para el input date
      observaciones: r.observaciones || ''
    };
    this.abrirFormulario();
  }

  abrirFormulario() {
    this.errorFormulario = '';
    this.intentoGuardar = false;
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    if (this.guardando) return;
    this.mostrarFormulario = false;
  }

  // Devuelve el mensaje de error de cada campo (se muestra despues de intentar guardar)
  errorCampo(campo: string): string {
    if (!this.intentoGuardar) return '';
    const r = this.resena;
    if (campo === 'nombre' && !r.nombreRestaurante.trim()) return 'Escribe el nombre del restaurante';
    if (campo === 'calificacion' && !r.calificacion) return 'Selecciona una calificación';
    if (campo === 'fecha') {
      if (!r.fechaVisita) return 'Selecciona la fecha de tu visita';
      if (r.fechaVisita > this.hoy) return 'La fecha no puede ser futura';
    }
    return '';
  }

  formularioValido(): boolean {
    return !this.errorCampo('nombre') && !this.errorCampo('calificacion') && !this.errorCampo('fecha');
  }

  guardar() {
    this.intentoGuardar = true;
    this.errorFormulario = '';
    if (!this.formularioValido()) return;

    const datos: Resena = {
      nombreRestaurante: this.resena.nombreRestaurante.trim(),
      calificacion: this.resena.calificacion,
      fechaVisita: this.resena.fechaVisita,
      observaciones: this.resena.observaciones.trim()
    };

    this.guardando = true;
    const peticion = this.idEditando
      ? this.resenaService.actualizar(this.idEditando, datos) // UPDATE
      : this.resenaService.crear(datos); // CREATE

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.mostrarToast(this.idEditando ? 'Reseña actualizada correctamente' : 'Reseña creada correctamente');
        this.cargarResenas();
      },
      error: (err) => {
        this.guardando = false;
        this.errorFormulario = err.error?.mensaje || 'No se pudo guardar la reseña';
      }
    });
  }

  // ---------- DELETE ----------
  pedirEliminar(r: Resena) {
    this.resenaAEliminar = r;
  }

  cancelarEliminar() {
    if (this.eliminando) return;
    this.resenaAEliminar = null;
  }

  confirmarEliminar() {
    if (!this.resenaAEliminar) return;
    this.eliminando = true;
    this.resenaService.eliminar(this.resenaAEliminar._id!).subscribe({
      next: () => {
        this.eliminando = false;
        this.resenaAEliminar = null;
        this.mostrarToast('Reseña eliminada');
        this.cargarResenas();
      },
      error: (err) => {
        this.eliminando = false;
        this.resenaAEliminar = null;
        this.mostrarToast(err.error?.mensaje || 'No se pudo eliminar la reseña', true);
      }
    });
  }

  // Cerrar los modales con la tecla Escape
  @HostListener('document:keydown.escape')
  alPresionarEscape() {
    this.cerrarFormulario();
    this.cancelarEliminar();
  }

  mostrarToast(mensaje: string, esError = false) {
    this.toast = mensaje;
    this.toastError = esError;
    clearTimeout(this.temporizadorToast);
    this.temporizadorToast = setTimeout(() => (this.toast = ''), 3000);
  }

  inicial(): string {
    return this.nombreUsuario ? this.nombreUsuario.charAt(0).toUpperCase() : '?';
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
