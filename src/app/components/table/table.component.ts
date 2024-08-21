import { Component, Input } from '@angular/core';
import { PaginatorComponent } from '../paginator/paginator.component';
import { CommonModule, formatDate } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [PaginatorComponent, CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {

  @Input() headers: any = [];
  @Input() data: any = [];
  
  
  get info(): string[] {
    return this.data.data.length > 0 ? Object.keys(this.data.data[0]) : [];
  }

  formatField(value: any): string {
    // Si el valor es una fecha válida, formatearlo
    if (this.isDateTime(value)) {
      return formatDate(value, 'dd/MM/yyyy', 'en-US');
    }
    return value;
  }

  isDateTime(value: any): boolean {
    // Verifica si el valor es una fecha válida
    return !isNaN(Date.parse(value));
  }

}
