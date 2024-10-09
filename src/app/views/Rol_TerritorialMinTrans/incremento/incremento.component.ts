import {
  ChangeDetectorRef,
  Component,
  QueryList,
  ViewChildren,
  AfterViewInit,
  TemplateRef, OnInit,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {FileUploadComponent} from '../../../components/file-upload/file-upload.component';
import {InputText} from '../../../components/input/input.component';
import {LeftNavComponent} from '../../../components/left-nav/left-nav.component';
import {PrimaryButtonComponent} from '../../../components/primary-button/primary-button.component';
import {SttepperComponent} from '../../../components/sttepper/sttepper.component';
import {ActiveNumService} from '../../../services/left-nav/active-num.service';
import {ActiveNumStepperService} from '../../../services/stepper/active-num.service';
import {ApiService} from '../../../services/api/api.service';
import {ErrorService} from '../../../services/error/error.service';
import {SelectComponent} from '../../../components/select/select.component';
import {AlertComponent} from '../../../components/alert/alert.component';
import {Router} from '@angular/router';
import {MESES} from '../../../shared/data/meses';
import {HORAS} from '../../../shared/data/horas';
import {dateRangeValidator} from '../../../validator/date.validator';
import {NoNegativeGlobal} from '../../../validator/noNegative.validator';
import {ApiSFService} from '../../../services/api/apiSF.service';
import {catchError, debounceTime, distinctUntilChanged, switchMap} from "rxjs/operators";
import {BehaviorSubject, of} from "rxjs";

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

  //Control para deshabilitar el botón
  isProcessing: boolean = true;

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

  //loadingInicial
  loadingInicio: boolean = true;

  //solicitud guardada
  solicitudGuardada: any;

  //nombre contratos
  fileNames: { [key: number]: string[] } = [];

  //manejo de varios contratos guardados
  currentIndex = 0;
  maxVisibleFiles = 2;

  numberTocontinueSaved: number = 0;
  showModalInfoSaved: boolean = false;

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
                console.log(response1);
                this.loadingInicio = false;
                // Crear un array de contratos
                const contratosArray = response1.map((element: any) => ({
                  nit: element.nit,
                  id: element.id,
                  documentos: this.displayFile(element.documentos),
                }));

                // Guardar el array en formGroup1[0]
                this.formGroup1.patchValue({[1]: contratosArray,});

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
                console.log(response2);

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
            this.formGroup2.patchValue({
              ['cantidadVehiculo']: response.cantidadVehiculosIncrementar,
            });
            this.formGroup3.patchValue({
              [12]: this.displayFile(response.certificadoPropiedadEmpresa),
            });
            this.formGroup3.patchValue({
              ['capital_social']: response.capitalSocial,
            });
            this.formGroup3.patchValue({
              ['patrimonio_liquido']: response.patrimonioLiquido,
            });

            console.log(response);
          },
          (error) => {
            console.error('Error fetching user data', error);
          }
        );
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

    // Escuchar cambios en los campos 'fechaInicio' y 'fechaFin'
    this.formGroup4.get('fecha_inicio')?.valueChanges.subscribe(() => {
      this.updateDuration();
    });

    this.formGroup4.get('fecha_terminacion')?.valueChanges.subscribe(() => {
      this.updateDuration();
    });

    this.formGroup1.get('nombreEmpresa')?.disable();

    this.formGroup1
      .get('nit')
      ?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value: string) => {
        this.isProcessing = true;
        this.formGroup1
          .get('nombreEmpresa')
          ?.setValue('');
        if (value && value.length >= 9) {
          return this.apiSFService.getDataByNIT(value).pipe(
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
  get visibleFiles(): File[] {
    return this.formGroup1.get('1')
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
      this.formGroup1.get('1')?.value.length - this.maxVisibleFiles
    ) {
      this.currentIndex++;
    }
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

    return new Blob([byteArray], {type: mimeType});
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
      0: ['', Validators.required],
      1: ['', Validators.required],
    });

    this.formGroup3 = this.fb.group({
      12: [null, Validators.required],
      capital_social: ['', [Validators.required, NoNegativeGlobal]],
      patrimonio_liquido: ['', [Validators.required, NoNegativeGlobal]]
    });

    this.formGroup4 = this.fb.group(
      {
        cantidad_contratos: [
          {value: '', disabled: false},
          Validators.required,
        ],
        contrato: ['', Validators.required],
        contratante: ['', Validators.required],
        fecha_inicio: ['', Validators.required],
        fecha_terminacion: ['', Validators.required],
        duracionMeses: ['', Validators.required],
        idClaseVehiculo: ['', Validators.required],
        numeroVehiculos: [''],
        valorContrato: ['', Validators.required],
        forma_pago: ['', Validators.required],
        idAreaOperacion: ['', Validators.required],
        disponibilidad: ['', Validators.required],
        idClaseVehiculos: this.fb.array([]),
      },
      {validators: [dateRangeValidator, NoNegativeGlobal]}
    );
  }

  // Obtener el FormArray de clases de vehículos
  get idClaseVehiculos(): FormArray {
    return this.formGroup4.get('idClaseVehiculos') as FormArray;
  }

  // Obtener Label de los headers
  getSelectedLabelsHeaders(): any {
    return this.selectedOptionsClase.map((option) => option.label);
  }

  // Metodo para cambiar el valor del menuleft
  changeActiveNum(newValue: string) {
    if (
      this.formGroup1.valid &&
      this.formGroup2.valid &&
      this.formGroup3.valid
    ) {
      this.stateService.setActiveNum(newValue);
    }
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
    //formaPago
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

  deleteFile(num: number, index?: number) {
    switch (num) {
      case 1:
        const posicion = index ?? 0;
        this.formGroup1.get(num.toString())?.value[posicion] == '';
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

      default:
        break;
    }
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
    this.showModalInfoSaved = false;
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
                  this.showModalSaveInfo(newValue);
                  this.formGroup4
                    .get('cantidad_contratos')
                    ?.setValue(this.formGroup1.value[1].length);
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

        if (this.validateFormGroup(this.formGroup3, this.errorStates)) {
          if (parseFloat(this.inputs[0].value) <= 50) {
            this.valid1 =
              this.formGroup3.get('capital_social')?.value >= 300 * this.smlmmv;
            this.valid2 =
              this.formGroup3.get('patrimonio_liquido')?.value >= 180 * this.smlmmv;
          } else if (
            parseFloat(this.inputs[0].value) >= 51 &&
            parseFloat(this.inputs[0].value) <= 300
          ) {
            this.valid1 =
              this.formGroup3.get('capital_social')?.value >= 400 * this.smlmmv;
            this.valid2 =
              this.formGroup3.get('patrimonio_liquido')?.value >= 280 * this.smlmmv;
          } else if (
            parseFloat(this.inputs[0].value) >= 301 &&
            parseFloat(this.inputs[0].value) <= 600
          ) {
            this.valid1 =
              this.formGroup3.get('capital_social')?.value >= 700 * this.smlmmv;
            this.valid2 =
              this.formGroup3.get('patrimonio_liquido')?.value >= 500 * this.smlmmv;
          } else if (parseFloat(this.inputs[0].value) >= 601) {
            this.valid1 =
              this.formGroup3.get('capital_social')?.value >= 1000 * this.smlmmv;
            this.valid2 =
              this.formGroup3.get('patrimonio_liquido')?.value >= 700 * this.smlmmv;
          }

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
        }

        break;

      default:
        break;
    }
  }

  //datos paso 1
  async datosPaso1() {
    // Rellenar el array de documentos con una conversión asíncrona para cada Blob

    const documentoPromises = this.formGroup1.value[1].map(
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
        planRodamiento,
        estructuraCostosBasicos,
        certificadoCumplimiento,
        certificadoExistencia,
        registroUnicoTributario,
        documentos,
      ] = await Promise.all([
        this.convertirSiEsBlob(this.formGroup1.value[2]),
        this.convertirSiEsBlob(this.formGroup1.value[3]),
        this.convertirSiEsBlob(this.formGroup1.value[4]),
        this.convertirSiEsBlob(this.formGroup1.value[5]),
        this.convertirSiEsBlob(this.formGroup1.value[6]),
        Promise.all(documentoPromises), // documentos
      ]);

      // Creación del objeto data1 con todos los campos procesados
      const data1 = {
        fechaSolicitud: new Date(),
        territorial: 'Territorial de Antioquia',
        idCategoriaSolicitud: 150,
        nombreEmpresa: this.formGroup1.get('nombreEmpresa')?.value,
        nit: this.formGroup1.get('nit')?.value,
        documentos,
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
          this.convertirSiEsBlob(this.formGroup2.value[7]),
          this.convertirSiEsBlob(this.formGroup2.value[8]),
          this.convertirSiEsBlob(this.formGroup2.value[9]),
          this.convertirSiEsBlob(this.formGroup2.value[10]),
          this.convertirSiEsBlob(this.formGroup2.value[11]),
        ])
          .then(
            ([
               resolucionHabilitacion,
               cedulaRepresentante,
               estadosFinancieros,
               cedulaContador,
               tarjetaProfesionalContador,
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
                cantidadVehiculosIncrementar: parseFloat(this.inputs[0].value),
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

        Promise.all([
          this.convertirSiEsBlob(this.formGroup3.value[12])
        ])
          .then(
            ([
               certificadoPropiedadEmpresa
             ]) => {
              const data3 = {
                fechaSolicitud: new Date(),
                territorial: 'Territorial de Antioquia',
                idCategoriaSolicitud: 150,
                capitalSocial: this.formGroup3.get('capital_social')?.value,
                patrimonioLiquido: this.formGroup3.get('patrimonio_liquido')?.value,
                certificadoPropiedadEmpresa: certificadoPropiedadEmpresa
              };

              // put paso 3 actualizar - cargue 3
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
            }
          )
          .catch((error) => {
            console.error('Error en la conversión de archivos:', error);
            this.ShowLoadingModal = false;
          });

        break;

      default:
        break;
    }
  }

  //Actualizar archivos guardados
  ActuFileGuardado(num: number) {
    this.isActuFile.push(num);
  }

  //Función para manejar los diferentes casos de acceso a los valores (Blob o Base64)
  convertirSiEsBlob(valor: any) {
    console.log('VALOR:::::::', valor)
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

  //Validador error
  validateFormGroup(
    formGroup: FormGroup,
    errorStates: { [key: number]: boolean }
  ): boolean {
    let isValid = true;
    for (const key in formGroup.controls) {
      if (formGroup.controls.hasOwnProperty(key)) {
        const control = formGroup.controls[key];
        console.log(key);

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

  // Metodo para alternar la selección de una opción
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

  //Metodo para guardar el archivo seleccionado
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
        };

        const formGroup = formControlMap[formControlName];

        if (formGroup) {
          // Parchamos el form con los archivos en base64
          formGroup.patchValue({[formControlName]: base64Array});

          // Solo para el cargador de archivos del formGroup1 y el control específico
          if (formControlName === 1 && formGroup === this.formGroup1) {
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

  //Metodo para guardar el valor del input y select de incremento formula
  onInputChange(index: number, event: any) {
    let value = null;

    if (event.target) {
      const inputElement = event.target as HTMLInputElement;
      value = inputElement?.value ?? ''; // Maneja valores nulos

      //Asumiendo que el `input-text` está en el índice 0
      if (
        index === 0 ||
        index === 3 ||
        index === 4 ||
        index === 5 ||
        index === 6 ||
        index === 13
      ) {
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

    // Si el índice es 1 (select), actualiza el porcentaje seleccionado
    if (index === 1) {
      this.selectedPercentage = value ? `${value}%` : '';
    }

    // Si ya tienes ambos valores, realiza la multiplicación
    const numeroVehiculos = this.inputs[0].value
      ? parseFloat(this.inputs[0].value)
      : 0;
    const porcentaje = this.inputs[1].value
      ? parseFloat(this.inputs[1].value)
      : 0;

    if (numeroVehiculos && porcentaje) {
      const resultado = (numeroVehiculos * porcentaje) / 100;
      this.inputs[2].value = resultado.toFixed(2);
      this.formGroup2.patchValue({2: resultado.toFixed(2)});
    }

    //Lógica para cambiar el texto dinámico
    if (index === 0) {
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
    input.value = input.value; // Mantiene el valor actual al enfocar
  }

  // Quitar el formato de moneda para obtener solo el número
  parseCurrency(value: string): number {
    return Number(value.replace(/[^0-9]+/g, '')); // Solo números
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

  // Metodo para enviar los formularios
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
          idFormaPago: item.forma_pago.value,
          disponibilidadVehiculosEstimada: item.disponibilidad.value,
          estado: true,
          idEstadoSolicitud: index + 1 == this.formGroup1.get('1')?.value.length ? 123 : 162,
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
            if (contador == this.formGroup1.value[1].length) {
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

  // modal
  handleCloseByButton1() {
    this.processContractIteration();
    console.log('Modal closed by Button 1');
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

  finalStep() {
    this.showFinalModal = false;
    this.router.navigate(['/dashboard']).then(() => {
      location.reload();
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
        this.formGroup1.value[1].length - 1
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

  //Metodo para enviar todos los contratos al servidor
  sendAllContracts() {
    this.ShowLoadingModal = true;
    if (
      this.formGroup1.value[1].length == 1 ||
      this.formGroup1.value[1].length == this.currentContractIteration
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
    this.formGroup1.value[1].forEach((item: any) => {
      documentos.push({
        nit: this.nit,
        documento: item,
      });
    });

    const allFormsData = {
      fechaSolicitud: new Date(),
      nombreEmpresa: this.formGroup1.get('nombreEmpresa')?.value,
      nit: this.formGroup1.get('nit')?.value,
      territorial: 'Territorial de Antioquia',
      idEstadoSolicitud: 123,
      idCategoriaSolicitud: 150,
      excelModeloTransporte: '',
      radicadoEntrada: '',
      cumplimiento: '',
      estado: true,
      planRodamiento: this.formGroup1.value[2][0],
      estructuraCostosBasicos: this.formGroup1.value[3][0],
      certificadoCumplimiento: this.formGroup1.value[4][0],
      certificadoExistencia: this.formGroup1.value[5][0],
      registroUnicoTributario: this.formGroup1.value[6][0],
      resolucionHabilitacion: this.formGroup2.value[7][0],
      cedulaRepresentante: this.formGroup2.value[8][0],
      estadosFinancieros: this.formGroup2.value[9][0],
      cedulaContador: this.formGroup2.value[10][0],
      tarjetaProfesionalContador: this.formGroup2.value[11][0],
      certificadoPropiedadEmpresa: this.formGroup3.value[12][0],
      capitalSocial: this.formGroup3.get('capital_social')?.value,
      patrimonioLiquido: this.formGroup3.get('patrimonio_liquido')?.value,
      cantidadVehiculosIncrementar: parseFloat(this.inputs[0].value),
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
