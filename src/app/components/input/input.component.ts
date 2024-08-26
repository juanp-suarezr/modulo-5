import { Component, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'input-text',
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class InputText {
  @Input() input: any;
  @Input() index: number = 0;
  @Input() error: boolean = false;
  @Input() disabled: boolean = false;
  @Output() inputChange = new EventEmitter<{ index: number; event: Event }>();

  constructor(private cd: ChangeDetectorRef) {}

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
