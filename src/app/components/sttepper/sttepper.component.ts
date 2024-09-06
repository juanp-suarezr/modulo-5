import { Component, ElementRef, Input, TemplateRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveNumStepperService } from '../../services/stepper/active-num.service';

@Component({
  selector: 'app-sttepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sttepper.component.html',
  styleUrl: './sttepper.component.css',
})
export class SttepperComponent {
  @Input() dataStep: { num: number; info: string }[] = [];
  @Input() active: number = 1;
  @Input() contentTemplates: TemplateRef<any>[] = [];

  @ViewChild('stepperOl') stepperOl!: ElementRef<HTMLDivElement>;
  stepperWidth = 0;
  

  constructor(private stateService: ActiveNumStepperService, private renderer: Renderer2) {}

  ngOnInit(): void {
    // Suscribirse al observable para obtener los cambios reactivos
    this.stateService.activeStep$.subscribe((num) => {
      this.active = num;
    });
  }

  ngAfterContentInit() {
    // Asegúrate de que `contentTemplates` tenga el mismo número de plantillas que `dataStep`
    if (this.contentTemplates.length !== this.dataStep.length) {
      console.warn(
        'El número de plantillas de contenido no coincide con el número de pasos.'
      );
    }
  }

  ngAfterViewInit() {
    this.calculateStepperWidth();
  }

  calculateStepperWidth() {
    if (this.stepperOl) {
      // Obtener el ancho del <ol>
      this.stepperWidth = this.stepperOl.nativeElement.offsetWidth;

      // Aplicar el ancho calculado al div de la barra de progreso
      const progressBarElement = document.querySelector('.progress-bar') as HTMLElement;
      this.renderer.setStyle(progressBarElement, 'width', `${this.stepperWidth}px`);
    }
  }

  // Método para cambiar el valor
  changeActiveNum(newValue: number) {
    this.stateService.setActiveNum(newValue);
  }
}
