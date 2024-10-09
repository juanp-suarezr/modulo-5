import { ChangeDetectorRef, Component } from '@angular/core';
import {
  CommonModule,
  formatDate,
  NgClass,
  NgForOf,
  NgIf,
} from '@angular/common';

@Component({
  selector: 'app-comparativo-veh-placas',
  standalone: true,
  imports: [],
  templateUrl: './comparativo-veh-placas.component.html',
  styleUrl: './comparativo-veh-placas.component.css'
})
export default class ComparativoVehPlacasComponent {
  embedUrl: string = 'https://app.powerbi.com/view?r=YOUR_EMBED_URL';
}
