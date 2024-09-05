import {Component, EventEmitter, Input, Output} from '@angular/core';
import { PaginatorComponent } from '../paginator/paginator.component';
import { CommonModule, formatDate } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [PaginatorComponent, CommonModule, TooltipModule,],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {

  @Input() headers: any = [];
  @Input() data: any = [];
  @Output() idClicked: EventEmitter<number> = new EventEmitter<number>();
  user:any;

  constructor(private authService: AuthService) {
    this.user = this.authService.currentUser; // Obtener el usuario actual
  }


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

  hasRole(name: string): boolean {
    return this.user.roles.some((role: any) => role.roleName.includes(name));
  }

  //Metodo para darle click al id
  onIdClick(id: number) {
    this.idClicked.emit(id);
  }

}
