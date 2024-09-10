import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css'],
})
export class PaginatorComponent {

  @Input() data: number = 0;  // El número total de elementos
  @Input() isResponsive: boolean = false; // Variable para el diseño responsive

  public currentPage = 1;
  public itemsPerPage = 5; // Puedes ajustar la cantidad de elementos por página
  public get totalPages(): number {
    return Math.ceil(this.data / this.itemsPerPage);
  }

  // Generar el rango de datos paginados de acuerdo con el número total de elementos
  get paginatedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(startIndex + this.itemsPerPage - 1, this.data);
    return { start: startIndex, end: endIndex };
  }

  // Cambiar página
  changePage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
