import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {FileUploadComponent} from "../../components/file-upload/file-upload.component";
import {InputText} from "../../components/input/input.component";
import {LeftNavComponent} from "../../components/left-nav/left-nav.component";
import {PrimaryButtonComponent} from "../../components/primary-button/primary-button.component";
import {SttepperComponent} from "../../components/sttepper/sttepper.component";
import {ActiveNumService} from "../../services/left-nav/active-num.service";
import {ActiveNumStepperService} from "../../services/stepper/active-num.service";
import {ApiService} from "../../services/api/api.service";
import {ErrorService} from "../../services/error/error.service";
import {SelectComponent} from "../../components/select/select.component";


@Component({
  selector: 'app-incremento',
  standalone: true,
  imports: [CommonModule, FileUploadComponent, InputText, LeftNavComponent, PrimaryButtonComponent, ReactiveFormsModule, SttepperComponent, SelectComponent],
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

  //Objeto para manejar los active num del left menu y stepper.
  activeNum: string = '0'; //Left menu
  activeStep: number = 1; //Stteper

  //Formularios
  formGroup1!: FormGroup;
  formGroup2!: FormGroup;
  formGroup3!: FormGroup;
  formGroup4!: FormGroup;

  //Array para almacenar la información de cada iteración
  contractDataArray: any[] = [];

  //Contador para las iteraciones
  currentContractIteration: number = 0;

  //Número total de contratos
  totalContracts: number = 0;

  //Control para mostrar el modal intermedio
  showModal: boolean = false;

  //Control para mostrar el modal final
  showFinalModal: boolean = false;

  //Objeto para manejar errores
  errorStates: { [key: number]: boolean } = {};

  //Respuesta de user activo y rol
  user: any;

  //Menu left
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

  //Menu stepper
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

  //Inputs
  inputs = [
    {
      name: 'numero_vehicular',
      type: 'number',
      placeholder: 'Número de vehículos',
      label: 'Numero vehiculos',
      required: true,
      value: '',
      error: 'Número de vehículos es obligatorio',
      good: 'Dato correcto',
    },
    //Select
    {
      name: 'SelectPropiedadEmpresa',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      options: this.generateOptions(15),
      good: 'Selección valida',
      error: 'Propiedad de la empresa es requerido',
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
      name: 'Patrimonio_liquido',
      placeholder: '$100.000',
      label: 'Patrimonio Líquido en SMLV',
      required: true,
      value: '',
      error: 'Patrimonio Líquido en SMLV es obligatorio',
      good: 'Dato correcto',
    },

    //Agrega más inputs según sea necesario
  ];

  //Props o datos para input upload
  dataClass = {
    textSize: 'xs',
    textInfo: 'Archivo PDF. Peso máximo: 2MB',
  };

  ngOnInit(): void {

    //Suscribirse al observable para obtener los cambios reactivos del menuleft
    this.stateService.activeNum$.subscribe((num) => {
      this.activeNum = num;
    });

    //Suscribirse al observable del servicio de stepper
    this.stepperService.activeStep$.subscribe((step) => {
      this.activeStep = step;
      console.log('Active step:', step);
    });

    //Traer los datos de la consulta, para roles
    this.apiService.getAuthUserAndRoles().subscribe(
      (response) => {
        this.user = response.user;
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );

    //Validaciones segun el formulario
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
      0: ['', Validators.required],
      1: ['', Validators.required],
    });

    this.formGroup3 = this.fb.group({
      2: ['', Validators.required],
      3: ['', Validators.required],
      4: ['', Validators.required],
    });

    this.formGroup4 = this.fb.group({
      5: ['', Validators.required],
      6: ['', Validators.required],
      7: ['', Validators.required],
    });

    //Suscribirse al servicio de manejo de errores
    this.errorService.errorStates$.subscribe((errorStates) => {
      this.errorStates = errorStates;
    });
  }

  //Generar opciones para los selects
  generateOptions(max: number) {
    return Array.from({length: max}, (_, i) => ({
      value: i + 1,
      label: i + 1,
    }));
  }

  //Metodo para cambiar el valor del menuleft
  changeActiveNum(newValue: string) {
    this.stateService.setActiveNum(newValue);
  }

  //Metodo para cambiar el valor del stepper
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

  //Validador error
  validateFormGroup(
    formGroup: FormGroup,
    errorStates: { [key: number]: boolean }
  ): boolean {
    let isValid = true;
    for (const key in formGroup.controls) {
      if (formGroup.controls.hasOwnProperty(key)) {
        const control = formGroup.controls[key];
        if (!control.value || control.invalid) {
          const errorKey = parseInt(key, 10); //Convierte la clave a número
          errorStates[errorKey] = true;
          isValid = false;
        }
      }
    }
    this.errorService.updateErrorStates(errorStates);
    return isValid;
  }

  //Metodo para guardar el archivo seleccionado
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
    };

    const formGroup = formControlMap[formControlName];
    if (formGroup) {
      formGroup.patchValue({[formControlName]: file});
    }
  }

  //Metodo para guardar el valor del input y select
  onInputChange(index: number, event: any) {
    let value = null;
    if (event.target) {
      console.log('input normal');
      const inputElement = event.target as HTMLInputElement;
      value = inputElement?.value ?? ''; //Maneja valores nulos
    } else {
      value = event?.value ?? ''; //Maneja valores nulos
    }

    console.log(value);
    this.inputs[index].value = value;
    this.formGroup2.patchValue({[index]: value});
    this.formGroup3.patchValue({[index]: value});
  }

  //Metodo para enviar los formularios
  onSubmitAllForms() {

    //Obtener el valor de input[3] para determinar la cantidad de contratos
    this.totalContracts = parseInt(this.inputs[3].value, 10); //Valor de cantidad de contratos

    if (
      this.formGroup1.valid &&
      this.formGroup2.valid &&
      this.formGroup3.valid &&
      this.totalContracts > 0
    ) {

      //Reiniciar contador e iteración de contratos
      this.currentContractIteration = 0;
      this.contractDataArray = []; //Reiniciar el array

      //Lógica para múltiples contratos
      this.showModal = true; //Mostrar modal para cada contrato
      this.processContractIteration(); //Procesar la primera iteración
    }
  }

  //Procesar cada iteración de contratos
  processContractIteration() {
    if (this.currentContractIteration < this.totalContracts) {
      console.log(`Procesando contrato ${this.currentContractIteration + 1} de ${this.totalContracts}`);

      if (this.formGroup4.valid) {

        //Guardar los datos del formulario en el array
        this.contractDataArray.push(this.formGroup4.value);

        //Avanzar a la siguiente iteración
        this.currentContractIteration++;
        if (this.currentContractIteration < this.totalContracts) {
          this.showModal = true; //Mostrar modal intermedio
        } else {
          this.showFinalModal = true; //Mostrar modal final
        }

        //Reiniciar el formulario para la siguiente iteración
        this.formGroup4.reset();
      } else {
        console.log('Formulario de contrato no válido');
      }
    } else {
      console.log('Todas las iteraciones han sido procesadas');
    }
  }

  //Metodo para enviar todos los contratos al servidor
  sendAllContracts() {
    const allFormsData = {
      form1: this.formGroup1.value,
      form2: this.formGroup2.value,
      form3: this.formGroup3.value,
      form4: this.contractDataArray,
    };

    console.log(allFormsData);
  }
}
