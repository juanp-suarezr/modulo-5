import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginatorComponent } from '../paginator/paginator.component';
import { CommonModule, formatDate } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [PaginatorComponent, CommonModule, TooltipModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  @Input() headers: any = [];
  @Input() data: any = [];
  @Output() idClicked: EventEmitter<number> = new EventEmitter<number>();
  @Output() solicitudGuardada: EventEmitter<{ id: number; categoria: string }> =
    new EventEmitter<{ id: number; categoria: string }>();
  @Output() solicitudSubsanacion: EventEmitter<{ id: number; categoria: string }> =
    new EventEmitter<{ id: number; categoria: string }>();
  user: any;
  hasPermission: boolean = false;

  constructor(private authService: AuthService) {
    this.user = this.authService.getUserInfo();
    this.hasPermission = this.authService.hasPermission(
      'MSF_TERRITORIAL'
    );
  }

  get info(): string[] {
    return this.data.length > 0 ? Object.keys(this.data[0]) : [];
  }

  formatField(value: any): string {
    // Si el valor es una fecha válida, formatearlo

    if (this.isDateTime(value)) {
      return formatDate(value, 'dd/MM/yyyy', 'en-US', 'UTC');
    }
    return value;
  }

  isDateTime(value: any): boolean {
    // Verifica si el valor es una cadena en un formato de fecha válido (como yyyy-mm-dd o dd/mm/yyyy)
    const dateRegex = /^\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}$/;

    // Si el valor es una cadena que no coincide con el formato de fecha, no es una fecha
    if (typeof value === 'string' && !dateRegex.test(value)) {
      return false;
    }

    // Si el valor pasa el regex o no es una cadena, intenta parsearlo como fecha
    return !isNaN(Date.parse(value));
  }

  hasRole(name: string): boolean {
    return this.authService.getUserRoles()[0].sistema ===
            name;
  }

  //Metodo para darle click al id
  onIdClick(id: number) {
    console.log(id);

    this.idClicked.emit(id);
  }

  //Metodo para continuar con registro
  onButtonClick(solicitud: any) {
    console.log(solicitud);

    this.solicitudGuardada.emit({
      id: this.getId(solicitud.id),
      categoria: solicitud.categoria,
    });
  }

  //Metodo para continuar con registro subsanación
  onButtonClick1(solicitud: any) {
    console.log(solicitud);

    this.solicitudSubsanacion.emit({
      id: this.getId(solicitud.id),
      categoria: solicitud.categoria,
    });
  }

  getColorForSemaforo(dias: number): string {
    if (dias <= 3) {
      return '#068460'; // 1-3 días: verde
    } else if (dias >= 4 && dias <= 7) {
      return '#FFAB00'; // 4-7 días: amarillo
    } else if (dias >= 8) {
      return '#A80521'; // 8-10 días: rojo
    }
    return 'gray'; // Default para valores inesperados
  }

  getId(value: string): number {
    // Dividimos el string por la coma y retornamos el primer valor (el id)
    return parseInt(value.split(',')[0]);
  }

  isTrue(value: string): boolean {
    // Verificamos si el segundo valor es "true"
    return value.split(',')[1] === 'true';
  }
}
