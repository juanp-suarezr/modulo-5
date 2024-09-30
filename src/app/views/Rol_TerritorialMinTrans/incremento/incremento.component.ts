import {
  ChangeDetectorRef,
  Component,
  QueryList,
  ViewChildren,
  AfterViewInit,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';
import { InputText } from '../../../components/input/input.component';
import { LeftNavComponent } from '../../../components/left-nav/left-nav.component';
import { PrimaryButtonComponent } from '../../../components/primary-button/primary-button.component';
import { SttepperComponent } from '../../../components/sttepper/sttepper.component';
import { ActiveNumService } from '../../../services/left-nav/active-num.service';
import { ActiveNumStepperService } from '../../../services/stepper/active-num.service';
import { ApiService } from '../../../services/api/api.service';
import { ErrorService } from '../../../services/error/error.service';
import { SelectComponent } from '../../../components/select/select.component';
import { AlertComponent } from '../../../components/alert/alert.component';
import { Router } from '@angular/router';
import { MESES } from '../../../shared/data/meses';
import { FORMAPAGO } from '../../../shared/data/formapago';
import { HORAS } from '../../../shared/data/horas';
import { dateRangeValidator } from '../../../validator/date.validator';
import { NoNegativeGlobal } from '../../../validator/noNegative.validator';
import { ApiSFService } from '../../../services/api/apiSF.service';
import {catchError, debounceTime, distinctUntilChanged, switchMap} from "rxjs/operators";
import {of} from "rxjs";

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
export default class IncrementoComponent implements AfterViewInit {
  departs: any = [];
  ClaseVehiculo: any = [];
  meses: { value: string; label: string }[] = [];
  formaPago: any = [];
  horas: any = [];
  nit: string = '';
  idSolicitud: string = '';
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
  ) {}

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
  showModalWarning1: boolean = false;
  showModalAlerta: boolean = false; // Control para mostrar el modal de error cuando no esta registrado
  showModalAlerta1: boolean = false; // Control para mostrar el modal de error cuando matricula vencida

  //Control para deshabilitar el botón
  isProcessing: boolean = true;

  //number to continue modal
  numberTocontinue: number = 0;

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

    this.formGroup3.get('nombreEmpresa')?.disable();

    this.formGroup3
      .get('nit')
      ?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value: string) => {
        this.isProcessing = true;
        this.formGroup3
          .get('nombreEmpresa')
          ?.setValue('');
        if (value && value.length >= 9) {
          return this.apiSFService.getDataByNIT(value).pipe(
            catchError((error) => {
              console.error('Error al enviar los datos:', error);
              this.showModalWarning1 = true;
              this.formGroup3.get('nombreEmpresa')?.enable();
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
              this.formGroup3
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

  // Aquí defines tu formulario
  initializeForm() {
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
      12: [null, Validators.required],
      capital_social: ['', [Validators.required, NoNegativeGlobal]],
      patrimonio_liquido: ['', [Validators.required, NoNegativeGlobal]],
      nombreEmpresa: ['', [Validators.required, NoNegativeGlobal]],
      nit: ['', [Validators.required, NoNegativeGlobal]],
    });

    this.formGroup4 = this.fb.group(
      {
        cantidad_contratos: [
          { value: '', disabled: false },
          Validators.required,
        ],
        contrato: ['', Validators.required],
        contratante: ['', Validators.required],
        fecha_inicio: ['', Validators.required],
        fecha_terminacion: ['', Validators.required],
        duracionMeses: ['', Validators.required],
        idClaseVehiculo: ['', Validators.required],
        num_vehiculos: ['', Validators.required],
        valorContrato: ['', Validators.required],
        forma_pago: ['', Validators.required],
        idAreaOperacion: ['', Validators.required],
        disponibilidad: ['', Validators.required],
      },
      { validators: [dateRangeValidator, NoNegativeGlobal] }
    );
  }

  //Metodo para cambiar el valor del menuleft
  changeActiveNum(newValue: string) {
    this.stateService.setActiveNum(newValue);
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

  // Detectar si el archivo es PDF o XLSX desde Base64
  detectMimeType(base64: string): string {
    if (base64[0].startsWith('JVBERi0')) {
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

  //modal continuar sin guardar
  goToModal(num: number) {
    this.showModalContinuar = true;
    this.numberTocontinue = num;
  }

  // Crear un enlace para descargar o mostrar el archivo
  displayFile(base64File: string) {
    const blob = this.convertBase64ToBlob(base64File);
    const url = URL.createObjectURL(blob);

    console.log(blob);
    console.log(url);
  }

  // Método para cambiar el valor del stepper
  changeActiveStep(newValue: number, saved: boolean, back: boolean = false) {
    switch (newValue) {
      case 1:
        this.stepperService.setActiveNum(newValue);
        break;
      case 2:
        //validator
        console.log(this.displayFile(this.formGroup1.value[1]));
        if (this.validateFormGroup(this.formGroup1, this.errorStates)) {
          //valida si se va a guardar la info
          if (saved) {
            this.ShowLoadingModal = true;
            // Inicializar contratos como un array vacío
            let documentos: Array<{
              nit: string;
              documento: string;
            }> = [];

            // Rellenar el array documentos
            this.formGroup1.value[2].forEach((item: any) => {
              documentos.push({
                nit: this.nit,
                documento: item,
              });
            });
            //valida si ya hay una solicitud guardada
            if (this.idSolicitud == '' || this.idSolicitud === 'undefined') {
              const data1 = {
                fechaSolicitud: new Date(),
                territorial: 'Medellin',
                idCategoriaSolicitud: 150,
                documentos: documentos,
                planRodamiento: this.formGroup1.value[2][0],
                estructuraCostosBasicos: this.formGroup1.value[3][0],
                certificadoCumplimiento: this.formGroup1.value[4][0],
                certificadoExistencia: this.formGroup1.value[5][0],
                registroUnicoTributario: this.formGroup1.value[6][0],
              };

              //CREA SOLICITUD
              this.apiSFService.createSolicitud(data1).subscribe(
                (response) => {
                  // Aquí puedes manejar la respuesta, por ejemplo:
                  this.ShowLoadingModal = false;
                  console.log('Datos enviados exitosamente:', response.id_solicitud);
                  this.idSolicitud = response.id_solicitud;
                  console.log( this.idSolicitud);

                  this.stepperService.setActiveNum(newValue);
                  this.formGroup4
                    .get('cantidad_contratos')
                    ?.setValue(this.formGroup1.value[2].length);
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
              this.ActualizarSolicitud(1, documentos);
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
            //valida si se trae el id (ya realizó el primer cargue)
            if (this.idSolicitud == '' || this.idSolicitud === 'undefined') {
              // Inicializar contratos como un array vacío
              let documentos: Array<{
                nit: string;
                documento: string;
              }> = [];

              // Rellenar el array documentos
              this.formGroup1.value[2].forEach((item: any) => {
                documentos.push({
                  nit: this.nit,
                  documento: item,
                });
              });

              const data1 = {
                fechaSolicitud: new Date(),
                territorial: 'Medellin',
                idCategoriaSolicitud: 150,
                resolucionHabilitacion: this.formGroup2.value[7][0],
                cedulaRepresentante: this.formGroup2.value[8][0],
                estadosFinancieros: this.formGroup2.value[9][0],
                cedulaContador: this.formGroup2.value[10][0],
                tarjetaProfesionalContador: this.formGroup2.value[11][0],
                cantidadVehiculosIncrementar: parseFloat(this.inputs[0].value),
              };

              this.apiSFService.createSolicitud(data1).subscribe(
                (response) => {
                  // Aquí puedes manejar la respuesta, por ejemplo:

                  console.log('Datos enviados exitosamente:', response);

                  this.idSolicitud = response;
                  this.ActualizarSolicitud(2);
                },
                (error) => {
                  this.ShowLoadingModal = false;
                  this.showErrorModal = true;
                  // Manejo del error
                  console.error('Error al enviar los datos:', error);
                }
              );
            } else {
              //envia solo a actualizar el paso2
              this.ActualizarSolicitud(2);
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
              this.formGroup3.get('patrimonio_liquido')?.value <
              180 * this.smlmmv;
          } else if (
            parseFloat(this.inputs[0].value) >= 51 &&
            parseFloat(this.inputs[0].value) <= 300
          ) {
            this.valid1 =
              this.formGroup3.get('capital_social')?.value >= 400 * this.smlmmv;
            this.valid2 =
              this.formGroup3.get('patrimonio_liquido')?.value <
              280 * this.smlmmv;
          } else if (
            parseFloat(this.inputs[0].value) >= 301 &&
            parseFloat(this.inputs[0].value) <= 600
          ) {
            this.valid1 =
              this.formGroup3.get('capital_social')?.value >= 700 * this.smlmmv;
            this.valid2 =
              this.formGroup3.get('patrimonio_liquido')?.value <
              500 * this.smlmmv;
          } else if (parseFloat(this.inputs[0].value) >= 601) {
            this.valid1 =
              this.formGroup3.get('capital_social')?.value >=
              1000 * this.smlmmv;
            this.valid2 =
              this.formGroup3.get('patrimonio_liquido')?.value <
              700 * this.smlmmv;
          }

          if (this.valid1 && this.valid2) {
            if (saved) {
              this.ShowLoadingModal = true;
              //valida si se trae el id (ya realizó el primer cargue)
              if (this.idSolicitud == '' || this.idSolicitud === 'undefined') {
                // Inicializar contratos como un array vacío
                let documentos: Array<{
                  nit: string;
                  documento: string;
                }> = [];

                // Rellenar el array documentos
                this.formGroup1.value[2].forEach((item: any) => {
                  documentos.push({
                    nit: this.nit,
                    documento: item,
                  });
                });

                const data1 = {
                  fechaSolicitud: new Date(),
                  territorial: 'Medellin',
                  idCategoriaSolicitud: 150,
                  capitalSocial: this.formGroup3.get('capital_social')?.value,
                  patrimonioLiquido: this.formGroup3.get('patrimonio_liquido')?.value,
                  nombreEmpresa: this.formGroup3.get('nombreEmpresa')?.value,
                  nit: this.formGroup3.get('nit')?.value,
                };

                this.apiSFService.createSolicitud(data1).subscribe(
                  (response) => {
                    // Aquí puedes manejar la respuesta, por ejemplo:

                    console.log('Datos enviados exitosamente:', response);

                    this.idSolicitud = response;
                    this.ActualizarSolicitud(3);
                  },
                  (error) => {
                    this.ShowLoadingModal = false;
                    this.showErrorModal = true;
                    // Manejo del error
                    console.error('Error al enviar los datos:', error);
                  }
                );
              } else {
                //envia solo a actualizar el paso2
                this.ActualizarSolicitud(3);
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

    console.log(this.errorStates);
  }

  //actualizar solicitudes
  ActualizarSolicitud(num: number, contr?: any) {
    switch (num) {
      case 1:
        const data1 = {
          fechaSolicitud: new Date(),
          territorial: 'Bogota',
          idCategoriaSolicitud: 149,
          solicitudFijacionCapacidad: this.formGroup1.value[1][0],
          planRodamiento: this.formGroup1.value[3][0],
          estructuraCostosBasicos: this.formGroup1.value[4][0],
          certificadoExistencia: this.formGroup1.value[5][0],
          registroUnicoTributario: this.formGroup1.value[6][0],
          documentos: contr,
        };
        //put paso 1 actualizar - cargue 1
        this.apiSFService.SolicitudPaso1(this.idSolicitud, data1).subscribe(
          (response) => {
            // Aquí puedes manejar la respuesta, por ejemplo:
            this.ShowLoadingModal = false;
            this.stepperService.setActiveNum(num + 1);
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
        const data2 = {
          resolucionHabilitacion: this.formGroup2.value[7][0],
          cedulaRepresentante: this.formGroup2.value[8][0],
          estadosFinancieros: this.formGroup2.value[9][0],
          cedulaContador: this.formGroup2.value[10][0],
          tarjetaProfesionalContador: this.formGroup2.value[11][0],
        };
        //put paso 2 actualizar - cargue 2
        this.apiSFService.SolicitudPaso2(this.idSolicitud, data2).subscribe(
          (response) => {
            // Aquí puedes manejar la respuesta, por ejemplo:
            this.ShowLoadingModal = false;
            this.stepperService.setActiveNum(num + 1);
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

      case 3:
        const data3 = {
          capitalSocial: this.formGroup3.get('capitalSocial')?.value,
          patrimonioLiquido: this.formGroup3.get('patrimonioLiquido')?.value,
          cantidadVehiculos: this.formGroup3.get('cantidadVehiculos')?.value,
        };
        //put paso 3 actualizar - cargue 3
        this.apiSFService.SolicitudPaso3(this.idSolicitud, data3).subscribe(
          (response) => {
            // Aquí puedes manejar la respuesta, por ejemplo:
            this.ShowLoadingModal = false;
            this.stepperService.setActiveNum(num);
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
      }
    } else {
      if (nameForm == 'idAreaOperacion') {
        this.selectedOptionsDeparts.push(option);
      } else {
        this.selectedOptionsClase.push(option);
      }
    }

    // Actualiza el control del formulario
    if (nameForm == 'idAreaOperacion') {
      this.formGroup4.get(nameForm)?.setValue(this.selectedOptionsDeparts);
      console.log('Opciones seleccionadas:', this.selectedOptionsDeparts);
    } else {
      this.formGroup4.get(nameForm)?.setValue(this.selectedOptionsClase);
      console.log('Opciones seleccionadas:', this.selectedOptionsClase);
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
          formGroup.patchValue({ [formControlName]: base64Array });
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
    this.formGroup2.patchValue({ [index]: value });

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
      this.formGroup2.patchValue({ 2: resultado.toFixed(2) });
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

  //Metodo para enviar los formularios
  onSubmitAllForms() {
    //Obtener el valor de input para determinar la cantidad de contratos
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
      //Si el numero de contratos es mayor a 0
      if (this.totalContracts > 0) {
        this.submitted = true;
        this.formGroup4.markAllAsTouched();

        //Si el form esta lleno con todos los datos
        if (this.formGroup4.valid) {
          this.currentContractIteration += 1;
          //Lógica para múltiples contratos
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
        idClaseVehiculo: item.idClaseVehiculo.map((i: { value: any }) => i.value),
        valorContrato: item.valorContrato,
        idFormaPago: item.idFormaPago,
        idAreaOperacion: item.idAreaOperacion.map((i: { value: any }) => i.value),
        disponibilidadVehiculosEstimada: item.disponibilidadVehiculosEstimada,
        estado: true,
      });
    });

    // Rellenar el array documentos
    this.formGroup1.value[1].forEach((item: any) => {
      documentos.push({
        nit: this.formGroup3.get('nit')?.value,
        documento: item,
      });
    });

    const allFormsData = {
      fechaSolicitud: new Date(),
      nombreEmpresa: this.formGroup3.get('nombreEmpresa')?.value,
      nit: this.formGroup3.get('nit')?.value,
      territorial: 'Medellin',
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
