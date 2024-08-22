import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select-multiple',
  templateUrl: './select-multiple.component.html',
  styleUrls: ['./select-multiple.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SelectMultipleComponent {
  @Input() options: { value: string, label: string }[] = [];
  selectedOptions: { value: string, label: string }[] = [];
  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectOption(option: { value: string, label: string }) {
    const index = this.selectedOptions.findIndex(o => o.value === option.value);
    if (index === -1) {
      this.selectedOptions.push(option);
    } else {
      this.selectedOptions.splice(index, 1);
    }
  }

  removeOption(option: { value: string, label: string }) {
    this.selectedOptions = this.selectedOptions.filter(o => o !== option);
  }

  isSelected(option: { value: string, label: string }): boolean {
    return this.selectedOptions.some(o => o.value === option.value);
  }
}