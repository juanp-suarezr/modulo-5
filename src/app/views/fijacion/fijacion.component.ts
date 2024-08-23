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
import { DEPARTAMENTOS } from '../../shared/data/departamentos';

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
      label: 'Capital social*',
      required: true,
      value: '',
      error: 'Capital social es obligatorio',
      good: 'Dato correcto',
    },
    {
      name: 'Patrimonio_liquido',
      type: 'number',
      placeholder: '$100.000',
      label: 'Patrimonio Líquido en SMLV*',
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

    //input
    {
      name: 'Cantidad de contratos',
      type: 'number',
      placeholder: '#',
      label: 'Cantidad de contratos*',
      required: true,
      value: '',
      error: 'Cantidad de contratos es obligatorio',
      good: 'Dato correcto',
    },
    //input
    {
      name: 'N° de contrato',
      type: 'number',
      placeholder: '#',
      label: 'N° de contrato*',
      required: true,
      value: '',
      error: 'N° de contrato es obligatorio',
      good: 'Dato correcto',
    },
    //input
    {
      name: 'Contratante',
      type: 'string',
      placeholder: 'Nombre de empresa contratante',
      label: 'Contratante*',
      required: true,
      value: '',
      error: 'Contratante es obligatorio',
      good: 'Dato correcto',
    },
    {
      name: 'Fecha de inicio',
      type: 'date',
      placeholder: 'dd/mm/aaaa',
      label: 'Fecha de inicio*',
      required: true,
      value: '',
      error: 'Fecha de inicio es obligatorio',
      good: 'Dato correcto',
    },
    {
      name: 'Fecha de terminacion',
      type: 'date',
      placeholder: 'dd/mm/aaaa',
      label: 'Fecha de terminación*',
      required: true,
      value: '',
      error: 'Fecha de terminación es obligatorio',
      good: 'Dato correcto',
    },
    //select3
    {
      name: 'mySelect3',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      options: [
        { value: '1 mes', label: '1 mes' },
        { value: '2 meses', label: '2 meses' },
        { value: '3 meses', label: '3 meses' },
        { value: '4 meses', label: '4 meses' },
        { value: '5 meses', label: '5 meses' },
        { value: '6 meses', label: '6 meses' },
        { value: '7 meses', label: '7 meses' },
        { value: '8 meses', label: '8 meses' },
        { value: '9 meses', label: '9 meses' },
        { value: '10 meses', label: '10 meses' },
        { value: '11 meses', label: '11 meses' },
        { value: '12 meses', label: '12 meses' },
        { value: '13 meses', label: '13 meses' },
        { value: '14 meses', label: '14 meses' },
        { value: '15 meses', label: '15 meses' },
        { value: '16 meses', label: '16 meses' },
        { value: '17 meses', label: '17 meses' },
        { value: '18 meses', label: '18 meses' },
        { value: '19 meses', label: '19 meses' },
        { value: '20 meses', label: '20 meses' },
        { value: '21 meses', label: '21 meses' },
        { value: '22 meses', label: '22 meses' },
        { value: '23 meses', label: '23 meses' },
        { value: '24 meses', label: '24 meses' },
        { value: 'Contrato indefinido', label: 'Contrato indefinido' },
      ],
      good: 'Selection is valid',
      error: 'Duración en meses es requerido',
    },
    //input
    {
      name: 'N° de Vehículos / Contrato',
      type: 'number',
      placeholder: '10',
      label: 'N° de Vehículos / Contrato*',
      required: true,
      value: '',
      error: 'N° de Vehículos / Contrato es obligatorio',
      good: 'Dato correcto',
    },
    //select
    {
      name: 'mySelect4',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      options: [
        { value: 'Bus', label: 'Bus' },
        { value: 'Microbus', label: 'Microbus' },
        { value: 'Buseta', label: 'Buseta' },
        { value: 'Camioneta DC', label: 'Camioneta DC' },
        { value: 'Camioneta SW', label: 'Camioneta SW' },
        { value: 'Automóvil', label: 'Automóvil' },
        { value: 'Camioneta de platón', label: 'Camioneta de platón' },
      ],
      good: 'Selection is valid',
      error: 'Clase de vehículo es requerido',
    },
    //input
    {
      name: 'Valor del Contrato',
      type: 'number',
      placeholder: '$',
      label: 'Valor del Contrato*',
      required: true,
      value: '',
      error: 'Valor del Contrato es obligatorio',
      good: 'Dato correcto',
    },
    //select
    {
      name: 'mySelect5',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      options: [
        { value: 'Diario', label: 'Diario' },
        { value: 'Mensual', label: 'Mensual' },
        { value: 'Anual', label: 'Anual' },
      ],
      good: 'Selection is valid',
      error: 'Forma de pago es requerido',
    },
    //select depart
    {
      name: 'mySelect6',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      options: DEPARTAMENTOS,
      good: 'Selection is valid',
      error: 'Áreas de Operación es requerido',
    },
    //select tienpo estimado
    {
      name: 'mySelect6',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      options: [
        { value: '1 hora', label: '1 hora' },
        { value: '2 horas', label: '2 horas' },
        { value: '3 horas', label: '3 horas' },
        { value: '4 horas', label: '4 horas' },
        { value: '5 horas', label: '5 horas' },
        { value: '6 horas', label: '6 horas' },
        { value: '7 horas', label: '7 horas' },
        { value: '8 horas', label: '8 horas' },
        { value: '9 horas', label: '9 horas' },
        { value: '10 horas', label: '10 horas' },
        { value: '11 horas', label: '11 horas' },
        { value: '12 horas', label: '12 horas' },
        { value: '13 horas', label: '13 horas' },
        { value: '14 horas', label: '14 horas' },
        { value: '15 horas', label: '15 horas' },
        { value: '16 horas', label: '16 horas' },
        { value: '17 horas', label: '17 horas' },
        { value: '18 horas', label: '18 horas' },
        { value: '19 horas', label: '19 horas' },
        { value: '20 horas', label: '20 horas' },
        { value: '21 horas', label: '21 horas' },
        { value: '22 horas', label: '22 horas' },
        { value: '23 horas', label: '23 horas' },
        { value: '24 horas', label: '24 horas' },
      ],
      good: 'Selection is valid',
      error: 'Tiempos estimados es requerido',
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
      6: ['', Validators.required],
      7: ['', Validators.required],
      8: ['', Validators.required],
      9: ['', Validators.required],
      10: ['', Validators.required],
      11: ['', Validators.required],
      12: ['', Validators.required],
      13: ['', Validators.required],
      14: ['', Validators.required],
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
      const inputElement = event.target as HTMLInputElement;
      value = inputElement?.value ?? ''; // Maneja valores nulos
    } else {
      value = event?.value ?? ''; // Maneja valores nulos
    }

    this.inputs[index].value = value;
    this.formGroup3.patchValue({ [index]: value });
    this.formGroup4.patchValue({ [index]: value });
  }

  // Método para enviar los formularios
  onSubmitAllForms() {
    // Obtener el valor de input[3] para determinar la cantidad de contratos
    this.totalContracts = parseInt(this.inputs[3].value, 10); // Valor de cantidad de contratos

    if (
      // this.formGroup1.valid &&
      // this.formGroup2.valid &&
      // this.formGroup3.valid
      true
    ) {
      if (this.totalContracts <= 0) {
        if (this.validateFormGroup(this.formGroup4, this.errorStates)) {
          // Reiniciar contador e iteración de contratos
          this.currentContractIteration = 0;
          this.contractDataArray = []; // Reiniciar el array

          // Lógica para múltiples contratos
          this.showModal = true; // Mostrar modal para cada contrato
          this.processContractIteration(); // Procesar la primera iteración
        }
      } else {
        this.validateFormGroup(this.formGroup4, this.errorStates);
      }
    } else {
      this.changeActiveNum('0');
      if (!this.validateFormGroup(this.formGroup1, this.errorStates)) {
        console.log('entro');

        this.stepperService.setActiveNum(1);
      } else if (!this.validateFormGroup(this.formGroup2, this.errorStates)) {
        console.log('entro1');
        this.stepperService.setActiveNum(2);
      } else if (!this.validateFormGroup(this.formGroup3, this.errorStates)) {
        console.log('entro2');
        this.stepperService.setActiveNum(3);
      }
    }
  }

  // Procesar cada iteración de contratos
  processContractIteration() {
    if (this.currentContractIteration < this.totalContracts) {
      console.log(
        `Procesando contrato ${this.currentContractIteration + 1} de ${
          this.totalContracts
        }`
      );

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
