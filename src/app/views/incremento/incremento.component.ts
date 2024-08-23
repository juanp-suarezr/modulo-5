import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActiveNumService} from "../../services/left-nav/active-num.service";
import {ActiveNumStepperService} from "../../services/stepper/active-num.service";
import {ApiService} from "../../services/api/api.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ErrorService} from "../../services/error/error.service";
import {FileUploadComponent} from "../../components/file-upload/file-upload.component";
import {InputText} from "../../components/input/input.component";
import {LeftNavComponent} from "../../components/left-nav/left-nav.component";
import {PrimaryButtonComponent} from "../../components/primary-button/primary-button.component";
import {SttepperComponent} from "../../components/sttepper/sttepper.component";


@Component({
  selector: 'app-incremento',
  standalone: true,
  imports: [CommonModule, FileUploadComponent, InputText, LeftNavComponent, PrimaryButtonComponent, ReactiveFormsModule, SttepperComponent],
  templateUrl: './incremento.component.html',
  styleUrl: './incremento.component.css'
})
export default class IncrementoComponent {

  constructor(
    private stateService: ActiveNumService,
    private stepperService: ActiveNumStepperService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private errorService: ErrorService
  ) {
  }

  //combobox
  options = [
    { value: '', label: 'Seleccione' },
    { value: '7%', label: '7%' },
    { value: '10%', label: '10%' },
  ];

  // Variable para almacenar la opción seleccionada
  selectedOption: string = '';

  // Método para manejar la selección de una opción
  onOptionSelected(event: any) {
    this.selectedOption = event.target.value;
  }

  // Método para verificar si una opción válida ha sido seleccionada
  isValidSelection(): boolean {
    return this.selectedOption !== '';
  }

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
      name: 'numero_vehicular',
      type: 'number',
      placeholder: 'Número de vehículos',
      label: 'Número de vehículos',
      required: true,
      value: '',
      error: 'Número de vehículos es obligatorio',
      good: 'Dato correcto',
    },
    {
      name: 'propiedad_empresa',
      placeholder: '',
      label: 'Propiedad de la empresa',
      required: true,
      value: '',
      error: 'Propiedad de la empresa es obligatorio',
      good: 'Dato correcto',
    },
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
      name: 'patrimonio_liquido',
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
      12: ['', Validators.required],
      13: ['', Validators.required],
    });

    this.formGroup3 = this.fb.group({
      0: [null, Validators.required],
      1: ['', Validators.required],
      2: ['', Validators.required],
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
        this.formGroup1.patchValue({[FormControlName]: file});
        break;
      case 2:
        this.formGroup1.patchValue({[FormControlName]: file});
        break;
      case 3:
        this.formGroup1.patchValue({[FormControlName]: file});
        break;
      case 4:
        this.formGroup1.patchValue({[FormControlName]: file});
        break;
      case 5:
        this.formGroup1.patchValue({[FormControlName]: file});
        break;
      case 6:
        this.formGroup1.patchValue({[FormControlName]: file});
        break;
      case 7:
        this.formGroup2.patchValue({[FormControlName]: file});
        break;
      case 8:
        this.formGroup2.patchValue({[FormControlName]: file});
        break;
      case 9:
        this.formGroup2.patchValue({[FormControlName]: file});
        break;
      case 10:
        this.formGroup2.patchValue({[FormControlName]: file});
        break;
      case 11:
        this.formGroup2.patchValue({[FormControlName]: file});
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
    this.formGroup3.patchValue({[index]: value});
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
