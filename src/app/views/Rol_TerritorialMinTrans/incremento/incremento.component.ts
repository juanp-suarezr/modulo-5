import {ChangeDetectorRef, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {FileUploadComponent} from "../../../components/file-upload/file-upload.component";
import {InputText} from "../../../components/input/input.component";
import {LeftNavComponent} from "../../../components/left-nav/left-nav.component";
import {PrimaryButtonComponent} from "../../../components/primary-button/primary-button.component";
import {SttepperComponent} from "../../../components/sttepper/sttepper.component";
import {ActiveNumService} from "../../../services/left-nav/active-num.service";
import {ActiveNumStepperService} from "../../../services/stepper/active-num.service";
import {ApiService} from "../../../services/api/api.service";
import {ErrorService} from "../../../services/error/error.service";
import {SelectComponent} from "../../../components/select/select.component";
import {AlertComponent} from "../../../components/alert/alert.component";
import {Router} from "@angular/router";
import {DEPARTAMENTOS} from '../../../shared/data/departamentos';
import {NUMEROSMESES} from '../../../shared/data/numerosmeses';
import {CLASEVEHICULOS} from "../../../shared/data/clasevehiculos";
import {FORMAPAGO} from "../../../shared/data/formapago";
import {TIEMPOSESTIMADOS} from "../../../shared/data/tiemposestimados";

@Component({
  selector: 'app-incremento',
  standalone: true,
  imports: [CommonModule, FileUploadComponent, InputText, LeftNavComponent, PrimaryButtonComponent, ReactiveFormsModule, SttepperComponent, SelectComponent, AlertComponent],
  templateUrl: './incremento.component.html',
  styleUrl: './incremento.component.css'
})
export default class IncrementoComponent {

  constructor(
    private stateService: ActiveNumService,
    private stepperService: ActiveNumStepperService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private errorService: ErrorService,
    private cdr: ChangeDetectorRef,
    private router: Router
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

  //Propiedad para almacenar el porcentaje seleccionado
  selectedPercentage: string = '';

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

    //Formulario 2 Solicitud
    //Input 1
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
    //Select 1 -> Numero de array = 1
    {
      name: 'SelectPropiedadEmpresa',
      required: true,
      placeholder: 'Seleccione',
      value: '',
      options: [
        {value: 7, label: '7%'},
        {value: 10, label: '10%'},
      ],
      good: 'Selección valida',
      error: 'Propiedad de la empresa es requerido',
    },
    //Input 2
    {
      name: 'resultado',
      type: 'number',
      placeholder: 'Resultado',
      label: 'Resultado',
      required: false,
      value: '',
    },

    //Formulario 3 Solicitud
    //Input 3
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
    //Input 4
    {
      name: 'Patrimonio_liquido',
      type: 'number',
      placeholder: '$100.000',
      label: 'Patrimonio Líquido en SMLV',
      required: true,
      value: '',
      error: 'Patrimonio Líquido en SMLV es obligatorio',
      good: 'Dato correcto',
    },

    //Formulario 4 Operativo
    //Contenido 1
    //Input 5
    {
      name: 'Cantidad de contratos',
      type: 'number',
      placeholder: '#',
      label: 'Cantidad de contratos*',
      required: true,
      value: '0',
      error: 'Cantidad de contratos es obligatorio',
      good: 'Dato correcto',
    },
    //Input 6
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
    //Input 7
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

    //Contenido 2
    //Input 8
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
    //Input 9
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
    //Select 2 - Numero de array = 10
    {
      name: 'SelectMeses',
      required: true,
      placeholder: 'Seleccione',
      value: '',
      options: NUMEROSMESES,
      good: 'Selección valida',
      error: 'Duración en meses es requerido',
    },

    //Contenido 3
    //Select 3 - Numero de array = 11
    {
      name: 'SelectNumeroVehiculosContrato',
      required: true,
      placeholder: 'Seleccione',
      value: '',
      options: [
        {value: '1', label: '1'},
        {value: '2', label: '2'},
        {value: '3', label: '3'},
      ],
      good: 'Selección valida',
      error: 'Numero de vehiculo / contrato es requerido',
    },
    //Select 4 - Numero de array = 12
    {
      name: 'SelectClaseVehiculo',
      required: true,
      placeholder: 'Seleccione',
      value: '',
      options: CLASEVEHICULOS,
      good: 'Selección valida',
      error: 'Clase de vehículo es requerido',
    },
    //Input 10
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
    //Contenido 4
    //Select 5 - Numero de array = 14
    {
      name: 'SelectFormaPago',
      required: true,
      placeholder: 'Seleccione',
      value: '',
      options: FORMAPAGO,
      good: 'Selección valida',
      error: 'Forma de pago es requerido',
    },
    //Select 6 - Numero de array = 15
    {
      name: 'SelectDepartamentos',
      required: true,
      placeholder: 'Seleccione',
      value: '',
      options: DEPARTAMENTOS,
      good: 'Selección valida',
      error: 'Áreas de Operación es requerido',
    },
    //Select 7 - Numero de array = 16
    {
      name: 'SelectTiemposEstimados',
      required: true,
      placeholder: 'Seleccione',
      value: '',
      options: TIEMPOSESTIMADOS,
      good: 'Selección valida',
      error: 'Tiempos estimados es requerido',
    },
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
      6: [null, Validators.required]
    });

    this.formGroup2 = this.fb.group({
      7: [null, Validators.required],
      8: [null, Validators.required],
      9: [null, Validators.required],
      10: [null, Validators.required],
      11: [null, Validators.required],
      0: ['', Validators.required],
      1: ['', Validators.required]
    });

    this.formGroup3 = this.fb.group({
      12: [null, Validators.required],
      3: ['', Validators.required],
      4: ['', Validators.required]
    });

    this.formGroup4 = this.fb.group({
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
      15: ['', Validators.required],
      16: ['', Validators.required],
    });

    //Suscribirse al servicio de manejo de errores
    this.errorService.errorStates$.subscribe((errorStates) => {
      this.errorStates = errorStates;
    });
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
      12: this.formGroup3,
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
      const inputElement = event.target as HTMLInputElement;
      value = inputElement?.value ?? ''; // Maneja valores nulos

      //Asumiendo que el `input-text` está en el índice 0
      if (index === 0 || index === 3 || index === 4 || index === 5 || index === 6 || index === 13) {
        //El valor no sea negativo
        value = Math.max(0, parseFloat(value) || 0);
        //El campo de entrada refleje el valor ajustado
        // @ts-ignore
        inputElement.value = value;
      }
    } else {
      // Maneja valores nulos
      value = event?.value ?? '';
    }

    // Actualiza el valor en el array de inputs
    this.inputs[index].value = value;

    // Actualiza los valores en los formularios reactivos
    this.formGroup2.patchValue({[index]: value});
    this.formGroup3.patchValue({[index]: value});
    this.formGroup4.patchValue({[index]: value});

    // Si el índice es 1 (select), actualiza el porcentaje seleccionado
    if (index === 1) {
      this.selectedPercentage = value ? `${value}%` : '';
    }

    // Si ya tienes ambos valores, realiza la multiplicación
    const numeroVehiculos = this.inputs[0].value ? parseFloat(this.inputs[0].value) : 0;
    const porcentaje = this.inputs[1].value ? parseFloat(this.inputs[1].value) : 0;

    if (numeroVehiculos && porcentaje) {
      const resultado = (numeroVehiculos * porcentaje) / 100;
      this.inputs[2].value = resultado.toFixed(2);
      this.formGroup2.patchValue({2: resultado.toFixed(2)});
    }
  }

  //Metodo para enviar los formularios
  onSubmitAllForms() {
    //Obtener el valor de input para determinar la cantidad de contratos
    if (this.currentContractIteration == 0) {
      //Valor de cantidad de contratos
      this.totalContracts = parseInt(this.inputs[5].value, 10);
    }

    if (
      // this.formGroup1.valid &&
      // this.formGroup2.valid &&
      // this.formGroup3.valid
      true
    ) {
      //Si el numero de contratos es mayor a 0
      if (this.totalContracts > 0) {
        console.log(this.totalContracts);
        //Si el form esta lleno con todos los datos
        if (this.validateFormGroup(this.formGroup4, this.errorStates)) {
          this.currentContractIteration += 1;
          //Lógica para múltiples contratos
          this.showModal = true; // Mostrar modal para cada contrato
        }
      } else {
        //Cuando ya llego al tope
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

  //Metodos Primer Modal
  handleClose() {
    console.log('Modal closed');
  }

  handleCloseByButton1() {
    this.processContractIteration();
    console.log('Modal closed by Button 1');
  }

  handleCloseByButton2() {
    console.log('Modal closed by Button 2');
  }

  handleCloseByIcon() {
    console.log('Modal closed by Close Icon');
  }

  handleCloseByBackdrop() {
    console.log('Modal closed by clicking on Backdrop');
  }

  finalStep() {
    this.showFinalModal = false;
    this.router.navigate(['/dashboard']).then(() => {
      location.reload();
    });
  }

  //Metodo Modal Final

  // Procesar cada iteración de contratos
  processContractIteration() {
    if (this.formGroup4.valid) {
      // Guardar los datos del formulario en el array

      this.contractDataArray.push(this.formGroup4.value);
      console.log(this.contractDataArray);
      this.inputs[3].value = (
        parseInt(this.inputs[3].value, 10) - 1
      ).toString();


      // Reiniciar el formulario para la siguiente iteración
      Object.keys(this.formGroup4.controls).forEach((key, index) => {
        if (index !== 0) {
          this.inputs[parseInt(key, 10)].value = '';
          // Si el índice NO es 0, reseteamos el control
          this.formGroup4.controls[key].reset();
          this.formGroup4.controls[key].markAsPristine();
          this.formGroup4.controls[key].markAsUntouched();
        }
      });

      // Forzamos la detección de cambios
      this.cdr.detectChanges();

      console.log(this.inputs);
    } else {
      console.log('Formulario de contrato no válido');
    }
  }

  //Metodo para enviar todos los contratos al servidor
  sendAllContracts() {

    if (this.totalContracts == 1) {
      this.contractDataArray.push(this.formGroup4.value);
    }

    const allFormsData = {
      form1: this.formGroup1.value,
      form2: this.formGroup2.value,
      form3: this.formGroup3.value,
      form4: this.contractDataArray,
    };

    console.log(allFormsData);
    this.showFinalModal = true;
  }
}