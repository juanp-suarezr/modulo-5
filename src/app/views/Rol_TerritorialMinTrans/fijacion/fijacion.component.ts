import {first, BehaviorSubject} from 'rxjs';
import {OnlyNumberGlobal} from './../../../validator/onlyNumber.validator';
import {ErrorService} from '../../../services/error/error.service';
import {PrimaryButtonComponent} from '../../../components/primary-button/primary-button.component';
import {ActiveNumService} from '../../../services/left-nav/active-num.service';
import {ActiveNumStepperService} from '../../../services/stepper/active-num.service';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {LeftNavComponent} from '../../../components/left-nav/left-nav.component';
import {SttepperComponent} from '../../../components/sttepper/sttepper.component';
import {FileUploadComponent} from '../../../components/file-upload/file-upload.component';
import {CommonModule} from '@angular/common';
//servicios de consultas api
import {ApiService} from '../../../services/api/api.service';
import {InputText} from '../../../components/input/input.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
  FormArray,
} from '@angular/forms';
import {SelectComponent} from '../../../components/select/select.component';
import {MESES} from '../../../shared/data/meses';
import {AlertComponent} from '../../../components/alert/alert.component';
import {Router} from '@angular/router';
import {dateRangeValidator} from '../../../validator/date.validator';
import {HORAS} from '../../../shared/data/horas';
import {NoNegativeGlobal} from '../../../validator/noNegative.validator';
import {ApiSFService} from '../../../services/api/apiSF.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {DialogModule} from 'primeng/dialog';
import {ProgressSpinnerModule} from 'primeng/progressspinner';

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
    DialogModule,
    ProgressSpinnerModule,
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
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      nit: string;
      nombreEmpresa: string;
      idSolicitud: string;
    };

    if (state) {
      this.nit = state.nit;
      this.nombreEmpresa = state.nombreEmpresa;
      this.idSolicitud = state.idSolicitud;
      console.log(state.idSolicitud);
      console.log(this.idSolicitud);

      localStorage.setItem('nit', this.nit);
      localStorage.setItem('nombreEmpresa', this.nombreEmpresa);
      this.setIdSolicitud(this.idSolicitud);
    } else {
      // Recuperar de localStorage si está disponible
      this.nit = localStorage.getItem('nit') || '';
      this.nombreEmpresa = localStorage.getItem('nombreEmpresa') || '';
      this.setIdSolicitud(localStorage.getItem('idSolicitud') || '');
    }
  }

  //loadingInicial
  loadingInicio: boolean = true;

  //view archivo blob
  documentUrl: SafeResourceUrl | undefined;
  displayModal: boolean = false;

  parseInt: any;
  departs: any = [];
  ClaseVehiculo: any = [];
  formaPago: any = [];
  horas: any = [];

  submitted: boolean = false;

  //Capturar objetos del navigation
  nit: string = '';
  nombreEmpresa: string = '';

  //observable option
  private idSolicitudSubject = new BehaviorSubject<string>(''); // Inicializa con un valor vacío
  idSolicitud$ = this.idSolicitudSubject.asObservable(); // Observable para observar cambios
  idSolicitud: any; // Variable para almacenar el idSolicitudidSolicitud: string = '';

  //solicitud contratos
  contratosSolicitud: any;

  //solicitud guardada
  solicitudGuardada: any;

  //identificador de actualización de file
  isActuFile: [number] = [-1];

  //si es valido el form en operativo
  IsvalidOperativo: boolean = false;

  //manejo de varios contratos guardados
  currentIndex = 0;
  maxVisibleFiles = 2;

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

  //form dinamico num vehiculos
  activeHeader: number | null = null;

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
  showModalContinuar: boolean = false; //control para mostrar modal de desea continuar
  showModalContinuar1: boolean = false; //control para mostrar modal de desea continuar operativo
  //number to continue modal
  numberTocontinue: number = 0;

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
  selectedOptionsClase: any[] = [];
  selectedOptionsDeparts: any[] = [];

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
      placeholder: 'Seleccione',
      value: '', // Valor seleccionado
      selectedOption: '',
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

  setIdSolicitud(newId: string): void {
    this.idSolicitudSubject.next(newId); // Cambia el valor del BehaviorSubject
    this.idSolicitud = newId; // Actualiza la variable local
  }

  ngOnInit(): void {
    // Suscribirse al observable para obtener los cambios reactivos del menuleft
    this.stateService.activeNum$.subscribe((num) => {
      this.activeNum = num;
    });

    // Suscribirse al observable del servicio de stepper
    this.stepperService.activeStep$.subscribe((step) => {
      this.activeStep = step;
    });

    //datos selects
    this.horas = HORAS;

    this.initializeForm();
    // Configuración inicial del FormGroup

    //suscribirse al servicio de manejo de errores
    this.errorService.errorStates$.subscribe((errorStates) => {
      this.errorStates = errorStates;
    });

    // Suscribirse a los cambios en idSolicitud
    this.loadingInicio = true;
    this.idSolicitud$.subscribe((newId) => {
      localStorage.setItem('idSolicitud', newId);
      this.loadingInicio = false;
      if (newId != '' && newId != 'undefined' && newId != undefined) {
        this.loadingInicio = true;
        //GET SOLICITUD
        this.apiSFService.getSolicitudByID(newId).subscribe(
          (response) => {
            this.solicitudGuardada = response;
            this.loadingInicio = true;
            //GET DOCUMENTOS
            this.apiSFService.getDocumentosByID(response.id).subscribe(
              (response1) => {
                console.log("respuesta contratos:::::::::", response1);

                this.loadingInicio = false;
                // Crear un array de contratos
                const contratosArray = response1.map((element: any) => ({
                  nit: element.nit,
                  id: element.id,
                  documento: this.displayFile(element.documento),
                }));

                // Guardar el array en formGroup1[0]
                this.formGroup1.patchValue({
                  [2]: contratosArray,
                });

                this.fileNames[1] = response1.map((f: any, index: number) => {
                  const firstPart = `consecutivo_${index + 1}__${this.nit}_${
                    this.nombreEmpresa
                  }__`;
                  return firstPart;
                });
              },
              (error) => {
                console.error('Error fetching user data', error);
              }
            );

            //GET CONTRATOS
            this.apiSFService.getContratosByIDSolicitud(response.id).subscribe(
              (response2) => {
                console.log('respuesta 2:::::::::::', response2);

                this.loadingInicio = false;
                this.contratosSolicitud = response2;

                // Recorremos todos los contratos de la solicitud
                response2.forEach((contrato: any) => {
                  console.log(contrato);
                  // Actualizamos los campos principales del formulario con el valor del primer contrato (solo para campos "globales")
                  if (response2.indexOf(contrato) === 0) {
                    console.log('entro1111');

                    this.formGroup4.patchValue({
                      numeroContrato: contrato.numeroContrato || '',
                      contratante: contrato.contratante || '',
                      fecha_inicio: contrato.fechaInicio || '',
                      fecha_terminacion: contrato.fechaFin || '',
                      duracionMeses: contrato.duracionMeses || '',
                      numeroVehiculos: contrato.numeroVehiculos || '',
                      idClaseVehiculo: contrato.idClaseVehiculo
                        ? contrato.idClaseVehiculo.map(
                          (element: any) => element.idClaseVehiculo
                        )
                        : '',
                      valorContrato: contrato.valorContrato || '',
                      idFormaPago: contrato.idFormaPago || '',
                      idAreaOperacion: contrato.idAreaOperacion || '',
                      disponibilidadVehiculosEstimada:
                        contrato.disponibilidadVehiculosEstimada || '',
                      idClaseVehiculos: contrato.vehiculos,
                    });

                    this.selects[1].value = contrato.idFormaPago || '';
                    this.selects[3].value =
                      contrato.disponibilidadVehiculosEstimada || '';
                  }

                  console.log(this.formGroup4);
                });
              },
              (error) => {
                console.error('Error fetching user data', error);
              }
            );

            (this.nombreEmpresa = response.nombreEmpresa),
              (this.nit = response.nit),
              this.formGroup1.patchValue({
                [1]: this.displayFile(response.solicitudFijacionCapacidad),
              });

            this.formGroup1.patchValue({
              [3]: this.displayFile(response.planRodamiento),
            });
            this.formGroup1.patchValue({
              [4]: this.displayFile(response.estructuraCostosBasicos),
            });
            this.formGroup1.patchValue({
              [5]: this.displayFile(response.certificadoExistencia),
            });
            this.formGroup1.patchValue({
              [6]: this.displayFile(response.registroUnicoTributario),
            });
            this.formGroup2.patchValue({
              [7]: this.displayFile(response.resolucionHabilitacion),
            });
            this.formGroup2.patchValue({
              [8]: this.displayFile(response.cedulaRepresentante),
            });
            this.formGroup2.patchValue({
              [9]: this.displayFile(response.estadosFinancieros),
            });
            this.formGroup2.patchValue({
              [10]: this.displayFile(response.cedulaContador),
            });
            this.formGroup2.patchValue({
              [11]: this.displayFile(response.tarjetaProfesionalContador),
            });

            this.formGroup3.patchValue({
              ['capitalSocial']: response.capitalSocial,
            });

            this.formGroup3.patchValue({
              ['patrimonioLiquido']: response.patrimonioLiquido,
            });

            this.formGroup3.patchValue({
              ['cantidadVehiculos']: response.cantidadVehiculos,
            });

            console.log(response);
          },
          (error) => {
            console.error('Error fetching user data', error);
          }
        );
      }
    });

    // Forzar detección de cambios
    this.cdr.detectChanges();
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
      {validators: [NoNegativeGlobal]}
    );

    this.formGroup4 = this.fb.group(
      {
        cantidad_contratos: [
          {value: '', disabled: false},
          Validators.required,
        ],
        numeroContrato: ['', Validators.required],
        contratante: ['', Validators.required],
        fecha_inicio: ['', Validators.required],
        fecha_terminacion: ['', Validators.required],
        duracionMeses: ['', Validators.required],
        numeroVehiculos: [''],
        idClaseVehiculo: ['', Validators.required],
        valorContrato: ['', Validators.required],
        idFormaPago: ['', Validators.required],
        idAreaOperacion: ['', Validators.required],
        disponibilidadVehiculosEstimada: ['', Validators.required],
        idClaseVehiculos: this.fb.array([]), // FormArray para manejar las clases de vehículos seleccionadas
      },
      {validators: [dateRangeValidator, NoNegativeGlobal]}
    );
  }

  // Obtener el FormArray de clases de vehículos
  get idClaseVehiculos(): FormArray {
    return this.formGroup4.get('idClaseVehiculos') as FormArray;
  }

  deleteFile(num: number, index?: number) {
    switch (num) {
      case 1:
        this.formGroup1.get(num.toString())?.setValue('');
        break;

      case 2:
        const posicion = index ?? 0;

        this.formGroup1.get(num.toString())?.value[posicion] == '';
        break;

      case 3:
        this.formGroup1.get(num.toString())?.setValue('');
        break;

      case 4:
        this.formGroup1.get(num.toString())?.setValue('');
        break;

      case 5:
        this.formGroup1.get(num.toString())?.setValue('');
        break;

      case 6:
        this.formGroup1.get(num.toString())?.setValue('');
        break;

      case 7:
        this.formGroup2.get(num.toString())?.setValue('');
        break;

      case 8:
        this.formGroup2.get(num.toString())?.setValue('');
        break;

      case 9:
        this.formGroup2.get(num.toString())?.setValue('');
        break;

      case 10:
        this.formGroup2.get(num.toString())?.setValue('');
        break;

      case 11:
        this.formGroup2.get(num.toString())?.setValue('');
        break;

      default:
        break;
    }
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
  toggleOption(option: any, nameForm: string) {
    if (this.isSelected(option, nameForm)) {
      if (nameForm == 'idAreaOperacion') {
        this.selectedOptionsDeparts = this.selectedOptionsDeparts.filter(
          (selected) => selected.value !== option.value
        );
      } else {
        this.selectedOptionsClase = this.selectedOptionsClase.filter(
          (selected) => selected.value !== option.value
        );
        this.removeVehiculoControl(option); // Eliminar el control del FormArray
      }
    } else {
      if (nameForm == 'idAreaOperacion') {
        this.selectedOptionsDeparts.push(option);
      } else {
        this.selectedOptionsClase.push(option);
        this.addVehiculoControl(option); // Añadir el control al FormArray
      }
    }

    // Actualiza el control del formulario
    if (nameForm == 'idAreaOperacion') {
      this.formGroup4.get(nameForm)?.setValue(this.selectedOptionsDeparts);
    } else {
      this.formGroup4.get(nameForm)?.setValue(this.selectedOptionsClase);
    }
  }

  // Añadir control dinámico para la clase de vehículo seleccionada
  addVehiculoControl(option: any) {
    const vehiculoGroup = this.fb.group({
      idClaseVehiculo: [option.value, Validators.required],
      cantidadVehiculos: ['', [Validators.required, Validators.min(1)]],
    });
    this.idClaseVehiculos.push(vehiculoGroup);
  }

  // Eliminar control dinámico cuando se deselecciona una clase
  removeVehiculoControl(option: any) {
    const index = this.idClaseVehiculos.controls.findIndex(
      (ctrl) => ctrl.value.idClaseVehiculo === option.value
    );
    if (index !== -1) {
      this.idClaseVehiculos.removeAt(index);
    }
  }

  // Verifica si una opción está seleccionada
  isSelected(option: any, nameForm: string): boolean {
    if (nameForm == 'idAreaOperacion') {
      return this.selectedOptionsDeparts.some(
        (selected) => selected.value === option.value
      );
    } else {
      return this.selectedOptionsClase.some(
        (selected) => selected.value === option.value
      );
    }
  }

  // Obtener las etiquetas de las opciones seleccionadas
  getSelectedLabels(nameForm: string): string {
    if (nameForm == 'idAreaOperacion') {
      return this.selectedOptionsDeparts
        .map((option) => option.label)
        .join(', ');
    } else {
      return this.selectedOptionsClase.map((option) => option.label).join(', ');
    }
  }

  getSelectedLabelsHeaders(): any {
    return this.selectedOptionsClase.map((option) => option.label);
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
    //formas de pago
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
    return Array.from({length: max}, (_, i) => ({
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
    if (
      this.formGroup1.valid &&
      this.formGroup2.valid &&
      this.formGroup3.valid
    ) {
      this.stateService.setActiveNum(newValue);
    }
  }

  //modal continuar sin guardar
  goToModal(num: number) {
    this.showModalContinuar = true;
    this.numberTocontinue = num;
  }

  // Método para cambiar el valor del stepper
  async changeActiveStep(
    newValue: number,
    saved: boolean,
    back: boolean = false
  ) {
    switch (newValue) {
      case 1:
        this.stepperService.setActiveNum(newValue);
        break;
      case 2:
        //validator

        if (this.validateFormGroup(this.formGroup1, this.errorStates)) {
          //valida si se va a guardar la info
          if (saved) {
            this.ShowLoadingModal = true;
            const data1 = await this.datosPaso1();

            //valida si ya hay una solicitud guardada
            if (
              this.idSolicitud == '' ||
              this.idSolicitud === 'undefined' ||
              this.idSolicitud === undefined
            ) {
              //CREA SOLICITUD
              this.apiSFService.createSolicitud(data1).subscribe(
                (response) => {
                  this.isActuFile = [-1];
                  const parsedData = JSON.parse(response);

                  // Aquí puedes manejar la respuesta, por ejemplo:
                  this.ShowLoadingModal = false;
                  console.log('Datos enviados exitosamente:', parsedData);
                  this.idSolicitud = parsedData.id_solicitud;
                  localStorage.setItem('idSolicitud', this.idSolicitud);

                  this.stepperService.setActiveNum(newValue);
                  this.formGroup4
                    .get('cantidad_contratos')
                    ?.setValue(this.formGroup1.value[2].length);
                  // Forzar detección de cambios
                  this.cdr.detectChanges();
                },
                (error) => {
                  this.ShowLoadingModal = false;
                  this.showErrorModal = true;
                  // Manejo del error
                  console.error('Error al enviar los datos:', error);
                }
              );
            } else {
              //cuando ya hay solicitud creada
              console.log('solocitud' + this.idSolicitud);
              this.ActualizarSolicitud(1, data1);
            }
          } else {
            //Continuar Sin guardar
            this.ShowLoadingModal = false;
            this.stepperService.setActiveNum(newValue);
            this.formGroup4
              .get('cantidad_contratos')
              ?.setValue(this.formGroup1.value[2].length);
          }

          this.formGroup4.get('cantidad_contratos')?.disable();
          this.formGroup4.get('duracionMeses')?.disable();
        } else if (back == true) {
          this.stepperService.setActiveNum(newValue);
        }
        break;
      case 3:
        if (this.validateFormGroup(this.formGroup2, this.errorStates)) {
          //valida si se requiere guardar
          if (saved) {
            this.ShowLoadingModal = true;

            const data1 = await this.datosPaso1();
            console.log(data1);

            // Ahora puedes continuar con el envío de los datos
            if (
              this.idSolicitud == '' ||
              this.idSolicitud === 'undefined' ||
              this.idSolicitud === undefined
            ) {
              //crear solicitud
              this.apiSFService.createSolicitud(data1).subscribe(
                (response) => {
                  const parsedData = JSON.parse(response);

                  // Aquí puedes manejar la respuesta, por ejemplo:
                  console.log('Datos enviados exitosamente:', parsedData);
                  this.idSolicitud = parsedData.id_solicitud;
                  localStorage.setItem('idSolicitud', this.idSolicitud);

                  this.ActualizarSolicitud(2);
                },
                (error) => {
                  this.ShowLoadingModal = false;
                  this.showErrorModal = true;
                  console.error('Error al enviar los datos:', error);
                }
              );
            } else {
              this.ActualizarSolicitud(1, data1, 'opcion2');
            }
          } else {
            //continuar sin guardar
            this.ShowLoadingModal = false;
            this.stepperService.setActiveNum(newValue);
          }
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
            if (saved) {
              this.ShowLoadingModal = true;
              //valida si se trae el id (ya realizó el primer cargue)
              const data1 = await this.datosPaso1();
              if (
                this.idSolicitud == '' ||
                this.idSolicitud === 'undefined' ||
                this.idSolicitud === undefined
              ) {
                this.apiSFService.createSolicitud(data1).subscribe(
                  (response) => {
                    // Aquí puedes manejar la respuesta, por ejemplo:

                    const parsedData = JSON.parse(response);

                    // Aquí puedes manejar la respuesta, por ejemplo:
                    console.log('Datos enviados exitosamente:', parsedData);
                    this.idSolicitud = parsedData.id_solicitud;
                    localStorage.setItem('idSolicitud', this.idSolicitud);
                    this.ActualizarSolicitud(2, 0, 'opcion3');
                  },
                  (error) => {
                    this.ShowLoadingModal = false;
                    this.showErrorModal = true;
                    // Manejo del error
                    console.error('Error al enviar los datos:', error);
                  }
                );
              } else {
                //envia solo a actualizar el paso1, paso 2, paso3
                this.ActualizarSolicitud(1, data1, 'opcion3');
              }
            } else {
              //continuar sin guardar
              this.ShowLoadingModal = false;
              this.stepperService.setActiveNum(3);
              this.changeActiveNum('1');
            }
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
  }

  //datos paso 1
  async datosPaso1() {
    // Rellenar el array de documentos con una conversión asíncrona para cada Blob

    const documentoPromises = this.formGroup1.value[2].map(
      async (item: any) => {
        let documento = item.documento ?? item;

        if (documento instanceof Blob) {
          // Convertir Blob a base64

          const base64String = await this.convertirBlob(item.documento);
          return {
            nit: this.nit,
            documento: base64String,
            id: item.id,
          };
        } else {
          // Si no es Blob, lo añadimos directamente
          return {
            nit: this.nit,
            documento: item.documento ?? item,
          };
        }
      }
    );

    // Convertir los valores que pueden ser Blob a Base64 (sin incluir los documentos, ya procesados)
    try {
      const [
        solicitudFijacionCapacidad,
        planRodamiento,
        estructuraCostosBasicos,
        certificadoExistencia,
        registroUnicoTributario,
        documentos,
      ] = await Promise.all([
        this.convertirSiEsBlob(this.formGroup1.value[1]), // solicitudFijacionCapacidad
        this.convertirSiEsBlob(this.formGroup1.value[3]), // planRodamiento
        this.convertirSiEsBlob(this.formGroup1.value[4]), // estructuraCostosBasicos
        this.convertirSiEsBlob(this.formGroup1.value[5]), // certificadoExistencia
        this.convertirSiEsBlob(this.formGroup1.value[6]), // registroUnicoTributario
        Promise.all(documentoPromises), // documentos
      ]);

      // Creación del objeto data1 con todos los campos procesados
      const data1 = {
        fechaSolicitud: new Date(),
        nombreEmpresa: this.nombreEmpresa,
        nit: this.nit,
        territorial: 'Territorial de Antioquia',
        idCategoriaSolicitud: 149,
        solicitudFijacionCapacidad,
        planRodamiento,
        estructuraCostosBasicos,
        certificadoExistencia,
        registroUnicoTributario,
        documentos,
      };

      return data1; // Retorna el objeto data1
    } catch (error) {
      console.error('Error en la conversión de archivos:', error);
      this.ShowLoadingModal = false;
      throw error; // Propaga el error si lo hay
    }
  }

  //actualizar solicitudes
  ActualizarSolicitud(
    num: number,
    data?: any,
    opcion?: string,
    notChange?: boolean
  ) {
    this.isActuFile = [-1];
    switch (num) {
      case 1:
        console.log(data);

        //put paso 1 actualizar - cargue 1
        this.apiSFService.SolicitudPaso1(this.idSolicitud, data).subscribe(
          (response) => {
            // Aquí puedes manejar la respuesta, por ejemplo:

            if (opcion == 'opcion2') {
              this.ActualizarSolicitud(2);
            } else if (opcion == 'opcion3') {
              this.ActualizarSolicitud(2, 0, 'opcion3');
            } else {
              this.ShowLoadingModal = false;
              this.stepperService.setActiveNum(num + 1);
            }
            console.log('Datos enviados exitosamente:', response);
          },
          (error) => {
            this.ShowLoadingModal = false;
            this.showErrorModal = true;
            // Manejo del error
            console.error('Error al enviar los datos:', error);
          }
        );
        break;

      case 2:
        // Convertir valores que pueden ser Blob a Base64 (para los archivos en data2)
        Promise.all([
          this.convertirSiEsBlob(this.formGroup2.value[7]), // resolucionHabilitacion
          this.convertirSiEsBlob(this.formGroup2.value[8]), // cedulaRepresentante
          this.convertirSiEsBlob(this.formGroup2.value[9]), // estadosFinancieros
          this.convertirSiEsBlob(this.formGroup2.value[10]), // cedulaContador
          this.convertirSiEsBlob(this.formGroup2.value[11]), // tarjetaProfesionalContador
        ])
          .then(
            ([
               resolucionHabilitacion,
               cedulaRepresentante,
               estadosFinancieros,
               cedulaContador,
               tarjetaProfesionalContador,
             ]) => {
              // Creación del objeto data2 con todos los campos procesados
              const data2 = {
                resolucionHabilitacion,
                cedulaRepresentante,
                estadosFinancieros,
                cedulaContador,
                tarjetaProfesionalContador,
                idCategoriaSolicitud: 149,
              };

              // put paso 2 actualizar - cargue 2
              this.apiSFService
                .SolicitudPaso2(this.idSolicitud, data2)
                .subscribe(
                  (response) => {
                    // Aquí puedes manejar la respuesta, por ejemplo:

                    if (opcion == 'opcion3') {
                      this.ActualizarSolicitud(3);
                    } else {
                      this.ShowLoadingModal = false;
                      this.stepperService.setActiveNum(num + 1);
                    }
                    // this.ActuFileGuardado(7, 8, 9, 10, 11);
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
          )
          .catch((error) => {
            console.error('Error en la conversión de archivos:', error);
            this.ShowLoadingModal = false;
          });

        break;

      case 3:
        const data3 = {
          capitalSocial: this.formGroup3.get('capitalSocial')?.value,
          patrimonioLiquido: this.formGroup3.get('patrimonioLiquido')?.value,
          cantidadVehiculos: this.formGroup3.get('cantidadVehiculos')?.value,
          idCategoriaSolicitud: 149,
        };
        //put paso 3 actualizar - cargue 3
        this.apiSFService.SolicitudPaso3(this.idSolicitud, data3).subscribe(
          (response) => {
            // Aquí puedes manejar la respuesta, por ejemplo:
            this.ShowLoadingModal = false;
            this.stepperService.setActiveNum(num);
            if (!notChange) {
              this.changeActiveNum('1');
            }
            console.log('Datos enviados exitosamente:', response);
          },
          (error) => {
            this.ShowLoadingModal = false;
            this.showErrorModal = true;
            // Manejo del error
            console.error('Error al enviar los datos:', error);
          }
        );

        break;

      default:
        break;
    }
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
    this.ActuFileGuardado(formControlName);

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
          formGroup.patchValue({[formControlName]: base64Array});

          // Solo para el cargador de archivos del formGroup1 y el control específico
          if (formControlName === 2 && formGroup === this.formGroup1) {
            // Inicializamos el array para almacenar los nombres de archivos truncados
            this.fileNames[1] = file.map((f, index) => {
              const firstPart = `consecutivo_${index + 1}__${this.nit}_${
                this.nombreEmpresa
              }__`;
              return firstPart;
            });
          }
        }
      })
      .catch((error) => {
        console.error('Error al convertir los archivos:', error);
      });
  }

  //Actualizar archivos guardados
  ActuFileGuardado(num: number) {
    this.isActuFile.push(num);
  }

  // Detectar si el archivo es PDF o XLSX desde Base64
  detectMimeType(base64: string): string {
    if (base64.startsWith('JVBERi0')) {
      return 'application/pdf'; // PDF
    } else if (base64.startsWith('UEsFB') || base64.startsWith('UEsDB')) {
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // XLSX
    }
    return 'application/octet-stream'; // Tipo por defecto si no se detecta
  }

  // Convertir Base64 a Blob y asignar el tipo MIME detectado
  convertBase64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const mimeType = this.detectMimeType(base64); // Detectar el tipo MIME

    return new Blob([byteArray], {type: mimeType});
  }

  // Crear un enlace para descargar o mostrar el archivo
  displayFile(base64File: string) {
    if (base64File == null || base64File == '') {
      return;
    }
    const blob = this.convertBase64ToBlob(base64File);
    const url = URL.createObjectURL(blob);

    return blob;
  }

  viewDocument(blob: Blob) {
    if (blob) {
      const url = URL.createObjectURL(blob);

      window.open(url);
    }
  }

  // Función para manejar los diferentes casos de acceso a los valores (Blob o Base64)
  convertirSiEsBlob(valor: any) {
    // Si es Blob, convertimos a Base64
    if (valor instanceof Blob) {
      return this.convertirBlob(valor); // Convertir Blob a Base64
    } else if (Array.isArray(valor) && valor.length > 0) {
      // Si es un array (Base64), retornamos el primer valor del array
      return Promise.resolve(valor[0]);
    } else {
      // Si no es ni Blob ni un array, devolvemos el valor como está
      return Promise.resolve(valor);
    }
  }

  //FUNCION PARA CONVERTIR BLOB - BASE64

  convertirBlob(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extraemos la parte base64 sin el prefijo 'data:...;base64,'
        const base64String = reader.result?.toString().split(',')[1] || '';
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(`Error al convertir Blob a base64: ${error}`);
      };
      reader.readAsDataURL(blob); // Leemos el blob como DataURL
    });
  }

  //MOSTRAR CONTRATOS GUARDADOS
  get visibleFiles(): File[] {
    return this.formGroup1
      .get('2')
      ?.value.slice(
        this.currentIndex,
        this.currentIndex + this.maxVisibleFiles
      );
  }

  moveLeft(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  moveRight(): void {
    if (
      this.currentIndex <
      this.formGroup1.get('2')?.value.length - this.maxVisibleFiles
    ) {
      this.currentIndex++;
    }
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

  // modal
  handleCloseByButton1() {
    this.processContractIteration();
    console.log('Modal closed by Button 1');
  }

  finalStep() {
    this.showFinalModal = false;
    localStorage.setItem('idSolicitud', '');
    localStorage.setItem('contratosSolicitudID', '');
    this.router.navigate(['/dashboard']).then(() => {
      location.reload();
    });
  }

  //fin MODAL

  // Cambia el header activo
  setActiveHeader(index: number): void {
    this.activeHeader = index;
    this.cdr.detectChanges();
  }

  // Método para enviar los formularios
  async onSubmitAllForms() {
    this.ShowLoadingModal = true;
    this.processContractIteration();
    console.log(this.formGroup4);

    if (this.IsvalidOperativo) {
      // Inicializar contratos como un array vacío
      let contratos: Array<{
        consecutivo: number;
        numeroContrato: any;
        contratante: any;
        fechaInicio: any;
        fechaFin: any;
        duracionMeses: any;
        numeroVehiculos: any;
        vehiculos: any;
        valorContrato: any;
        idFormaPago: any;
        areasOperacion: any;
        disponibilidadVehiculosEstimada: any;
        estado: boolean;
        idEstadoSolicitud: any;
        idFormulario: any;
      }> = [];

      console.log(this.contratosSolicitud);

      this.contractDataArray.forEach((item, index) => {
        contratos.push({
          consecutivo: index,
          numeroContrato: item.numeroContrato,
          contratante: item.contratante,
          fechaInicio: item.fecha_inicio,
          fechaFin: item.fecha_terminacion,
          duracionMeses: item.duracionMeses,
          numeroVehiculos: item.idClaseVehiculos.reduce(
            (sum: number, vehiculo: any) => sum + vehiculo.cantidadVehiculos,
            0
          ),
          valorContrato: item.valorContrato,
          idFormaPago: item.idFormaPago.value,
          disponibilidadVehiculosEstimada:
          item.disponibilidadVehiculosEstimada.value,
          estado: true,
          idEstadoSolicitud: index + 1 == this.formGroup1.get('2')?.value.length ? 123 : 162,
          idFormulario: parseInt(this.idSolicitud),
          vehiculos: item.idClaseVehiculos,
          areasOperacion: item.idAreaOperacion.map((i: { value: any }) => {
            return {
              id: this.contratosSolicitud
                ? this.contratosSolicitud[index].areasOperacion.find(
                  (item: { idMunicipioArea: any }) =>
                    (item.idMunicipioArea = i.value)
                ).id
                : '',
              idMunicipioArea: i.value,
            };
          }),
        });
      });
      //valida si existe informacion de Contratos guardados
      if (this.contratosSolicitud) {
        console.log('entroo 1');
        const data1 = await this.datosPaso1();
        this.ActualizarSolicitud(1, data1, 'opcion3', true);
        //si existe actualizar segun el array
        this.actualizarContratos(contratos);
      } else if (
        //valida si no existe nada guardado
        this.idSolicitud == '' ||
        this.idSolicitud === 'undefined' ||
        this.idSolicitud === undefined
      ) {
        console.log('entrooo 2');

        //proceso para guardar
        this.sendAllContracts();
      } else {
        const data1 = await this.datosPaso1();
        this.ActualizarSolicitud(1, data1, 'opcion3', true);
        console.log('entro segurooo');

        //CREA SOLICITUD
        this.apiSFService.createContratos(contratos[0]).subscribe(
          (response4) => {
            const parsedData = JSON.parse(response4);
            console.log('Datos enviados exitosamente:', parsedData);
            localStorage.setItem(
              'contratosSolicitudID',
              parsedData.idDetalleContrato
            );
            this.contratosSolicitud = parsedData;
            this.actualizarContratos(contratos);
            // Aquí puedes manejar la respuesta, por ejemplo:
            this.ShowLoadingModal = false;
          },
          (error) => {
            this.ShowLoadingModal = false;
            this.showErrorModal = true;
            // Manejo del error
            console.error('Error al enviar los datos:', error);
          }
        );
      }
    } else {
      this.ShowLoadingModal = false;
    }
  }

  actualizarContratos(contratos: any) {
    let contador = 0;
    contratos.forEach((element: any) => {
      this.ShowLoadingModal = true;
      this.apiSFService
        .SolicitudPaso4(this.contratosSolicitud.id, element)
        .subscribe(
          (response) => {
            contador += 1;
            const parsedData = JSON.parse(response);

            // Aquí puedes manejar la respuesta, por ejemplo:
            this.ShowLoadingModal = false;
            if (contador == this.formGroup1.value[2].length) {
              localStorage.setItem('idSolicitud', '');
              this.router.navigate(['/dashboard']).then(() => {
                location.reload();
              });
            }
            console.log('Datos enviados exitosamente:', parsedData);
          },
          (error) => {
            this.ShowLoadingModal = false;
            this.showErrorModal = true;
            // Manejo del error
            console.error('Error al enviar los datos:', error);
          }
        );
    });
  }

  changeContratoInfo(isContinue: boolean) {
    if (isContinue) {
      this.processContractIteration();
      if (this.IsvalidOperativo) {
        this.currentContractIteration += 1;
      }
    } else {
      this.currentContractIteration -= 1;
    }
  }

  logFormErrors(form: FormGroup | FormArray): void {
    Object.keys(form.controls).forEach((field) => {
      const control = form.get(field);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.logFormErrors(control); // Recursividad para FormGroups y FormArrays anidados
      } else {
        if (control?.invalid) {
          console.log(
            `Control "${field}" es inválido. Errores: `,
            control.errors
          );
        }
      }
    });
  }

  // Procesar cada iteración de contratos
  processContractIteration() {
    console.log(this.currentContractIteration);
    console.log(this.formGroup4.valid);

    if (this.formGroup4.valid) {
      this.IsvalidOperativo = true;
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
      this.logFormErrors(this.formGroup4);
      this.submitted = true;
      this.formGroup4.markAllAsTouched();
      this.IsvalidOperativo = false;
      return;
    }
  }

  // Método para enviar todos los contratos al servidor
  sendAllContracts() {
    this.ShowLoadingModal = true;
    if (
      this.formGroup1.value[2].length == 1 ||
      this.formGroup1.value[2].length == this.currentContractIteration
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
      vehiculos: any;
      valorContrato: any;
      idFormaPago: any;
      areasOperacion: any;
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
        numeroVehiculos: item.idClaseVehiculos.reduce(
          (sum: number, vehiculo: any) => sum + vehiculo.cantidadVehiculos,
          0
        ),
        valorContrato: item.valorContrato,
        idFormaPago: item.idFormaPago.value,
        disponibilidadVehiculosEstimada:
        item.disponibilidadVehiculosEstimada.value,
        estado: true,

        vehiculos: item.idClaseVehiculos,
        areasOperacion: item.idAreaOperacion.map((i: { value: any }) => {
          return {
            id: this.contratosSolicitud
              ? this.contratosSolicitud.areasOperacion.find(
                (item: { idMunicipioArea: any }) =>
                  (item.idMunicipioArea = i.value)
              ).id
              : '',
            idMunicipioArea: i.value,
          };
        }),
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
      territorial: 'Territorial de Antioquia',
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
