import { ErrorService } from '../../../services/error/error.service';
import { PrimaryButtonComponent } from '../../../components/primary-button/primary-button.component';
import { ActiveNumService } from '../../../services/left-nav/active-num.service';
import { ActiveNumStepperService } from '../../../services/stepper/active-num.service';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { LeftNavComponent } from '../../../components/left-nav/left-nav.component';
import { SttepperComponent } from '../../../components/sttepper/sttepper.component';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';
import { CommonModule } from '@angular/common';
//servicios de consultas api
import { ApiService } from '../../../services/api/api.service';
import { InputText } from '../../../components/input/input.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SelectComponent } from '../../../components/select/select.component';
import { MESES } from '../../../shared/data/meses';
import { AlertComponent } from '../../../components/alert/alert.component';
import { Router } from '@angular/router';
import { dateRangeValidator } from '../../../validator/date.validator';
import { HORAS } from '../../../shared/data/horas';
import { NoNegativeGlobal } from '../../../validator/noNegative.validator';

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
    AlertComponent,
  ],
  templateUrl: './fijacion.component.html',
  styleUrl: './fijacion.component.css',
})
export default class FijacionComponent {
  parseInt: any;
  departs: any = [];
  ClaseVehiculo: any = [];
  meses: { value: string; label: string }[] = [];
  formaPago: any = [];
  horas: any = [];

  submitted: boolean = false;

  constructor(
    private stateService: ActiveNumService,
    private stepperService: ActiveNumStepperService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private errorService: ErrorService,
    private cdr: ChangeDetectorRef,
    private router: Router
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

  //info selects
  selects = [
    //cantidad vehiculos
    {
      name: 'vehiculos_requeridos',
      required: true,
      placeholder: 'Lista desplegable de números',
      value: '', // Valor seleccionado
      options: this.generateOptions(15),
      good: 'Selección correcta',
      errorMessage: 'Cantidad de vehículos es requerido',
      isDropdownOpen: false,
    },
    //select meses
    {
      name: 'duracion',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      good: 'Selección correcta',
      errorMessage: 'Duración en meses es requerido',
      isDropdownOpen: false,
    },
    //select clases vehiculos
    {
      name: 'ClaseVehiculo',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      selectedOption: '',
      errorMessage: 'Clase de vehículo es requerido',
      isDropdownOpen: false,
    },
    //select frecuencia pago
    {
      name: 'forma_pago',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      good: 'Selección correcta',
      errorMessage: 'Forma de pago es requerido',
      isDropdownOpen: false,
    },
    //select depart
    {
      name: 'area_operacion',
      required: true,
      value: '', // Valor seleccionado
      good: 'Selección correcta',
      errorMessage: 'Áreas de Operación es requerido',
      isDropdownOpen: false,
    },
    //select tienpo estimado
    {
      name: 'disponibilidad',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      good: 'Selección correcta',
      errorMessage: 'Tiempos estimados es requerido',
      isDropdownOpen: false,
    },
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

    //datos selects
    this.meses = MESES;
    this.formaPago = [
      { value: 'Diario', label: 'Diario' },
      { value: 'Mensual', label: 'Mensual' },
      { value: 'Anual', label: 'Anual' },
    ];
    this.horas = HORAS;

    this.initializeForm();
    // Configuración inicial del FormGroup

    //suscribirse al servicio de manejo de errores
    this.errorService.errorStates$.subscribe((errorStates) => {
      this.errorStates = errorStates;
    });
  }

  ngAfterViewInit() {
    this.loadOptions();
  }

  initializeForm() {
    // Aquí defines tu formulario
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
      capital_social: ['', [Validators.required, NoNegativeGlobal]],
      patrimonio_liquido: ['', [Validators.required, NoNegativeGlobal]],
      vehiculos_requeridos: ['', Validators.required],
    });

    this.formGroup4 = this.fb.group(
      {
        cantidad_contratos: [{ value: '', disabled: false }, Validators.required],
        contrato: ['', Validators.required],
        contratante: ['', Validators.required],
        fecha_inicio: ['', Validators.required],
        fecha_terminacion: ['', Validators.required],
        duracion: ['', Validators.required],
        num_vehiculos: ['', Validators.required],
        ClaseVehiculo: ['', Validators.required],
        val_contrato: ['', Validators.required],
        forma_pago: ['', Validators.required],
        area_operacion: ['', Validators.required],
        disponibilidad: ['', Validators.required],
      },
      { validators: [dateRangeValidator, NoNegativeGlobal] }
    );
  }

  toggleDropdown(index: number) {
    this.selects[index].isDropdownOpen = !this.selects[index].isDropdownOpen;
  }

  selectOption(index: number, option: any, name: string) {
    this.selects[index].value = option;
    this.selects[index].isDropdownOpen = false;
    this.formGroup3.get(name)?.setValue(option);
    this.formGroup4.get(name)?.setValue(option);
  }

  loadOptions() {
    //clases vehiculos
    this.apiService.getClaseVehiculo().subscribe(
      (response) => {
        this.ClaseVehiculo = response.detalle.map((clase: any) => ({
          value: clase.id,
          label: clase.descripcion,
        }));
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );
    //departamentos
    this.apiService.getDeparts().subscribe(
      (response) => {
        this.departs = response.map((departamento: any) => ({
          value: departamento.id,
          label: departamento.descripcion,
        }));
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );
  }

  // Generar opciones de numeros para los selects
  generateOptions(max: number) {
    return Array.from({ length: max }, (_, i) => ({
      value: i + 1,
      label: i + 1,
    }));
  }

  //formatear texto a int
  convertToNumber(value: string) {
    const textValue = parseInt(value, 10);

    if (isNaN(textValue)) {
      return 0;
    } else {
      return textValue;
    }
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
      console.log("entro");

        if (this.formGroup3.valid) {
          this.changeActiveNum('1');
          this.stepperService.setActiveNum(3);
        } else {
          this.submitted = true;
          this.formGroup3.markAllAsTouched();
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

  // Método para enviar los formularios
  onSubmitAllForms() {
    // Obtener el valor de input[3] para determinar la cantidad de contratos

    if (this.currentContractIteration == 0) {
      this.totalContracts = parseInt(
        this.formGroup4.get('cantidad_contratos')?.value,
        10
      ); // Valor de cantidad de contratos
    }

    if (
      // this.formGroup1.valid &&
      // this.formGroup2.valid &&
      // this.formGroup3.valid
      true
    ) {
      //si el numero de contratos es mayor a 0
      if (this.totalContracts > 0) {
        this.submitted = true;
        this.formGroup4.markAllAsTouched();

        if (this.formGroup4.valid) {
          console.log('entro');

          this.currentContractIteration += 1;
          // Lógica para múltiples contratos
          this.showModal = true; // Mostrar modal para cada contrato
        }
      } else {
        //cuando ya llego al tope
        this.submitted = true;
        this.formGroup4.markAllAsTouched();
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

  // modal

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

  //fin MODAL

  // Procesar cada iteración de contratos
  processContractIteration() {
    if (this.formGroup4.valid) {
      // Guardar los datos del formulario en el array

      this.contractDataArray.push(this.formGroup4.value);
      console.log(this.contractDataArray);
      let cantidad_din_contratos = (
        parseInt(this.formGroup4.get('cantidad_contratos')?.value, 10) - 1
      ).toString();

      this.formGroup4
        .get('cantidad_contratos')
        ?.setValue(cantidad_din_contratos);
      // Reiniciar el formulario para la siguiente iteración
      Object.keys(this.formGroup4.controls).forEach((key, index) => {
        if (index !== 0) {
          console.log(key);

          const selectItem = this.selects.find((item) => item.name == key);
          if (selectItem) {
            selectItem.value = '';
          } else {
            console.error(`No se encontró un elemento con name ${key}`);
          }

          // Si el índice NO es 0, reseteamos el control
          this.submitted = false;
          this.formGroup4.get('cantidad_contratos')?.disable();
          this.formGroup4.controls[key].reset();
          this.formGroup4.controls[key].markAsPristine();
          this.formGroup4.controls[key].markAsUntouched();
        }
      });

      // Forzamos la detección de cambios
      this.cdr.detectChanges();

    } else {
      console.log('Formulario de contrato no válido');
    }
  }

  // Método para enviar todos los contratos al servidor
  sendAllContracts() {
    if (this.totalContracts == 1 || this.totalContracts == this.currentContractIteration) {
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

    // this.apiService.sendContractForms(allFormsData).subscribe(
    //   (response) => {
    //     console.log('Formularios enviados exitosamente');
    //     // Realizar acciones adicionales si es necesario
    //   },
    //   (error) => console.error('Error enviando los formularios', error)
    // );
  }
}
