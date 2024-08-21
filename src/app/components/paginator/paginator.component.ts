import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css',
})
export class PaginatorComponent {
  @Input() links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }> = [];

  @Input() isResponsive: boolean = false;

  isLabelNumber(label: string): boolean {
    return !isNaN(Number(label));
  }
}
