import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveNumStepperService } from '../../services/stepper/active-num.service';

@Component({
  selector: 'app-sttepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sttepper.component.html',
  styleUrl: './sttepper.component.css'
})
export class SttepperComponent {

  @Input() dataStep: { num: number; info: string }[] = [];
  @Input() active: number = 1;

  constructor(private stateService: ActiveNumStepperService) {}

  ngOnInit(): void {
    // Suscribirse al observable para obtener los cambios reactivos
    this.stateService.activeStep$.subscribe((num) => {
      this.active = num;
    });
  }

  // Método para cambiar el valor
  changeActiveNum(newValue: number) {
    this.stateService.setActiveNum(newValue);
  }

}
