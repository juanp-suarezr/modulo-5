import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css'
})
export class PaginatorComponent implements OnInit{
  @Input() totalPages: number = 10;
  @Input() initialPage: number = 1;
  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();

  currentPage: number = 1;
  pagesToDisplay: number[] = [];

  ngOnInit() {
    this.currentPage = this.initialPage;
    this.generatePagesToDisplay();
  }

  generatePagesToDisplay() {
    const beforePages = this.currentPage > 2 ? this.currentPage - 1 : 1;
    const afterPages = this.currentPage < this.totalPages - 1 ? this.currentPage + 1 : this.totalPages;

    this.pagesToDisplay = [];

    if (this.totalPages <= 5) {
      // Mostrar todas las páginas si el total es menor o igual a 5
      for (let i = 1; i <= this.totalPages; i++) {
        this.pagesToDisplay.push(i);
      }
    } else {
      if (this.currentPage > 2) {
        this.pagesToDisplay.push(1);
        if (this.currentPage > 3) {
          this.pagesToDisplay.push(-1); // Para "..."
        }
      }

      for (let i = beforePages; i <= afterPages; i++) {
        this.pagesToDisplay.push(i);
      }

      if (this.currentPage < this.totalPages - 1) {
        if (this.currentPage < this.totalPages - 2) {
          this.pagesToDisplay.push(-1); // Para "..."
        }
        this.pagesToDisplay.push(this.totalPages);
      }
    }
  }

  changePage(page: number) {
    if (page === -1 || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.generatePagesToDisplay();
    this.pageChange.emit(this.currentPage); // Emitir el cambio de página
  }
}
