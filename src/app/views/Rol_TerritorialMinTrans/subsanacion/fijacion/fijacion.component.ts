import {
  first,
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  timeout,
} from 'rxjs';

import { ErrorService } from '../../../../services/error/error.service';
import { PrimaryButtonComponent } from '../../../../components/primary-button/primary-button.component';
import { ActiveNumService } from '../../../../services/left-nav/active-num.service';
import { ActiveNumStepperService } from '../../../../services/stepper/active-num.service';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { LeftNavComponent } from '../../../../components/left-nav/left-nav.component';
import { SttepperComponent } from '../../../../components/sttepper/sttepper.component';
import { FileUploadComponent } from '../../../../components/file-upload/file-upload.component';
import { CommonModule } from '@angular/common';
//servicios de consultas api
import { ApiService } from '../../../../services/api/api.service';
import { InputText } from '../../../../components/input/input.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
  FormArray,
} from '@angular/forms';
import { SelectComponent } from '../../../../components/select/select.component';
import { MESES } from '../../../../shared/data/meses';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { Router } from '@angular/router';
import { dateRangeValidator } from '../../../../validator/date.validator';
import { HORAS } from '../../../../shared/data/horas';
import { NoNegativeGlobal } from '../../../../validator/noNegative.validator';
import { ApiSFService } from '../../../../services/api/apiSF.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

interface Contrato {
  nit: number;
  id: number;
  documento: Blob; // O el tipo que corresponda a "documento"
}
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
    TooltipModule,
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
  //Control para deshabilitar el botón
  isProcessing: boolean = true;

  //nuevos contratos
  isNewContracts: boolean = false;

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
  //contador para consecutivo paso 4
  contador: number = 0;

  //solicitud guardada
  solicitudGuardada: any;
  //documentos guardados
  contratosArray: any;
  // Array para almacenar los contratos a  eliminar
  deletedValues: any[] = [];

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
  showModalInfoSaved: boolean = false; //Control para mostrar el modal de guardado info y continuar
  showModalInfoSaved1: boolean = false; //Control para mostrar el modal de guardado info y continuar
  ShowLoadingModal: boolean = false; // Control para mostrar el modal loading
  showErrorModal: boolean = false; // Control para mostrar el modal error
  showFinalModal: boolean = false; // Control para mostrar el modal final
  showModalContinuar: boolean = false; //control para mostrar modal de desea continuar
  showModalContinuar1: boolean = false; //control para mostrar modal de desea continuar operativo
  showModalWarning1: boolean = false; //control para mostrar modal de advertencia error en el rues
  showModalAlerta: boolean = false; //control para mostrar modal de alerta Nit contratante
  showModalAlerta1: boolean = false; //control para mostrar modal de alerta Nit contratante
  //number to continue modal
  numberTocontinue: number = 0;
  //number to continue modal infosaved
  numberTocontinueSaved: number = 0;

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
    this.stateService.setActiveNum('0');
    this.stepperService.setActiveNum(1);
    this.stateService.activeNum$.subscribe((num) => {
      this.activeNum = num;
    });

    // Suscribirse al observable del servicio de stepper
    this.stepperService.activeStep$.subscribe((step) => {
      this.activeStep = step;
    });


    this.initializeForm();
    // Configuración inicial del FormGroup

    //suscribirse al servicio de manejo de errores
    this.errorService.errorStates$.subscribe((errorStates) => {
      this.errorStates = errorStates;
    });

    this.idSolicitud$.subscribe((newId) => {
      localStorage.setItem('idSolicitud', newId);
      this.loadingInicio = false;
      if (newId != '' && newId != 'undefined' && newId != undefined) {
        console.log(newId);

        this.ObtenerSolicitud(newId);

      }
    });
  }

  ObtenerSolicitud(newId: string) {
    //GET SOLICITUD
    return new Promise((resolve, reject) => {
      this.apiSFService.getSolicitudByID(newId).subscribe(
        async (response) => {
          this.solicitudGuardada = response;


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

          this.formGroup3.patchValue({
            ['capitalSocial']:
              response.capitalSocial != null
                ? response.capitalSocial
                : this.formGroup3.get('capitalSocial')?.value || null,
          });

          this.formGroup3.patchValue({
            ['patrimonioLiquido']:
              response.patrimonioLiquido != null
                ? response.patrimonioLiquido
                : this.formGroup3.get('patrimonioLiquido')?.value || null,
          });

          this.formGroup3.patchValue({
            ['cantidadVehiculos']:
              response.cantidadVehiculos != null
                ? response.cantidadVehiculos
                : this.formGroup3.get('cantidadVehiculos')?.value || null,
          });
          resolve(response);
          console.log(response);
          this.loadingInicio = false;
        },
        (error) => {
          console.error('Error fetching user data', error);
        }
      );
      // Forzar detección de cambios
      this.cdr.detectChanges();
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

  }


  deleteFile(num: number, index?: number) {
    switch (num) {
      case 1:
        this.formGroup1.get(num.toString())?.setValue('');
        break;

      case 2:
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
    this.cdr.detectChanges();
  }

  NodeleteFile(index: number) {
    const posicion = index ?? 0;

    // Obtener el control de formulario correspondiente
    const control = this.formGroup1.get('2');

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


  loadOptions() {

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
            [1]: this.displayFile(this.formGroup1.get('1')?.value[0]),
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
        } else {
          await this.ObtenerSolicitud(this.idSolicitud);
        }

        this.loadingInicio = false;
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
                  this.showModalSaveInfo(newValue);

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
              this.ActualizarSolicitud(1, data1);
            }
          } else {
            //Continuar Sin guardar
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
            this.formGroup3.get('patrimonioLiquido')?.value > 180 * this.smlmmv;

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
      // Si el idSolicitud existe, obtener los documentos, sino continuar el proceso sin obtener documentos
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
      console.log(this.formGroup1.get('2')?.value);

            // Convertir los valores que pueden ser Blob a Base64 (sin incluir los documentos, ya procesados)
      const [
        solicitudFijacionCapacidad,
        planRodamiento,
        estructuraCostosBasicos,
        certificadoExistencia,
        registroUnicoTributario,
      ] = await Promise.all([
        this.convertirSiEsBlob(this.formGroup1.value[1]), // solicitudFijacionCapacidad
        this.convertirSiEsBlob(this.formGroup1.value[3]), // planRodamiento
        this.convertirSiEsBlob(this.formGroup1.value[4]), // estructuraCostosBasicos
        this.convertirSiEsBlob(this.formGroup1.value[5]), // certificadoExistencia
        this.convertirSiEsBlob(this.formGroup1.value[6]), // registroUnicoTributario
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
    this.showModalInfoSaved = false;
    this.isActuFile = [-1];
    switch (num) {
      case 1:
        //put paso 1 actualizar - cargue 1
        this.apiSFService.SolicitudPaso1(this.idSolicitud, data).subscribe(
          (response) => {

            if (opcion == 'opcion2') {
              this.ActualizarSolicitud(2);
            } else if (opcion == 'opcion3') {
              this.ActualizarSolicitud(2, 0, 'opcion3');
            } else {
              this.ShowLoadingModal = false;
              this.showModalSaveInfo(num + 1);
            }
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
                      this.showModalSaveInfo(num + 1);
                    }
                    // this.ActuFileGuardado(7, 8, 9, 10, 11);
                    console.log('estado num', num + 1);

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
          idEstadoSolicitud: 279,
        };
        //put paso 3 actualizar - cargue 3
        this.apiSFService.SolicitudPaso3(this.idSolicitud, data3).subscribe(
          (response) => {
            // Aquí puedes manejar la respuesta, por ejemplo:
            this.ShowLoadingModal = false;


              this.ObtenerSolicitud(this.idSolicitud);

            console.log('Datos enviados exitosamente:', response);
            this.finalPart();
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
        console.log(formGroup.controls);

        const control = formGroup.controls[key];
        if (!control.value || control.invalid) {
          const errorKey = parseInt(key, 10); // Convierte la clave a número
          errorStates[errorKey] = true;
          isValid = false;
        }
      }
    }
    console.log(errorStates);

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

          formGroup.patchValue({ [formControlName]: base64Array });


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

  //Actualizar archivos guardados
  ActuFileGuardado(num: number) {
    this.isActuFile.push(num);
    this.cdr.detectChanges();
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

    return new Blob([byteArray], { type: mimeType });
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

  // MOSTRAR CONTRATOS GUARDADOS
  get visibleFiles(): Contrato[] {
    return this.contratosArray.slice(
      this.currentIndex,
      this.currentIndex + this.maxVisibleFiles
    );
  }

  // Mover a la izquierda (anterior)
  moveLeft(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--; // Reducir currentIndex
    }
  }

  // Mover a la derecha (siguiente)
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



  finalPart() {
    this.showModalInfoSaved = false;
    this.showFinalModal = true;
  }

  finalStep() {
    this.showFinalModal = false;
    localStorage.setItem('idSolicitud', '');
    localStorage.setItem('contratosSolicitudID', '');
    this.router.navigate(['/inicio']).then(() => {
      location.reload();
    });
  }

  //fin MODAL

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


}
