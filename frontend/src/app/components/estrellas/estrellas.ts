import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-estrellas',
  templateUrl: './estrellas.html',
  styleUrl: './estrellas.css'
})
export class Estrellas {
  @Input() valor = 0;
  @Input() editable = false; // si es true el usuario puede hacer clic para calificar
  @Output() valorChange = new EventEmitter<number>();

  numeros = [1, 2, 3, 4, 5];
  hover = 0;
  textos = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

  seleccionar(n: number) {
    if (!this.editable) return;
    this.valor = n;
    this.valorChange.emit(n);
  }

  // Estrella encendida si esta dentro del valor (o del hover cuando se edita)
  activa(n: number): boolean {
    const actual = this.editable && this.hover ? this.hover : this.valor;
    return n <= actual;
  }
}
