import {
  ChangeDetectorRef,
  Component,
  QueryList,
  ViewChildren,
  AfterViewInit,
  TemplateRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FileUploadComponent } from '../../../../components/file-upload/file-upload.component';
import { InputText } from '../../../../components/input/input.component';
import { LeftNavComponent } from '../../../../components/left-nav/left-nav.component';
import { PrimaryButtonComponent } from '../../../../components/primary-button/primary-button.component';
import { SttepperComponent } from '../../../../components/sttepper/sttepper.component';
import { ActiveNumService } from '../../../../services/left-nav/active-num.service';
import { ActiveNumStepperService } from '../../../../services/stepper/active-num.service';
import { ApiService } from '../../../../services/api/api.service';
import { ErrorService } from '../../../../services/error/error.service';
import { SelectComponent } from '../../../../components/select/select.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { Router } from '@angular/router';
import { MESES } from '../../../../shared/data/meses';
import { HORAS } from '../../../../shared/data/horas';
import { dateRangeValidator } from '../../../../validator/date.validator';
import { NoNegativeGlobal } from '../../../../validator/noNegative.validator';
import { ApiSFService } from '../../../../services/api/apiSF.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  timeout,
} from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface Contrato {
  nit: number;
  id: number;
  documento: Blob; // O el tipo que corresponda a "documento"
}

@Component({
  selector: 'app-incremento',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadComponent,
    InputText,
    LeftNavComponent,
    PrimaryButtonComponent,
    ReactiveFormsModule,
    SttepperComponent,
    SelectComponent,
    AlertComponent,
    FormsModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './incremento.component.html',
  styleUrl: './incremento.component.css',
})
export default class IncrementoComponent implements AfterViewInit, OnInit {
  departs: any = [];
  ClaseVehiculo: any = [];
  meses: { value: string; label: string }[] = [];
  formaPago: any = [];
  horas: any = [];
  nit: string = '';
  nombreEmpresa: string = '';

  //contador para consecutivo
  counter: number = 0;

  // Array para almacenar las opciones seleccionadas
  selectedOptionsClase: any[] = [];
  selectedOptionsDeparts: any[] = [];

  submitted: boolean = false;

  @ViewChildren('content1, content2, content3') templates!: QueryList<
    TemplateRef<any>
  >;

  stepContents: TemplateRef<any>[] = [];

  constructor(
    private stateService: ActiveNumService,
    private stepperService: ActiveNumStepperService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private errorService: ErrorService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private apiSFService: ApiSFService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      idSolicitud: string;
    };

    if (state) {
      this.idSolicitud = state.idSolicitud;
      console.log(state.idSolicitud);
      console.log(this.idSolicitud);

      this.setIdSolicitud(this.idSolicitud);
    } else {
      // Recuperar de localStorage si está disponible
      this.setIdSolicitud(localStorage.getItem('idSolicitud') || '');
    }
  }

  //Objeto para manejar los active num del left menu y stepper.
  activeNum: string = '0'; //Left menu
  activeStep: number = 1; //Stteper

  //Formularios
  formGroup1!: FormGroup;
  formGroup2!: FormGroup;
  formGroup3!: FormGroup;


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

  //Propiedad para almacenar el texto dinamico
  dynamicText: string = '';

  //Propiedad para almacenar el texto dinamico en las alertas
  dynamicTextAlertValid1: string = '';
  dynamicTextAlertValid2: string = '';

  //estado requerimiento
  smlmmv: number = 1300000;

  //validaciones requerimientos capita y patrimonio
  valid1: boolean = false;
  valid2: boolean = false;

  showModalRequisito: boolean = false;
  ShowLoadingModal: boolean = false;
  showErrorModal: boolean = false;
  showModalContinuar: boolean = false;
  showModalContinuar1: boolean = false;
  showModalWarning1: boolean = false;
  showModalAlerta: boolean = false;
  showModalAlerta1: boolean = false;
  showModalInfoSaved1: boolean = false;

  //Control para deshabilitar el botón
  isProcessing: boolean = true;

  //nuevos contratos
  isNewContracts: boolean = false;

  //number to continue modal
  numberTocontinue: number = 0;

  //identificador de actualización de file
  isActuFile: [number] = [-1];

  //form dinamico num vehiculos
  activeHeader: number | null = null;

  //si es valido el form en operativo
  IsvalidOperativo: boolean = false;

  //observable option
  private idSolicitudSubject = new BehaviorSubject<string>(''); // Inicializa con un valor vacío
  idSolicitud$ = this.idSolicitudSubject.asObservable(); // Observable para observar cambios
  idSolicitud: any;

  //solicitud contratos
  contratosSolicitud: any;
  //contador para consecutivo paso 4
  contador: number = 0;

  //loadingInicial
  loadingInicio: boolean = true;

  //solicitud guardada
  solicitudGuardada: any;
  //documentos guardados
  contratosArray: any;
  // Array para almacenar los contratos a  eliminar
  deletedValues: any[] = [];

  //nombre contratos
  fileNames: { [key: number]: string[] } = [];

  //manejo de varios contratos guardados
  currentIndex = 0;
  maxVisibleFiles = 2;

  numberTocontinueSaved: number = 0;
  showModalInfoSaved: boolean = false;

  //cantidadTotalVehIncrementar
  cantidadTotalVehIncrementar: any;
  //capacidad actual vehiculos (total sin cantidad a incrementar)
  capacidadVehiculos: number = 0;

  //Menu left
  infoMenu = [
    {
      num: '0',
      name: 'Solicitud',
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

  //info selects
  selects = [
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
      name: 'idAreaOperacion',
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
        { value: 7, label: '7%' },
        { value: 10, label: '10%' },
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
  ];

  //Props o datos para input upload
  dataClass = {
    textSize: 'xs',
    textInfo: 'Archivo PDF. Peso máximo: 2MB',
  };

  setIdSolicitud(newId: string): void {
    this.idSolicitudSubject.next(newId); // Cambia el valor del BehaviorSubject
    this.idSolicitud = newId; // Actualiza la variable local
  }

  ngOnInit(): void {
    //Suscribirse al observable para obtener los cambios reactivos del menuleft
    // Suscribirse al observable para obtener los cambios reactivos del menuleft
    this.stateService.setActiveNum('0');
    this.stepperService.setActiveNum(1);
    this.stateService.activeNum$.subscribe((num) => {
      this.activeNum = num;
    });

    //Suscribirse al observable del servicio de stepper
    this.stepperService.activeStep$.subscribe((step) => {
      this.activeStep = step;
      console.log('Active step:', step);
    });

    //datos selects
    this.meses = MESES;
    this.horas = HORAS;

    this.initializeForm();
    // Configuración inicial del FormGroup

    //Suscribirse al servicio de manejo de errores
    this.errorService.errorStates$.subscribe((errorStates) => {
      this.errorStates = errorStates;
    });

    // Suscribirse a los cambios en idSolicitud
    this.idSolicitud$.subscribe((newId) => {
      localStorage.setItem('idSolicitud', newId);
      this.loadingInicio = false;
      if (newId != '' && newId != 'undefined' && newId != undefined) {
        console.log(newId);

        this.ObtenerSolicitud(newId);
        this.loadingInicio = true;
      }
    });
  }

  ngAfterViewInit(): void {
    // Utiliza setTimeout para permitir que Angular complete la detección de cambios
    setTimeout(() => {
      this.stepContents = this.templates.toArray();
      this.loadOptions();
      this.cdr.detectChanges(); // Forzar detección de cambios
    });


    this.formGroup2
      .get('cantidadVehiculosIncrementar')
      ?.valueChanges.pipe(
        debounceTime(300) // Espera 300ms después de que el usuario termine de escribir
      )
      .subscribe((cantidadIncrementar) => {
        this.updateTotalVeh(parseInt(cantidadIncrementar));
      });

    this.formGroup1.get('nombreEmpresa')?.disable();

    this.formGroup1
      .get('nit')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((value: string) => {
          this.isProcessing = true;
          this.formGroup1.get('nombreEmpresa')?.setValue('');
          if (value && value.length >= 9) {
            return this.apiSFService.getDataByNIT(value).pipe(
              timeout(5000),
              catchError((error) => {
                console.error('Error al enviar los datos:', error);
                this.showModalWarning1 = true;
                this.formGroup1.get('nombreEmpresa')?.enable();
                return of(null); // Retorna null si hay un error
              })
            );
          } else {
            this.isProcessing = true;
            // Si el NIT no es válido, no hacer nada
            return of(null);
          }
        })
      )
      .subscribe((response) => {
        if (response) {
          const parsedData = JSON.parse(response);
          console.log(parsedData);

          if (parsedData.registros) {
            if (parsedData.registros[0].nomEstadoMatricula === 'ACTIVA') {
              console.log('Empresa activa');
              // Actualizar el campo 'nombreEmpresa'
              this.isProcessing = false;
              this.formGroup1
                .get('nombreEmpresa')
                ?.setValue(parsedData.registros[0].razonSocialEmpresa);
              console.log(
                'Datos enviados exitosamente:',
                parsedData.registros[0].razonSocialEmpresa
              );
              this.apiSFService
                .getcantidadVehiculosByNIT(parsedData.nit)
                .subscribe(
                  (response) => {
                    console.log(response.cantidadVehiculosIncrementar); // Muestra la respuesta en la consola

                    this.cantidadTotalVehIncrementar =
                      response.cantidadVehiculosIncrementar;

                    if (response.estado) {
                      this.formGroup2
                        .get('vehiculosFijados')
                        ?.setValue(response.cantidadVehiculos);
                      this.formGroup2
                        .get('totalVehiculos')
                        ?.setValue(
                          response.cantidadVehiculosIncrementar +
                            response.cantidadVehiculos
                        );

                      this.capacidadVehiculos =
                        response.cantidadVehiculosIncrementar +
                        response.cantidadVehiculos;

                      this.formGroup2.get('vehiculosFijados')?.disable();
                      this.formGroup2.get('totalVehiculos')?.disable();
                    } else {
                      console.log('no hay registros');
                    }
                  },
                  (error) => {
                    console.error('Error fetching user data', error); // Maneja el error si ocurre
                    this.formGroup2.get('vehiculosFijados')?.enable();
                  }
                );
            } else {
              this.showModalAlerta1 = true;
              console.log('Empresa inactiva');
            }
          } else {
            this.showModalAlerta = true;
          }
        }
      });


  }

  //MOSTRAR CONTRATOS GUARDADOS
  get visibleFiles(): Contrato[] {
    return this.contratosArray.slice(
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
    const contratos = this.contratosArray;

    // Verificar si contratos es un array y que tenga elementos
    if (Array.isArray(contratos) && contratos.length > 0) {
      // Verificar si se puede mover hacia la derecha
      if (this.currentIndex + this.maxVisibleFiles < contratos.length) {
        this.currentIndex++; // Aumentar currentIndex
      }
    }
    this.cdr.detectChanges();
  }

  viewDocument(blob: Blob) {
    if (blob) {
      const url = URL.createObjectURL(blob);
      window.open(url);
    }
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

  // Convertir Base64 a Blob y asignar el tipo MIME detectado
  convertBase64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const mimeType = this.detectMimeType(base64); // Detectar el tipo MIME

    return new Blob([byteArray], { type: mimeType });
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

  // Aquí defines tu formulario
  initializeForm() {
    //Validaciones segun el formulario
    this.formGroup1 = this.fb.group({
      nombreEmpresa: ['', [Validators.required, NoNegativeGlobal]],
      nit: ['', [Validators.required, NoNegativeGlobal]],
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
      13: [null, Validators.required],
      cantidadVehiculosIncrementar: ['', Validators.required],
      1: ['', Validators.required], //cumplimiento
      2: ['', Validators.required], //resultado
      vehiculosFijados: ['', Validators.required], //vehiculos fijados
      totalVehiculos: ['', Validators.required], //cantidad total de vehiculos
    });

    this.formGroup3 = this.fb.group({
      12: [null, Validators.required],
      capital_social: ['', [Validators.required, NoNegativeGlobal]],
      patrimonio_liquido: ['', [Validators.required, NoNegativeGlobal]],
    });


  }



  // Obtener Label de los headers
  getSelectedLabelsHeaders(): any {
    return this.selectedOptionsClase.map((option) => option.label);
  }



  // Cambia el header activo
  setActiveHeader(index: number): void {
    this.activeHeader = index;
    this.cdr.detectChanges();
  }

  toggleDropdown(index: number) {
    this.selects[index].isDropdownOpen = !this.selects[index].isDropdownOpen;
  }

  selectOption(index: number, option: any, name: string) {
    this.selects[index].value = option;
    this.selects[index].isDropdownOpen = false;
    this.formGroup3.get(name)?.setValue(option);

  }

  loadOptions() {

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

    //salario minimo
    this.apiService.getSalario().subscribe(
      (response) => {
        // Filtrar el detalle para obtener el salario del año actual
        const salarioActual = response.detalle.find((salario: any) =>
          salario.descripcion.includes(new Date().getFullYear().toString())
        );

        this.smlmmv = salarioActual
          ? salarioActual.detalle
          : response.detalle[0].detalle;
        console.log(this.smlmmv);
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );
  }

  deleteFile(num: number, index?: number) {
    switch (num) {
      case 1:
        const posicion = index ?? 0;

        // Obtener el control de formulario correspondiente
        const control = this.formGroup1.get(num.toString());

        if (control && Array.isArray(control.value)) {
          // Crear una copia del array actual
          const currentValue = [...control.value];

          // Almacenar el valor a eliminar en el array deletedValues
          const valueToDelete = currentValue[posicion];
          this.deletedValues.push(valueToDelete.id);
        }
        console.log(this.deletedValues);

        break;

      case 2:
        this.formGroup1.get(num.toString())?.setValue('');
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

      case 12:
        this.formGroup3.get(num.toString())?.setValue('');
        break;
      case 13:
        this.formGroup2.get(num.toString())?.setValue('');
        break;

      default:
        break;
    }
    this.cdr.detectChanges();
  }

  NodeleteFile(index: number) {
    const posicion = index ?? 0;

    // Obtener el control de formulario correspondiente
    const control = this.formGroup1.get('1');

    if (control && Array.isArray(control.value)) {
      // Crear una copia del array actual
      const currentValue = [...control.value];

      // Obtener el valor a remover del array deletedValues
      const valueToRestore = currentValue[posicion];

      if (valueToRestore) {
        // Remover el valor de deletedValues usando filter
        this.deletedValues = this.deletedValues.filter(
          (id) => id !== valueToRestore.id
        );
      }
    }
    console.log(this.deletedValues);
  }



  ObtenerSolicitud(newId: string) {
    //GET SOLICITUD
    return new Promise((resolve, reject) => {
      this.apiSFService.getSolicitudByID(newId).subscribe(
        async (response) => {
          console.log(response.resolucionHabilitacion);

          this.solicitudGuardada = response;
          this.loadingInicio = true;

          this.formGroup1.patchValue({
            ['nit']: response.nit,
          });
          this.formGroup1.patchValue({
            ['nombreEmpresa']: response.nombreEmpresa,
          });
          this.formGroup1.patchValue({
            [2]: this.displayFile(response.planRodamiento),
          });
          this.formGroup1.patchValue({
            [3]: this.displayFile(response.estructuraCostosBasicos),
          });
          this.formGroup1.patchValue({
            [4]: this.displayFile(response.certificadoCumplimiento),
          });
          this.formGroup1.patchValue({
            [5]: this.displayFile(response.certificadoExistencia),
          });
          this.formGroup1.patchValue({
            [6]: this.displayFile(response.registroUnicoTributario),
          });
          this.formGroup2.patchValue({
            [7]: this.displayFile(
              response.resolucionHabilitacion != null
                ? response.resolucionHabilitacion
                : this.formGroup2.get('7')?.value
                ? this.formGroup2.get('7')?.value[0]
                : null
            ),
          });
          this.formGroup2.patchValue({
            [8]: this.displayFile(
              response.cedulaRepresentante != null
                ? response.cedulaRepresentante
                : this.formGroup2.get('8')?.value
                ? this.formGroup2.get('8')?.value[0]
                : null
            ),
          });
          this.formGroup2.patchValue({
            [9]: this.displayFile(
              response.estadosFinancieros != null
                ? response.estadosFinancieros
                : this.formGroup2.get('9')?.value
                ? this.formGroup2.get('9')?.value[0]
                : null
            ),
          });
          this.formGroup2.patchValue({
            [10]: this.displayFile(
              response.cedulaContador != null
                ? response.cedulaContador
                : this.formGroup2.get('10')?.value
                ? this.formGroup2.get('10')?.value[0]
                : null
            ),
          });
          this.formGroup2.patchValue({
            [11]: this.displayFile(
              response.tarjetaProfesionalContador != null
                ? response.tarjetaProfesionalContador
                : this.formGroup2.get('11')?.value
                ? this.formGroup2.get('11')?.value[0]
                : null
            ),
          });
          this.formGroup2.patchValue({
            [13]: this.displayFile(
              response.resolucionCapacidadTransportadora != null
                ? response.resolucionCapacidadTransportadora
                : this.formGroup2.get('13')?.value
                ? this.formGroup2.get('13')?.value[0]
                : null
            ),
          });
          this.formGroup2.patchValue({
            ['cantidadVehiculosIncrementar']:
              response.cantidadVehiculosIncrementar != null
                ? response.cantidadVehiculosIncrementar
                : this.formGroup2.get('cantidadVehiculosIncrementar')?.value ||
                  null,
          });

          this.formGroup2.patchValue({
            [1]:
              response.cumplimiento != null
                ? response.cumplimiento
                : this.formGroup2.get('1')?.value,
          });

          this.inputs[1].value =
            response.cumplimiento != null
              ? response.cumplimiento
              : this.formGroup2.get('1')?.value;
          this.formGroup3.patchValue({
            [12]: this.displayFile(
              response.certificadoPropiedadEmpresa != null
                ? response.certificadoPropiedadEmpresa
                : this.formGroup3.get('12')?.value
                ? this.formGroup3.get('12')?.value[0]
                : null
            ),
          });
          this.formGroup3.patchValue({
            ['capital_social']:
              response.capitalSocial != null
                ? response.capitalSocial
                : this.formGroup3.get('capital_social')?.value,
          });
          this.formGroup3.patchValue({
            ['patrimonio_liquido']:
              response.patrimonioLiquido != null
                ? response.patrimonioLiquido
                : this.formGroup3.get('patrimonio_liquido')?.value,
          });

          this.updateTotalVeh(
            parseInt(this.formGroup2.get('cantidadVehiculosIncrementar')?.value)
          );

          resolve(response);

        },
        (error) => {
          console.error('Error fetching user data', error);
        }
      );
      // Forzar detección de cambios
      this.cdr.detectChanges();
    });
  }

  //modal continuar sin guardar
  goToModal(num: number) {
    this.showModalContinuar = true;
    this.numberTocontinue = num;
  }

  //modal continuar despues de guardar
  showModalSaveInfo(num: number) {
    this.numberTocontinueSaved = num;
    this.showModalInfoSaved = true;
  }

  // Método para cambiar el valor del stepper
  async changeActiveStep(
    newValue: number,
    saved: boolean,
    back: boolean = false
  ) {

    switch (newValue) {
      case 1:
        this.loadingInicio = true;
        if (
          this.idSolicitud == '' ||
          this.idSolicitud === 'undefined' ||
          this.idSolicitud === undefined
        ) {
          this.isActuFile = [-1];

          this.formGroup1.patchValue({
            [2]: this.displayFile(this.formGroup1.get('2')?.value[0]),
          });
          this.formGroup1.patchValue({
            [3]: this.displayFile(this.formGroup1.get('3')?.value[0]),
          });
          this.formGroup1.patchValue({
            [4]: this.displayFile(this.formGroup1.get('4')?.value[0]),
          });
          this.formGroup1.patchValue({
            [5]: this.displayFile(this.formGroup1.get('5')?.value[0]),
          });
          this.formGroup1.patchValue({
            [6]: this.displayFile(this.formGroup1.get('6')?.value[0]),
          });

          console.log(this.formGroup1.get('2')?.value);
        } else {
          await this.ObtenerSolicitud(this.idSolicitud);
        }

        this.loadingInicio = false;
        this.stepperService.setActiveNum(newValue);
        break;

      case 2:
        if (this.validateFormGroup(this.formGroup1, this.errorStates)) {
          if (saved) {
            this.ShowLoadingModal = true;
            const data1 = await this.datosPaso1();
            if (
              this.idSolicitud == '' ||
              this.idSolicitud === 'undefined' ||
              this.idSolicitud === undefined
            ) {
              this.apiSFService.createSolicitud(data1).subscribe(
                (response) => {
                  this.isActuFile = [-1];
                  const parsedData = JSON.parse(response);
                  this.ShowLoadingModal = false;
                  console.log('Datos enviados exitosamente:', parsedData);
                  this.idSolicitud = parsedData.id_solicitud;
                  localStorage.setItem('idSolicitud', this.idSolicitud);
                  this.showModalSaveInfo(newValue);

                  this.cdr.detectChanges();
                },
                (error) => {
                  this.ShowLoadingModal = false;
                  this.showErrorModal = true;
                  console.error('Error al enviar los datos:', error);
                }
              );
            } else {
              this.ActualizarSolicitud(1, data1);
            }
          } else {
            this.ShowLoadingModal = false;

            if (back == true) {
              this.loadingInicio = true;
              await this.ObtenerSolicitud(this.idSolicitud);
              this.loadingInicio = false;
              this.isActuFile = [-1];
            }
            this.stepperService.setActiveNum(newValue);
          }

        } else if (back == true) {
          this.loadingInicio = true;
          await this.ObtenerSolicitud(this.idSolicitud);
          this.loadingInicio = false;
          this.isActuFile = [-1];
        }

        break;

      case 3:
        if (this.validateFormGroup(this.formGroup2, this.errorStates)) {
          if (saved) {
            this.ShowLoadingModal = true;
            const data1 = await this.datosPaso1();

            if (
              this.idSolicitud == '' ||
              this.idSolicitud === 'undefined' ||
              this.idSolicitud === undefined
            ) {
              this.apiSFService.createSolicitud(data1).subscribe(
                (response) => {
                  const parsedData = JSON.parse(response);
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
            this.ShowLoadingModal = false;
            this.stepperService.setActiveNum(newValue);
          }
        }

        break;

      case 4:
        if (this.formGroup3.valid) {
          if (
            parseFloat(
              this.formGroup2.get('cantidadVehiculosIncrementar')?.value
            ) <= 50
          ) {
            this.valid1 =
              this.formGroup3.get('capital_social')?.value >= 300 * this.smlmmv;
            this.valid2 =
              this.formGroup3.get('patrimonio_liquido')?.value >=
              180 * this.smlmmv;
          } else if (
            parseFloat(
              this.formGroup2.get('cantidadVehiculosIncrementar')?.value
            ) >= 51 &&
            parseFloat(
              this.formGroup2.get('cantidadVehiculosIncrementar')?.value
            ) <= 300
          ) {
            this.valid1 =
              this.formGroup3.get('capital_social')?.value >= 400 * this.smlmmv;
            this.valid2 =
              this.formGroup3.get('patrimonio_liquido')?.value >=
              280 * this.smlmmv;
          } else if (
            parseFloat(
              this.formGroup2.get('cantidadVehiculosIncrementar')?.value
            ) >= 301 &&
            parseFloat(
              this.formGroup2.get('cantidadVehiculosIncrementar')?.value
            ) <= 600
          ) {
            this.valid1 =
              this.formGroup3.get('capital_social')?.value >= 700 * this.smlmmv;
            this.valid2 =
              this.formGroup3.get('patrimonio_liquido')?.value >=
              500 * this.smlmmv;
          } else if (
            parseFloat(
              this.formGroup2.get('cantidadVehiculosIncrementar')?.value
            ) >= 601
          ) {
            this.valid1 =
              this.formGroup3.get('capital_social')?.value >=
              1000 * this.smlmmv;
            this.valid2 =
              this.formGroup3.get('patrimonio_liquido')?.value >=
              700 * this.smlmmv;
          }

          if (this.valid1 && this.valid2) {
            if (saved) {
              this.ShowLoadingModal = true;
              const data1 = await this.datosPaso1();
              if (
                this.idSolicitud == '' ||
                this.idSolicitud === 'undefined' ||
                this.idSolicitud === undefined
              ) {
                this.apiSFService.createSolicitud(data1).subscribe(
                  (response) => {
                    const parsedData = JSON.parse(response);
                    this.idSolicitud = parsedData.id_solicitud;
                    localStorage.setItem('idSolicitud', this.idSolicitud);
                    this.ActualizarSolicitud(2, 0, 'opcion3');
                  },
                  (error) => {
                    this.ShowLoadingModal = false;
                    this.showErrorModal = true;
                    console.error('Error al enviar los datos:', error);
                  }
                );
              } else {
                this.ActualizarSolicitud(1, data1, 'opcion3');
              }
            } else {
              this.ShowLoadingModal = false;
              this.stepperService.setActiveNum(3);

            }
          } else {
            this.showModalRequisito = true;
          }
        } else {
          this.submitted = true;
          this.formGroup3.markAllAsTouched();
        }

        break;

      default:
        break;
    }
  }

  //datos paso 1
  async datosPaso1() {
    try {
      if (
        this.idSolicitud != '' &&
        this.idSolicitud != 'undefined' &&
        this.idSolicitud != undefined
      ) {

      } else {
        console.log(
          'No hay idSolicitud, se continuará sin obtener documentos.'
        );
      }
      this.isNewContracts = false;


      const [
        planRodamiento,
        estructuraCostosBasicos,
        certificadoCumplimiento,
        certificadoExistencia,
        registroUnicoTributario,
      ] = await Promise.all([
        this.convertirSiEsBlob(this.formGroup1.value[2]),
        this.convertirSiEsBlob(this.formGroup1.value[3]),
        this.convertirSiEsBlob(this.formGroup1.value[4]),
        this.convertirSiEsBlob(this.formGroup1.value[5]),
        this.convertirSiEsBlob(this.formGroup1.value[6]),

      ]);

      // Creación del objeto data1 con todos los campos procesados
      const data1 = {
        fechaSolicitud: new Date(),
        territorial: 'Territorial de Antioquia',
        idCategoriaSolicitud: 150,
        nombreEmpresa: this.formGroup1.get('nombreEmpresa')?.value,
        nit: this.formGroup1.get('nit')?.value,
        planRodamiento,
        estructuraCostosBasicos,
        certificadoCumplimiento,
        certificadoExistencia,
        registroUnicoTributario,
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
    this.showModalInfoSaved = false;
    switch (num) {
      case 1:
        this.apiSFService.SolicitudPaso1(this.idSolicitud, data).subscribe(
          (response) => {
            // Aquí puedes manejar la respuesta, por ejemplo:
            if (this.deletedValues.length > 0) {
              this.deletedValues.forEach((element) => {
                this.apiSFService.deleteDoc(element).subscribe(
                  () => {},
                  (error) => {
                    // Manejo del error
                    console.error('Error al eliminar los docs:', error);
                  }
                );
              });
            }
            if (opcion == 'opcion2') {
              this.ActualizarSolicitud(2);
            } else if (opcion == 'opcion3') {
              this.ActualizarSolicitud(2, 0, 'opcion3');
            } else {
              this.ShowLoadingModal = false;
              this.showModalInfoSaved = true;
              this.stepperService.setActiveNum(num + 1);
            }
          },
          (error) => {
            this.ShowLoadingModal = false;
            this.showErrorModal = true;
            console.error('Error al enviar los datos:', error);
          }
        );
        break;

      case 2:
        Promise.all([
          this.convertirSiEsBlob(this.formGroup2.value[7]),
          this.convertirSiEsBlob(this.formGroup2.value[8]),
          this.convertirSiEsBlob(this.formGroup2.value[9]),
          this.convertirSiEsBlob(this.formGroup2.value[10]),
          this.convertirSiEsBlob(this.formGroup2.value[11]),
          this.convertirSiEsBlob(this.formGroup2.value[13]),
        ])
          .then(
            ([
              resolucionHabilitacion,
              cedulaRepresentante,
              estadosFinancieros,
              cedulaContador,
              tarjetaProfesionalContador,
              resolucionCapacidadTransportadora,
            ]) => {
              const data2 = {
                fechaSolicitud: new Date(),
                territorial: 'Territorial de Antioquia',
                idCategoriaSolicitud: 150,
                resolucionHabilitacion: resolucionHabilitacion,
                cedulaRepresentante: cedulaRepresentante,
                estadosFinancieros: estadosFinancieros,
                cedulaContador: cedulaContador,
                tarjetaProfesionalContador: tarjetaProfesionalContador,
                resolucionCapacidadTransportadora:
                  resolucionCapacidadTransportadora,
                cantidadVehiculosIncrementar: this.formGroup2.get(
                  'cantidadVehiculosIncrementar'
                )?.value,
                cumplimiento: this.formGroup2.value[1],
              };
              this.apiSFService
                .SolicitudPaso2(this.idSolicitud, data2)
                .subscribe(
                  (response) => {
                    // Aquí puedes manejar la respuesta, por ejemplo:

                    if (opcion == 'opcion3') {
                      this.ActualizarSolicitud(3);
                    } else {
                      this.ShowLoadingModal = false;
                      this.showModalInfoSaved = true;
                      this.showModalSaveInfo(num + 1);
                    }
                    // this.ActuFileGuardado(7, 8, 9, 10, 11);

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
        Promise.all([this.convertirSiEsBlob(this.formGroup3.value[12])])
          .then(([certificadoPropiedadEmpresa]) => {
            const data3 = {
              fechaSolicitud: new Date(),
              territorial: 'Territorial de Antioquia',
              idCategoriaSolicitud: 150,
              capitalSocial: this.formGroup3.get('capital_social')?.value,
              patrimonioLiquido:
                this.formGroup3.get('patrimonio_liquido')?.value,
              certificadoPropiedadEmpresa: certificadoPropiedadEmpresa,
            };

            // put paso 3 actualizar - cargue 3
            this.apiSFService.SolicitudPaso3(this.idSolicitud, data3).subscribe(
              (response) => {
                this.ShowLoadingModal = false;
                if (!notChange) {
                  this.showModalInfoSaved = true;
                  this.showModalSaveInfo(num + 1);
                } else {
                  this.showModalInfoSaved = true;
                  this.ObtenerSolicitud(this.idSolicitud);
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
          })
          .catch((error) => {
            console.error('Error en la conversión de archivos:', error);
            this.ShowLoadingModal = false;
          });

        break;

      default:
        break;
    }
  }

  ActuFileGuardado(num: number) {
    this.isActuFile.push(num);
    this.cdr.detectChanges();
  }

  convertirSiEsBlob(valor: any) {
    if (valor instanceof Blob) {
      return this.convertirBlob(valor);
    } else if (Array.isArray(valor) && valor.length > 0) {
      return Promise.resolve(valor[0]);
    } else {
      return Promise.resolve(valor);
    }
  }

  convertirBlob(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1] || '';
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(`Error al convertir Blob a base64: ${error}`);
      };
      reader.readAsDataURL(blob);
    });
  }

  validateFormGroup(
    formGroup: FormGroup,
    errorStates: { [key: number]: boolean }
  ): boolean {
    let isValid = true;
    for (const key in formGroup.controls) {
      if (formGroup.controls.hasOwnProperty(key)) {
        const control = formGroup.controls[key];

        if (!control.value || control.invalid) {
          const errorKey = parseInt(key, 10);
          errorStates[errorKey] = true;
          isValid = false;
        }
      }
    }
    this.errorService.updateErrorStates(errorStates);
    return isValid;
  }









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
          12: this.formGroup3,
          13: this.formGroup2,
        };

        const formGroup = formControlMap[formControlName];

        if (formGroup) {
          formGroup.patchValue({ [formControlName]: base64Array });
          if (formControlName === 1 && formGroup === this.formGroup1) {
            this.fileNames[1] = file.map((f, index) => {
              const firstPart = `consecutivo_${index + 1}__${
                this.formGroup1.get('nit')?.value
              }_${this.formGroup1.get('nombreEmpresa')?.value}__`;
              return firstPart;
            });
            this.isNewContracts = true;
          }
        }
        // Limpia el error cuando se carga un archivo
        this.errorStates[formControlName] = false;

        // Asegúrate de actualizar el servicio de errores después de modificar el estado
        this.errorService.updateErrorStates(this.errorStates);
      })
      .catch((error) => {
        console.error('Error al convertir los archivos:', error);
      });
  }

  convertFilesToBase64(files: File[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const base64Array: string[] = [];

      files.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = (event: any) => {
          const base64String = event.target.result.split(',')[1];
          base64Array.push(base64String);
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

  onInputChange(index: number, event: any) {
    let value = null;
    if (event.target) {
      const inputElement = event.target as HTMLInputElement;
      value = inputElement?.value ?? '';
      if (
        index === 0 ||
        index === 3 ||
        index === 4 ||
        index === 5 ||
        index === 6 ||
        index === 13
      ) {
        value = Math.max(0, parseFloat(value) || 0);
        // @ts-ignore
        inputElement.value = value;
      }
    } else {
      value = event?.value ?? '';
    }

    this.inputs[index].value = value;
    this.formGroup2.patchValue({ [index]: value });

    if (index === 1) {
      this.selectedPercentage = value ? `${value}%` : '';
    }

    const numeroVehiculos = this.formGroup2.get('totalVehiculos')?.value
      ? parseFloat(this.formGroup2.get('totalVehiculos')?.value)
      : 0;
    const porcentaje = this.inputs[1].value
      ? parseFloat(this.inputs[1].value)
      : 0;

    if (numeroVehiculos && porcentaje) {
      const resultado = (numeroVehiculos * porcentaje) / 100;
      this.inputs[2].value = resultado.toFixed(2);
      this.formGroup2.patchValue({ 2: resultado.toFixed(2) });
    }

    //Lógica para cambiar el texto dinámico
    if (this.formGroup2.get('cantidadVehiculosIncrementar')?.value) {
      if (numeroVehiculos <= 50) {
        this.dynamicText =
          'Empresa con capacidad transportadora operacional autorizada de hasta 50 vehículos: Capital pagado mínimo: 300 SMLMV – Patrimonio líquido mínimo > 180 SMLMV';
        this.dynamicTextAlertValid1 =
          'No se cumple con el requisito mínimo de capital social (300 SMLMV)';
        this.dynamicTextAlertValid2 =
          'No se cumple con el requisito mínimo de patrimonio liquido (menor a 180 SMLMV)';
      } else if (numeroVehiculos >= 51 && numeroVehiculos <= 300) {
        this.dynamicText =
          'Empresa con capacidad transportadora operacional autorizada de hasta 51 y 300 vehículos: Capital pagado mínimo: 400 SMLMV – Patrimonio líquido mínimo > 280 SMLMV';
        this.dynamicTextAlertValid1 =
          'No se cumple con el requisito mínimo de capital social (400 SMLMV)';
        this.dynamicTextAlertValid2 =
          'No se cumple con el requisito mínimo de patrimonio liquido (menor a 280 SMLMV)';
      } else if (numeroVehiculos >= 301 && numeroVehiculos <= 600) {
        this.dynamicText =
          'Empresa con capacidad transportadora operacional autorizada de hasta 301 y 600 vehículos: Capital pagado mínimo: 700 SMLMV – Patrimonio líquido mínimo > 500 SMLMV';
        this.dynamicTextAlertValid1 =
          'No se cumple con el requisito mínimo de capital social (700 SMLMV)';
        this.dynamicTextAlertValid2 =
          'No se cumple con el requisito mínimo de patrimonio liquido (menor a 500 SMLMV)';
      } else if (numeroVehiculos >= 601) {
        this.dynamicText =
          'Empresa con capacidad transportadora operacional autorizada de más 600 vehículos: Capital pagado mínimo: 1000 SMLMV – Patrimonio líquido mínimo > 700 SMLMV';
        this.dynamicTextAlertValid1 =
          'No se cumple con el requisito mínimo de capital social (1000 SMLMV)';
        this.dynamicTextAlertValid2 =
          'No se cumple con el requisito mínimo de patrimonio liquido (menor a 700 SMLMV)';
      }
    }
  }

  // No realizar ningún cambio al enfocar, pero mantener el valor
  onCurrencyFocus(event: any): void {
    const input = event.target;
    input.value = input.value;
  }

  // Quitar el formato de moneda para obtener solo el número
  parseCurrency(value: string): number {
    return Number(value.replace(/[^0-9]+/g, ''));
  }

  // Formatear número como moneda en pesos colombianos
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
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





  // modal
  handleCloseByButton1() {

  }

  finalPart() {
    this.showModalInfoSaved = false;
    this.showFinalModal = true;
  }


  finalStep() {

    localStorage.setItem('idSolicitud', '');
    localStorage.setItem('contratosSolicitudID', '');
    this.router.navigate(['/inicio']).then(() => {
      location.reload();
    });
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


  //calcular total vehiculos con fijacion, incremento y veh a incrementar
  updateTotalVeh(cantidadIncrementar: number): void {
    this.formGroup2
      .get('totalVehiculos')
      ?.setValue(
        this.cantidadTotalVehIncrementar +
          this.formGroup2.get('vehiculosFijados')?.value
      );
    console.log(this.formGroup2.get('totalVehiculos')?.value);
    console.log(cantidadIncrementar);

    // Calcula el nuevo total
    const nuevoTotal =
      parseInt(this.formGroup2.get('totalVehiculos')?.value) +
      (cantidadIncrementar || 0);

    // Establece el nuevo valor en totalVehiculos

    this.formGroup2
      .get('totalVehiculos')
      ?.setValue(nuevoTotal, { emitEvent: false });
  }

}
