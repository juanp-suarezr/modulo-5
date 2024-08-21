import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'input-text',
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class InputText {
  @Input() input: any;
  @Input() index: number = 0;
  @Output() inputChange = new EventEmitter<{ index: number, event: Event }>();

  onInputChange(event: Event) {
    this.inputChange.emit({ index: this.index, event });
  }
}