import { ErrorService } from './../../services/error/error.service';
import { PrimaryButtonComponent } from './../../components/primary-button/primary-button.component';
import { ActiveNumService } from '../../services/left-nav/active-num.service';
import { ActiveNumStepperService } from '../../services/stepper/active-num.service';
import { Component, OnInit } from '@angular/core';
import { LeftNavComponent } from '../../components/left-nav/left-nav.component';
import { SttepperComponent } from '../../components/sttepper/sttepper.component';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { CommonModule } from '@angular/common';
//servicios de consultas api
import { ApiService } from '../../services/api/api.service';
import { InputText } from '../../components/input/input.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { log } from 'node:console';

@Component({
  selector: 'app-fijacion',
  standalone: true,
  imports: [
    LeftNavComponent,
    PrimaryButtonComponent,
    SttepperComponent,
    FileUploadComponent,
    CommonModule,
    InputText,
    ReactiveFormsModule,
  ],
  templateUrl: './fijacion.component.html',
  styleUrl: './fijacion.component.css',
})
export default class FijacionComponent {
  constructor(
    private stateService: ActiveNumService,
    private stepperService: ActiveNumStepperService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private errorService: ErrorService
  ) {}

  activeNum: string = '0';
  activeStep: number = 1;
  formGroup1!: FormGroup;
  formGroup2!: FormGroup;
  formGroup3!: FormGroup;
  errorStates: { [key: number]: boolean } = {};

  user: any;

  infoMenu = [
    {
      num: '0',
      name: 'Solicitud',
    },
    {
      num: '1',
      name: 'Operativo',
    },
  ];

  infoStepper = [
    {
      num: 1,
      info: 'Cargue de documentos',
    },
    {
      num: 2,
      info: 'Cargue de documentos',
    },
    {
      num: 3,
      info: 'Digitar información',
    },
  ];

  inputs = [
    {
      name: 'capital_social',
      type: 'number',
      placeholder: '$100.000',
      label: 'Capital social',
      required: true,
      value: '',
      error: 'Capital social es obligatorio',
      good: 'Dato correcto',
    },
    {
      name: 'Patrimonio_liquido',
      placeholder: '$100.000',
      label: 'Patrimonio Líquido en SMLV',
      required: true,
      value: '',
      error: 'Patrimonio Líquido en SMLV es obligatorio',
      good: 'Dato correcto',
    },
    // Agrega más inputs según sea necesario
  ];

  dataClass = {
    textSize: 'xs',
    textInfo: 'Archivo PDF. Peso máximo: 2MB',
  };

  ngOnInit(): void {
    // Suscribirse al observable para obtener los cambios reactivos del menuleft
    this.stateService.activeNum$.subscribe((num) => {
      this.activeNum = num;
    });

    // Suscribirse al observable del servicio de stepper
    this.stepperService.activeStep$.subscribe((step) => {
      this.activeStep = step;
      console.log('Active step:', step);
    });

    //traer los datos de la consulta
    this.apiService.getAuthUserAndRoles().subscribe(
      (response) => {
        this.user = response.user;
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );

    this.formGroup1 = this.fb.group({
      1: [null, Validators.required],
      2: [null, Validators.required],
      3: [null, Validators.required],
      4: [null, Validators.required],
      5: [null, Validators.required],
      6: [null, Validators.required],
    });

    this.formGroup2 = this.fb.group({
      7: [null, Validators.required],
      8: [null, Validators.required],
      9: [null, Validators.required],
      10: [null, Validators.required],
      11: [null, Validators.required],
    });

    this.formGroup3 = this.fb.group({
      0: ['', Validators.required],
      1: ['', Validators.required],
    });

    this.errorService.errorStates$.subscribe((errorStates) => {
      this.errorStates = errorStates;
    });
  }

  // Método para cambiar el valor del menuleft
  changeActiveNum(newValue: string) {
    this.stateService.setActiveNum(newValue);
  }

  // Método para cambiar el valor del stepper
  changeActiveStep(newValue: number) {
    switch (newValue) {
      case 1:
        break;
      case 2:
        if (this.formGroup1.valid) {
          // Avanzar solo si el formulario es válido
          this.stepperService.setActiveNum(newValue);
        } else {
          console.log(this.formGroup1.controls);
          const newErrorStates: { [key: number]: boolean } = {};

          for (const key in this.formGroup1.controls) {
            if (this.formGroup1.controls.hasOwnProperty(key)) {
              const control = this.formGroup1.controls[key];

              // Revisa si el control está vacío o tiene errores de validación
              if (!control.value || control.invalid) {
                const errorKey = parseInt(key, 10); // Convierte la clave a número
                newErrorStates[errorKey] = true;
              }
            }
          }
          this.errorService.updateErrorStates(newErrorStates);
        }
        break;
      case 3:
        if (this.formGroup2.valid) {
          // Avanzar solo si el formulario es válido
          this.stepperService.setActiveNum(newValue);
        } else {
          console.log(this.formGroup2.controls);
          const newErrorStates: { [key: number]: boolean } = {};

          for (const key in this.formGroup2.controls) {
            if (this.formGroup2.controls.hasOwnProperty(key)) {
              const control = this.formGroup2.controls[key];

              // Revisa si el control está vacío o tiene errores de validación
              if (!control.value || control.invalid) {
                const errorKey = parseInt(key, 10); // Convierte la clave a número
                newErrorStates[errorKey] = true;
              }
            }
          }
          this.errorService.updateErrorStates(newErrorStates);
        }
        break;
      case 4:
        let newErrorStates: { [key: number]: boolean } = {};
        if (this.formGroup3.valid) {
          // Avanzar solo si el formulario es válido
          this.stepperService.setActiveNum(3);
          this.changeActiveNum('1');
        } else {
          console.log(this.formGroup3.controls);

          for (const key in this.formGroup3.controls) {
            if (this.formGroup3.controls.hasOwnProperty(key)) {
              const control = this.formGroup3.controls[key];

              // Revisa si el control está vacío o tiene errores de validación
              if (!control.value || control.invalid) {
                const errorKey = parseInt(key, 10); // Convierte la clave a número
                newErrorStates[errorKey] = true;
              }
            }
          }
        }
        this.errorService.updateErrorStates(newErrorStates);

        break;

      default:
        break;
    }

    console.log(this.errorStates);
  }

  //metodo para guardar el archivo seleccionado
  onFileSelected(file: File[], FormControlName: number) {
    switch (FormControlName) {
      case 1:
        this.formGroup1.patchValue({ [FormControlName]: file });
        break;
      case 2:
        this.formGroup1.patchValue({ [FormControlName]: file });
        break;
      case 3:
        this.formGroup1.patchValue({ [FormControlName]: file });
        break;
      case 4:
        this.formGroup1.patchValue({ [FormControlName]: file });
        break;
      case 5:
        this.formGroup1.patchValue({ [FormControlName]: file });
        break;
      case 6:
        this.formGroup1.patchValue({ [FormControlName]: file });
        break;
      case 7:
        this.formGroup2.patchValue({ [FormControlName]: file });
        break;
      case 8:
        this.formGroup2.patchValue({ [FormControlName]: file });
        break;
      case 9:
        this.formGroup2.patchValue({ [FormControlName]: file });
        break;
      case 10:
        this.formGroup2.patchValue({ [FormControlName]: file });
        break;
      case 11:
        this.formGroup2.patchValue({ [FormControlName]: file });
        break;

      default:
        break;
    }
  }

  //metodo para guardar el valor del input
  onInputChange(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value ?? ''; // Maneja valores nulos
    console.log(value);
    this.inputs[index].value = value;
    this.formGroup3.patchValue({ [index]: value });
  }

  onSubmitAllForms() {
    if (
      this.formGroup1.valid &&
      this.formGroup2.valid &&
      this.formGroup3.valid
    ) {
      const combinedData = {
        file1: this.formGroup1.get('file1')?.value,
        file2: this.formGroup2.get('file2')?.value,
        file3: this.formGroup3.get('file3')?.value,
      };
    } else {
      console.error('Uno o más formularios no son válidos');
    }
  }
}
