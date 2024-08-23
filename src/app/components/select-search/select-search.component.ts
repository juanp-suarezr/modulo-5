import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'select-search',
  templateUrl: './select-search.component.html',
  styleUrl: './select-search.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SelectSearchComponent {
  @Input() options: any[] = [];
  @Input() placeholder: string = 'Search items';
  @Input() selectedValue: any;
  @Input() label: string = ''; // Nueva propiedad para la etiqueta
  @Input() required: boolean = false; // Nueva propiedad para la validación
  @Output() selectedValueChange = new EventEmitter<string>();
  @Output() change = new EventEmitter<void>();

  
  searchTerm: string = '';
  dropdownOpen: boolean = false;
  showError: boolean = false; // Nueva propiedad para mostrar el error

  

  get filteredOptions() {
    return this.options.filter(option =>
      option.label.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  
  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
  }

  onSelectOption(value: string) {
    this.selectedValue = value;
    this.selectedValueChange.emit(this.selectedValue);
    this.change.emit(); // Emitir el evento change
    this.dropdownOpen = false;
    this.showError = false; // Ocultar el error al seleccionar una opción
  }

  get selectedLabel() {
    const selectedOption = this.options.find(option => option.value === this.selectedValue);
    return selectedOption ? selectedOption.label : 'Seleccionar';
  }


  validate() {
    if (this.required && !this.selectedValue) {
      this.showError = true;
    } else {
      this.showError = false;
    }
  }
}