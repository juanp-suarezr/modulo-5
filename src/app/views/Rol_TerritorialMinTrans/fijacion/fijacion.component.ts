import { first } from 'rxjs';
import { OnlyNumberGlobal } from './../../../validator/onlyNumber.validator';
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
import { ApiSFService } from '../../../services/api/apiSF.service';

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
  constructor(
    private stateService: ActiveNumService,
    private stepperService: ActiveNumStepperService,
    private apiService: ApiService,
    private apiSFService: ApiSFService,
    private fb: FormBuilder,
    private errorService: ErrorService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      nit: string;
      nombreEmpresa: string;
    };

    if (state) {
      this.nit = state.nit;
      this.nombreEmpresa = state.nombreEmpresa;

      localStorage.setItem('nit', this.nit);
      localStorage.setItem('nombreEmpresa', this.nombreEmpresa);
    } else {
      // Recuperar de localStorage si está disponible
      this.nit = localStorage.getItem('nit') || '';
      this.nombreEmpresa = localStorage.getItem('nombreEmpresa') || '';
    }
  }

  parseInt: any;
  departs: any = [];
  ClaseVehiculo: any = [];
  formaPago: any = [];
  horas: any = [];

  submitted: boolean = false;

  //Capturar objetos del navigation
  nit: string = '';
  nombreEmpresa: string = '';

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

  //nombre contratos
  fileNames: { [key: number]: string[] } = [];

  //estado requerimiento
  smlmmv: number = 1300000;
  //validaciones requerimientos capita y patrimonio
  valid1: boolean = false;
  valid2: boolean = false;

  showModalRequisito: boolean = false; //control para mostrar modal de alerta requerimiento de patrimonio y capital
  showModal: boolean = false; // Control para mostrar el modal intermedio
  ShowLoadingModal: boolean = false; // Control para mostrar el modal loading
  showErrorModal: boolean = false; // Control para mostrar el modal error
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

  // Array para almacenar las opciones seleccionadas
  selectedOptions: any[] = [];

  //info selects
  selects = [
    //select clases vehiculos
    {
      name: 'idClaseVehiculo',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      selectedOption: '',
      errorMessage: 'Clase de vehículo es requerido',
      isDropdownOpen: false,
    },
    //select frecuencia pago
    {
      name: 'idFormaPago',
      required: true,
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      good: 'Selección correcta',
      errorMessage: 'Forma de pago es requerido',
      isDropdownOpen: false,
    },
    //select depart
    {
      name: 'idAreaOperacion',
      required: true,
      value: '', // Valor seleccionado
      good: 'Selección correcta',
      errorMessage: 'Áreas de Operación es requerido',
      isDropdownOpen: false,
    },
    //select tienpo estimado
    {
      name: 'disponibilidadVehiculosEstimada',
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

    //datos selects
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

    // Escuchar cambios en los campos 'fechaInicio' y 'fechaFin'
    this.formGroup4.get('fecha_inicio')?.valueChanges.subscribe(() => {
      this.updateDuration();
    });

    this.formGroup4.get('fecha_terminacion')?.valueChanges.subscribe(() => {
      this.updateDuration();
    });
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

    this.formGroup3 = this.fb.group(
      {
        capitalSocial: ['', Validators.required],
        patrimonioLiquido: ['', Validators.required],
        cantidadVehiculos: ['', Validators.required],
      },
      { validators: [NoNegativeGlobal] }
    );

    this.formGroup4 = this.fb.group(
      {
        cantidad_contratos: [
          { value: '', disabled: false },
          Validators.required,
        ],
        numeroContrato: ['', Validators.required],
        contratante: ['', Validators.required],
        fecha_inicio: ['', Validators.required],
        fecha_terminacion: ['', Validators.required],
        duracionMeses: ['', Validators.required],
        numeroVehiculos: ['', Validators.required],
        idClaseVehiculo: ['', Validators.required],
        valorContrato: ['', Validators.required],
        idFormaPago: ['', Validators.required],
        idAreaOperacion: ['', Validators.required],
        disponibilidadVehiculosEstimada: ['', Validators.required],
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

  // Método para alternar la selección de una opción
  toggleOption(option: any) {
    if (this.isSelected(option)) {
      this.selectedOptions = this.selectedOptions.filter(
        (selected) => selected.value !== option.value
      );
    } else {
      this.selectedOptions.push(option);
    }

    // Actualiza el control del formulario
    this.formGroup4.get('idClaseVehiculo')?.setValue(this.selectedOptions);
    console.log('Opciones seleccionadas:', this.selectedOptions);
  }

  // Verifica si una opción está seleccionada
  isSelected(option: any): boolean {
    return this.selectedOptions.some(
      (selected) => selected.value === option.value
    );
  }

  // Obtener las etiquetas de las opciones seleccionadas
  getSelectedLabels(): string {
    return this.selectedOptions.map((option) => option.label).join(', ');
  }

  selectMultipleOption(index: number, option: any, name: string) {
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

    this.apiService.getFormasPago().subscribe(
      (response) => {
        this.formaPago = response.detalle.map((formas: any) => ({
          value: formas.id,
          label: formas.descripcion,
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

  formattedValues: { [key: string]: string } = {};

  // Formatear número como moneda en pesos colombianos
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  }

  // Quitar el formato de moneda para obtener solo el número
  parseCurrency(value: string): number {
    return Number(value.replace(/[^0-9]+/g, '')); // Solo números
  }

  // Actualizar el valor del input mientras se escribe (con formateo instantáneo)
  onCurrencyInput(event: any, controlName: string, formGroup: FormGroup): void {
    const input = event.target;
    let value = input.value;

    // Eliminar cualquier carácter no permitido (solo números)
    value = value.replace(/[^0-9]/g, '');

    // Si no hay valor, establecer a vacío para permitir eliminar
    if (!value) {
      input.value = '';
      formGroup.get(controlName)?.setValue(null);
      return;
    }

    // Convertir el valor a número y actualizar en el formulario
    const numericValue = this.parseCurrency(value);
    formGroup.get(controlName)?.setValue(numericValue);

    // Formatear y mostrar el valor instantáneamente
    input.value = this.formatCurrency(numericValue);
  }

  // No realizar ningún cambio al enfocar, pero mantener el valor
  onCurrencyFocus(event: any): void {
    const input = event.target;
    input.value = input.value; // Mantiene el valor actual al enfocar
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
        console.log(this.formGroup1.value);
        if (this.validateFormGroup(this.formGroup1, this.errorStates)) {
          this.stepperService.setActiveNum(newValue);
          this.formGroup4.get('cantidad_contratos')?.disable();
          this.formGroup4.get('duracionMeses')?.disable();
          this.formGroup4
            .get('cantidad_contratos')
            ?.setValue(this.formGroup1.value[2].length);
        }
        break;
      case 3:
        if (this.validateFormGroup(this.formGroup2, this.errorStates)) {
          this.stepperService.setActiveNum(newValue);
        }
        break;
      case 4:
        console.log('entro');

        if (this.formGroup3.valid) {
          this.valid1 =
            this.formGroup3.get('capitalSocial')?.value >= 300 * this.smlmmv;
          this.valid2 =
            this.formGroup3.get('patrimonioLiquido')?.value < 180 * this.smlmmv;

          if (this.valid1 && this.valid2) {
            this.changeActiveNum('1');
            this.stepperService.setActiveNum(3);
          } else {
            console.log('no validado');
            this.showModalRequisito = true;
          }
        } else {
          this.submitted = true;
          this.formGroup3.markAllAsTouched();
          console.log(
            this.formGroup3.get('cantidadVehiculos')?.errors?.['required']
          );
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

  convertFilesToBase64(files: File[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const base64Array: string[] = [];

      files.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = (event: any) => {
          // Extraer solo la parte del código base64 sin el prefijo 'data:application/pdf;base64,'
          const base64String = event.target.result.split(',')[1];
          base64Array.push(base64String);

          // Si ya hemos procesado todos los archivos, resolvemos la promesa
          if (base64Array.length === files.length) {
            resolve(base64Array);
          }
        };

        reader.onerror = () => {
          reject(
            new Error(`Error al convertir el archivo ${file.name} a base64.`)
          );
        };

        reader.readAsDataURL(file);
      });
    });
  }

  //metodo para guardar el archivo seleccionado
  onFileSelected(file: File[], formControlName: number) {
    this.convertFilesToBase64(file)
      .then((base64Array) => {
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
          // Parchamos el form con los archivos en base64
          formGroup.patchValue({ [formControlName]: base64Array });

          // Solo para el cargador de archivos del formGroup1 y el control específico
          if (formControlName === 2 && formGroup === this.formGroup1) {
            // Inicializamos el array para almacenar los nombres de archivos truncados
            this.fileNames[1] = file.map((f, index) => {
              const maxLength = 20; // Longitud máxima para cada nombre
              const nameWithoutExt = f.name.split('.').slice(0, -1).join('.'); // Elimina la extensión
              const firstPart = `num_${index+1}__${this.nombreEmpresa}_${this.nit}_`;
              return nameWithoutExt.length > maxLength
                ? firstPart+(nameWithoutExt.substring(0, maxLength - 3) + '...')
                : firstPart+nameWithoutExt;
            });

            console.log(this.fileNames[1]);
          }
        }
      })
      .catch((error) => {
        console.error('Error al convertir los archivos:', error);
      });
  }

  //calcular duracion en meses
  updateDuration(): void {
    const fechaInicio = this.formGroup4.get('fecha_inicio')?.value;
    const fechaFin = this.formGroup4.get('fecha_terminacion')?.value;

    if (fechaInicio && fechaFin) {
      const duracionMeses = this.calculateMonthsDifference(
        new Date(fechaInicio),
        new Date(fechaFin)
      );
      this.formGroup4.get('duracionMeses')?.setValue(duracionMeses);
    }
  }

  // Calcular la duración en meses con decimales
  calculateMonthsDifference(startDate: Date, endDate: Date): number {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const yearDiff = end.getFullYear() - start.getFullYear();
      const monthDiff = end.getMonth() - start.getMonth();
      const dayDiff = end.getDate() - start.getDate();

      // Calcular la diferencia total en meses
      let totalMonths = yearDiff * 12 + monthDiff;

      // Ajustar el valor con la diferencia de días
      const daysInEndMonth = new Date(
        end.getFullYear(),
        end.getMonth() + 1,
        0
      ).getDate(); // Días en el mes final
      totalMonths += dayDiff / daysInEndMonth; // Agregar la fracción de mes

      return totalMonths;
    }
    return 0;
  }

  // Método para enviar los formularios
  onSubmitAllForms() {
    // Obtener el valor de input[3] para determinar la cantidad de contratos

    if (this.currentContractIteration == 0) {
      this.totalContracts = this.formGroup1.value[2].length; // Valor de cantidad de contratos
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
      this.formGroup4.get('duracionMeses')?.enable();
      this.contractDataArray.push(this.formGroup4.value);
      console.log(this.contractDataArray);
      let cantidad_din_contratos = (
        this.formGroup1.value[2].length - 1
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
          this.formGroup4.controls[key].reset();
          this.formGroup4.controls[key].markAsPristine();
          this.formGroup4.controls[key].markAsUntouched();
          this.formGroup4.get('duracionMeses')?.disable();
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
    this.ShowLoadingModal = true;
    if (
      this.totalContracts == 1 ||
      this.totalContracts == this.currentContractIteration
    ) {
      this.formGroup4.get('duracionMeses')?.enable();
      this.contractDataArray.push(this.formGroup4.value);
    }

    // Inicializar contratos como un array vacío
    let contratos: Array<{
      consecutivo: number;
      numeroContrato: any;
      contratante: any;
      fechaInicio: any;
      fechaFin: any;
      duracionMeses: any;
      numeroVehiculos: any;
      idClaseVehiculo: any;
      valorContrato: any;
      idFormaPago: any;
      idAreaOperacion: any;
      disponibilidadVehiculosEstimada: any;
      estado: boolean;
    }> = [];

    // Inicializar contratos como un array vacío
    let documentos: Array<{
      nit: string;
      documento: string;
    }> = [];

    this.contractDataArray.forEach((item, index) => {
      contratos.push({
        consecutivo: index,
        numeroContrato: item.numeroContrato,
        contratante: item.contratante,
        fechaInicio: item.fecha_inicio,
        fechaFin: item.fecha_terminacion,
        duracionMeses: item.duracionMeses,
        numeroVehiculos: item.numeroVehiculos,
        idClaseVehiculo: [
          item.idClaseVehiculo.map((i: { value: any }) => i.value),
        ],
        valorContrato: item.valorContrato,
        idFormaPago: item.idFormaPago.value,
        idAreaOperacion: item.idAreaOperacion.value,
        disponibilidadVehiculosEstimada:
          item.disponibilidadVehiculosEstimada.value,
        estado: true,
      });
    });

    console.log(contratos);

    // Rellenar el array documentos
    this.formGroup1.value[2].forEach((item: any) => {
      documentos.push({
        nit: this.nit,
        documento: item,
      });
    });

    const allFormsData = {
      fechaSolicitud: new Date(),
      nombreEmpresa: this.nombreEmpresa,
      nit: this.nit,
      territorial: 'Bogota',
      idEstadoSolicitud: 123,
      idCategoriaSolicitud: 149,
      excelModeloTransporte: '',
      radicadoEntrada: '',
      certificadoCumplimiento: '',
      cumplimiento: '',
      estado: true,
      solicitudFijacionCapacidad: this.formGroup1.value[1][0],
      planRodamiento: this.formGroup1.value[3][0],
      estructuraCostosBasicos: this.formGroup1.value[4][0],
      certificadoExistencia: this.formGroup1.value[5][0],
      registroUnicoTributario: this.formGroup1.value[6][0],
      resolucionHabilitacion: this.formGroup2.value[7][0],
      cedulaRepresentante: this.formGroup2.value[8][0],
      estadosFinancieros: this.formGroup2.value[9][0],
      cedulaContador: this.formGroup2.value[10][0],
      tarjetaProfesionalContador: this.formGroup2.value[11][0],
      capitalSocial: this.formGroup3.get('capitalSocial')?.value,
      patrimonioLiquido: this.formGroup3.get('patrimonioLiquido')?.value,
      cantidadVehiculos: this.formGroup3.get('cantidadVehiculos')?.value,
      contratos: contratos,
      documentos: documentos,
    };

    console.log(allFormsData);
    this.apiSFService.createSolicitud(allFormsData).subscribe(
      (response) => {
        // Aquí puedes manejar la respuesta, por ejemplo:
        this.ShowLoadingModal = false;
        this.showFinalModal = true;
        console.log('Datos enviados exitosamente:', response);
      },
      (error) => {
        this.ShowLoadingModal = false;
        this.showErrorModal = true;
        // Manejo del error
        console.error('Error al enviar los datos:', error);
      }
    );
  }
}
