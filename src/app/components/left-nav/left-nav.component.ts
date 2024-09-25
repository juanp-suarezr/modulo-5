import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveNumService } from '../../services/left-nav/active-num.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-left-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './left-nav.component.html',
  styleUrl: './left-nav.component.css',
})
export class LeftNavComponent {
  @Input() data?: { num: string; name: string }[];
  @Input() active?: string;
  @Output() changed: EventEmitter<string> = new EventEmitter<string>();
  constructor(private stateService: ActiveNumService) {
  }

  ngOnInit(): void {
    // Suscribirse al observable para obtener los cambios reactivos
    this.stateService.activeNum$.subscribe((num) => {
      this.active = num;
    });
  }

  // Método para cambiar el valor
  changeActiveNum(newValue: string) {
    this.changed.emit(newValue);
  }
}
