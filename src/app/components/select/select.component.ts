import { Component, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css'
})
export class SelectComponent {
  @Input() input: any;
  @Input() index: number = 0;
  @Input() error: boolean = false;
  @Output() inputChange = new EventEmitter<{ index: number; event: Event }>();

  selectSize: number = 1;  // Tamaño por defecto del select

  constructor(private cd: ChangeDetectorRef) {}
  
  onSelectFocus() {
    this.selectSize = 12;  // Cambia el tamaño al desplegar
  }

  onSelectBlur() {
    this.selectSize = 1;  // Restablece el tamaño al colapsar
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['error'] && changes['error'].currentValue) {
      this.cd.detectChanges();
      console.log(this.error);
    }
  }

  onInputChange(event: Event) {
    this.inputChange.emit({ index: this.index, event });
  }
}
