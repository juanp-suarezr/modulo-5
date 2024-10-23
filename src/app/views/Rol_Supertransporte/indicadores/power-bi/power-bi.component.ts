import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {ProgressSpinnerModule} from "primeng/progressspinner";

@Component({
  selector: 'app-power-bi',
  standalone: true, imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './power-bi.component.html',
  styleUrl: './power-bi.component.css'
})
export default class PowerBiComponent {

  isLoading = true;

  // Método que se ejecuta cuando el iframe termina de cargar
  onIframeLoad() {
    this.isLoading = false;
  }

}
