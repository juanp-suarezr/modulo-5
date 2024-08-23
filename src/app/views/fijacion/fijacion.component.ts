import { ErrorService } from './../../services/error/error.service';
import { PrimaryButtonComponent } from './../../components/primary-button/primary-button.component';
import { ActiveNumService } from '../../services/left-nav/active-num.service';
import { ActiveNumStepperService } from '../../services/stepper/active-num.service';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { SelectComponent } from '../../components/select/select.component';

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
    SelectComponent,
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
  //objeto para manejar los active num del left menu y stepper.
  activeNum: string = '0'; //left menu
  activeStep: number = 1; //stteper
  //forms
  formGroup1!: FormGroup;
  formGroup2!: FormGroup;
  formGroup3!: FormGroup;
  formGroup4!: FormGroup;
  //fin forms

  contractDataArray: any[] = []; // Array para almacenar la información de cada iteración
  currentContractIteration: number = 0; // Contador para las iteraciones
  totalContracts: number = 0; // Número total de contratos

  showModal: boolean = false; // Control para mostrar el modal intermedio
  showFinalModal: boolean = false; // Control para mostrar el modal final

  //objeto para manejo de errores
  errorStates: { [key: number]: boolean } = {};
  //respuesta de user activo y rol
  user: any;
  //info menu left
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
  //info stepper
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
  //info inputs tipo num, string o date
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

    //select
    {
      name: 'mySelect1',
      required: true,
      placeholder: 'Lista desplegable de números',
      value: '', // Valor seleccionado
      options: this.generateOptions(15),
      good: 'Selection is valid',
      error: 'Cantidad de vehículos es requerido',
    },
    //select2
    {
      name: 'mySelect2',
      required: true,
      placeholder: 'Lista desplegable de números',
      value: '', // Valor seleccionado
      options: this.generateOptions(15),
      good: 'Selection is valid',
      error: 'Cantidad de contratos es requerido',
    },
    // Agrega más inputs según sea necesario
  ];
  //props o datos para input upload
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

    //traer los datos de la consulta, para roles
    this.apiService.getAuthUserAndRoles().subscribe(
      (response) => {
        this.user = response.user;
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );
    //validaciones segun form
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
      2: ['', Validators.required],
    });

    this.formGroup4 = this.fb.group({
      3: ['', Validators.required],
      4: ['', Validators.required],
      5: ['', Validators.required],
    });

    //suscribirse al servicio de manejo de errores
    this.errorService.errorStates$.subscribe((errorStates) => {
      this.errorStates = errorStates;
    });
  }

  // Generar opciones para los selects
  generateOptions(max: number) {
    return Array.from({ length: max }, (_, i) => ({
      value: i + 1,
      label: i + 1,
    }));
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
        if (this.validateFormGroup(this.formGroup1, this.errorStates)) {
          this.stepperService.setActiveNum(newValue);
        }
        break;
      case 3:
        if (this.validateFormGroup(this.formGroup2, this.errorStates)) {
          this.stepperService.setActiveNum(newValue);
        }
        break;
      case 4:
        if (this.validateFormGroup(this.formGroup3, this.errorStates)) {
          this.changeActiveNum('1');
          this.stepperService.setActiveNum(3);
        }

        break;

      default:
        break;
    }

    console.log(this.errorStates);
  }

  //validate error
  validateFormGroup(
    formGroup: FormGroup,
    errorStates: { [key: number]: boolean }
  ): boolean {
    let isValid = true;
    for (const key in formGroup.controls) {
      if (formGroup.controls.hasOwnProperty(key)) {
        const control = formGroup.controls[key];
        if (!control.value || control.invalid) {
          const errorKey = parseInt(key, 10); // Convierte la clave a número
          errorStates[errorKey] = true;
          isValid = false;
        }
      }
    }
    this.errorService.updateErrorStates(errorStates);
    return isValid;
  }

  //metodo para guardar el archivo seleccionado
  onFileSelected(file: File[], formControlName: number) {
    const formControlMap: { [key: number]: FormGroup } = {
      1: this.formGroup1,
      2: this.formGroup1,
      3: this.formGroup1,
      4: this.formGroup1,
      5: this.formGroup1,
      6: this.formGroup1,
      7: this.formGroup2,
      8: this.formGroup2,
      9: this.formGroup2,
      10: this.formGroup2,
      11: this.formGroup2,
      // Y así sucesivamente
    };

    const formGroup = formControlMap[formControlName];
    if (formGroup) {
      formGroup.patchValue({ [formControlName]: file });
    }
  }

  //metodo para guardar el valor del input y select
  onInputChange(index: number, event: any) {
    let value = null;
    if (event.target) {
      console.log('input normal');
      const inputElement = event.target as HTMLInputElement;
      value = inputElement?.value ?? ''; // Maneja valores nulos
    } else {
      value = event?.value ?? ''; // Maneja valores nulos
    }

    console.log(value);
    this.inputs[index].value = value;
    this.formGroup3.patchValue({ [index]: value });
  }

  // Método para enviar los formularios
  onSubmitAllForms() {
    // Obtener el valor de input[3] para determinar la cantidad de contratos
    this.totalContracts = parseInt(this.inputs[3].value, 10); // Valor de cantidad de contratos

    if (
      this.formGroup1.valid &&
      this.formGroup2.valid &&
      this.formGroup3.valid &&
      this.totalContracts > 0
    ) {
      // Reiniciar contador e iteración de contratos
      this.currentContractIteration = 0;
      this.contractDataArray = []; // Reiniciar el array

      // Lógica para múltiples contratos
      this.showModal = true; // Mostrar modal para cada contrato
      this.processContractIteration(); // Procesar la primera iteración
    }
  }

  // Procesar cada iteración de contratos
  processContractIteration() {
    if (this.currentContractIteration < this.totalContracts) {
      console.log(`Procesando contrato ${this.currentContractIteration + 1} de ${this.totalContracts}`);

      if (this.formGroup4.valid) {
        // Guardar los datos del formulario en el array
        this.contractDataArray.push(this.formGroup4.value);

        // Avanzar a la siguiente iteración
        this.currentContractIteration++;
        if (this.currentContractIteration < this.totalContracts) {
          this.showModal = true; // Mostrar modal intermedio
        } else {
          this.showFinalModal = true; // Mostrar modal final
        }

        // Reiniciar el formulario para la siguiente iteración
        this.formGroup4.reset();
      } else {
        console.log('Formulario de contrato no válido');
      }
    } else {
      console.log('Todas las iteraciones han sido procesadas');
    }
  }

  // Método para enviar todos los contratos al servidor
  sendAllContracts() {
    const allFormsData = {
      form1: this.formGroup1.value,
      form2: this.formGroup2.value,
      form3: this.formGroup3.value,
      form4: this.contractDataArray,
    };

    console.log(allFormsData);

    // this.apiService.sendContractForms(allFormsData).subscribe(
    //   (response) => {
    //     console.log('Formularios enviados exitosamente');
    //     // Realizar acciones adicionales si es necesario
    //   },
    //   (error) => console.error('Error enviando los formularios', error)
    // );
  }
}
