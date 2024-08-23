import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select',
  imports: [CommonModule, FormsModule,],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  standalone: true,
})
export class SelectComponent {
  @Input() input: any;
  @Input() index: number = 0;
  @Input() error: boolean = false;
  @Output() inputChange = new EventEmitter<{ index: number; event: Event }>();

  isDropdownOpen: boolean = false;
  selectedOption: any = null;

  constructor(private cd: ChangeDetectorRef) {}

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['error'] && changes['error'].currentValue) {
      this.cd.detectChanges();
      console.log(this.error);
    }
  }

  
  selectOption(option: any) {
    this.selectedOption = option;
    this.input.value = option.value;
    this.isDropdownOpen = false;
    this.onInputChange();
  }

  onInputChange() {
    this.inputChange.emit({ index: this.index, event: this.selectedOption });
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }
}
