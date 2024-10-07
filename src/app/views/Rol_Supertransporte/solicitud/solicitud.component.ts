import { AuthService } from './../../../services/auth/auth.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';
import { InputText } from '../../../components/input/input.component';
import { LeftNavComponent } from '../../../components/left-nav/left-nav.component';
import {
  CommonModule,
  formatDate,
  NgClass,
  NgForOf,
  NgIf,
} from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { PrimaryButtonComponent } from '../../../components/primary-button/primary-button.component';
import { SelectComponent } from '../../../components/select/select.component';
import { SttepperComponent } from '../../../components/sttepper/sttepper.component';
import { ActiveNumService } from '../../../services/left-nav/active-num.service';
import { ActiveNumStepperService } from '../../../services/stepper/active-num.service';
import { ApiService } from '../../../services/api/api.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ErrorService } from '../../../services/error/error.service';
import { AlertComponent } from '../../../components/alert/alert.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiSFService } from '../../../services/api/apiSF.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { BehaviorSubject } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { blob } from 'stream/consumers';

@Component({
  selector: 'app-solicitud',
  standalone: true,
  imports: [
    FileUploadComponent,
    InputText,
    LeftNavComponent,
    NgIf,
    PaginatorModule,
    PrimaryButtonComponent,
    SelectComponent,
    SttepperComponent,
    ReactiveFormsModule,
    NgClass,
    AlertComponent,
    NgForOf,
    InputSwitchModule,
    CommonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './solicitud.component.html',
  styleUrl: './solicitud.component.css',
})
export default class SolicitudComponent {
  constructor(
    private stateService: ActiveNumService,
    private stepperService: ActiveNumStepperService,
    private authService: AuthService,
    private fb: FormBuilder,
    private errorService: ErrorService,
    private apiSFService: ApiSFService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // Inyectar ChangeDetectorRef
  ) {
    this.user = this.authService.currentUser; // Almacena el usuario actual desde el servicio de autenticación

    // TRAER ID DESDE NAVEGACIÓN O LOCALSTORAGE
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { id: string };
    console.log(state);

    if (state && state.id) {
      console.log(state.id);
      this.setId(state.id); // Establecer nuevo ID
    } else {
      const storedId = localStorage.getItem('id');
      if (storedId) {
        this.setId(storedId); // Establecer ID desde localStorage
      }
    }
  }

  //forms
  submitted: boolean = false;
  //identificador de actualización de file
  isActuFile: [number] = [-1];
  //estado requerimiento
  smlmmv: number = 1300000;

  //LOADING PAGE
  loadingPage: boolean = true;

  //Capturar objetos del navigation
  private idSubject = new BehaviorSubject<string>('0'); // Inicializa con '0'
  id$ = this.idSubject.asObservable(); // Observable para observar cambios
  //solicitud traida
  solicitud: any;

  //Objeto para manejar los active num del left menu y stepper.
  activeNum: string = '0'; //Left menu
  activeStep: number = 1; //Stteper

  //DATOS SUBSANAR
  checked: boolean = false;

  //Formularios
  formGroup1!: FormGroup;
  formGroup2!: FormGroup;
  formGroup3!: FormGroup;
  formGroup4!: FormGroup;

  //Objeto para manejar errores
  errorStates: { [key: number]: boolean } = {};

  //Respuesta de user activo y rol
  user: any;
  //respuesta formas de pago
  formasPago: any;
  //respuesta id operacion
  departamentos: any;
  //respuesta clase vehiculos
  claseVehiculos: any;

  //Control para mostrar modales
  showModal: boolean = false;
  showModal1: boolean = false;
  ShowLoadingModal: boolean = false;
  showErrorModal: boolean = false;

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
    {
      num: '2',
      name: 'Financiero',
    },
  ];

  //Menu stepper
  infoStepper = [
    {
      num: 1,
      info: 'Visualizar solicitud',
    },
    {
      num: 2,
      info: 'Visualizar documentos',
    },
    {
      num: 3,
      info: 'Visualizar información',
    },
    {
      num: 4,
      info: 'Visualizar radicado',
    },
  ];

  //Menu stepper1
  infoStepper1 = [
    {
      num: 1,
      info: 'Visualizar información operativo',
    },
    {
      num: 2,
      info: 'Cargue de documentación',
    },
  ];

  //Props o datos para input upload
  dataClass = {
    textSize: 'xs',
    textInfo: 'Archivo PDF. Peso máximo: 2MB',
  };

  currentIndex: number = 0;
  maxVisibleFiles: number = 1;

  //slide contratos
  currentContractIndex: number = 0; // Empieza en el primer contrato

  //form dinamico num vehiculos
  activeHeader: number | null = 0;

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
    this.formGroup1 = this.fb.group({
      1: [null, Validators.required],
    });
    this.formGroup2 = this.fb.group({
      2: [null, Validators.required],
      'rentaNeta': ['', Validators.required],
    });

    //Suscribirse al servicio de manejo de errores
    this.errorService.errorStates$.subscribe((errorStates) => {
      this.errorStates = errorStates;
    });

    // Suscribirse a los cambios de id para almacenar en localStorage
    this.id$.subscribe((newId) => {
      localStorage.setItem('id', newId); // Actualizar localStorage cuando id cambie
      console.log('ID actualizado en localStorage:', newId);
      this.loadOptions();
    });

    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  // Método para actualizar el id y el BehaviorSubject
  setId(newId: string): void {
    this.idSubject.next(newId); // Actualizar el id en el BehaviorSubject
  }

  // Método para cambiar el ID desde cualquier parte del componente
  updateId(newId: string) {
    this.setId(newId); // Actualiza el ID usando el método setId
  }

  loadOptions() {
    //GET SOLICITUD
    this.apiSFService.getAllSolicitudByID(this.idSubject.getValue()).subscribe(
      (response) => {
        //respuesta formas de pago
        this.apiService.getFormasPago().subscribe((response1) => {
          this.formasPago = response1.detalle;
        });
        //respuesta clase vehiculos
        this.apiService.getClaseVehiculo().subscribe((response2) => {
          this.claseVehiculos = response2.detalle;
        });
        //respuesta areas de operacion
        this.apiService.getDeparts().subscribe((response3) => {
          this.departamentos = response3;
        });

        this.solicitud = response;
        console.log(response);
        this.loadingPage = false;
      },
      (error) => {
        this.loadingPage = false;
        console.error('Error fetching user data', error);
      }
    );
  }

  //Get formas de pago
  getFormasPagos(idPago: number) {
    // Busca el elemento que coincida con el id
    const formaPago = this.formasPago.find((element: any) => {
      return parseInt(element.id) === idPago; // Compara ambos como números
    });

    // Asegúrate de que formaPago no sea undefined
    if (formaPago) {
      return formaPago.descripcion;
    } else {
      console.log('No se encontró el id:', idPago); // Para depurar si no encuentra coincidencia
      return; // Valor por defecto
    }
  }

  //Get areas de operacion
  getAreasOperacion(Areas: any) {
    let found: any[] | undefined = [];
    Areas.filter((area: any) => {
      found.push(
        this.departamentos.find((element: any) => {
          // console.log('Area ID:', area.idMunicipioArea); // Para verificar el ID del municipio en Areas
          return parseInt(area.idMunicipioArea) === element.id;
        }).descripcion
      );

      return found !== undefined; // Retorna verdadero si se encuentra coincidencia
    });

    // Asegúrate de que areasOp no sea undefined
    if (found) {
      return found.map((depto: any) => depto).join(', ');
    } else {
      console.log('No se encontró el id:'); // Para depurar si no encuentra coincidencia
      return; // Valor por defecto
    }
  }

  //Get clase vehiculos
  getClaseVehiculos(clase: any) {
    // Busca el elemento que coincida con el id
    const claseVehiculo = this.claseVehiculos.find((element: any) => {
      return parseInt(element.id) === clase; // Compara ambos como números
    });

    // Asegúrate de que claseVehiculo no sea undefined
    if (claseVehiculo) {
      return claseVehiculo.descripcion;
    } else {
      console.log('No se encontró el id:', clase); // Para depurar si no encuentra coincidencia
      return; // Valor por defecto
    }
  }

  //FORMATO FECHA
  formatField(value: any): string {
    // Si el valor es una fecha válida, formatearlo

    if (this.isDateTime(value)) {
      return formatDate(value, 'dd/MM/yyyy', 'en-US', 'UTC');
    }
    return value;
  }

  //formatear decimales a meses y dias
  formatMonthsAndDays(decimalMonths: number): string {
    const months = Math.floor(decimalMonths); // Parte entera, representa los meses completos
    const fractionalMonths = decimalMonths - months; // Parte fraccionaria, representa la fracción de mes

    // Supongamos que cada mes tiene 30 días (puedes ajustar esto si necesitas mayor precisión)
    const days = Math.round(fractionalMonths * 30); // Convierte la fracción en días

    // Formatear el resultado
    let result = '';
    if (months > 0) {
      result += `${months} mes${months !== 1 ? 'es' : ''}`;
    }
    if (days > 0) {
      if (months > 0) result += ' y ';
      result += `${days} día${days !== 1 ? 's' : ''}`;
    }

    return result || '0 días';
  }

  //FORMATO MONEDA
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  }

  isDateTime(value: any): boolean {
    // Verifica si el valor es una cadena en un formato de fecha válido (como yyyy-mm-dd o dd/mm/yyyy)
    const dateRegex = /^\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}$/;

    // Si el valor es una cadena que no coincide con el formato de fecha, no es una fecha
    if (typeof value === 'string' && !dateRegex.test(value)) {
      return false;
    }

    // Si el valor pasa el regex o no es una cadena, intenta parsearlo como fecha
    return !isNaN(Date.parse(value));
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

  //METODO PARA SEMAFORO
  diferencias(): number {
    if (this.solicitud) {
      // Convertir las fechas a milisegundos
      const fechaHoy = new Date().valueOf(); // Fecha actual en milisegundos
      const fechaSolicitud = new Date(
        this.solicitud.formulario.fechaSolicitud
      ).valueOf(); // Fecha de solicitud en milisegundos

      // Calcular la diferencia en milisegundos
      const diferenciaMilisegundos = fechaHoy - fechaSolicitud;

      // Convertir la diferencia de milisegundos a días
      const diferenciaDias = Math.floor(
        diferenciaMilisegundos / (1000 * 60 * 60 * 24)
      );

      return diferenciaDias;
    } else {
      return 0;
    }
  }
  //OBTENER COLOR SEMAFORO
  getColorForSemaforo(dias: number, maxDias: number): string {
    const diaRojo = maxDias == 30 ? 9 : 3;
    const MindiaAmarillo = maxDias == 30 ? 10 : 4;
    const MaxdiaAmarillo = maxDias == 30 ? 19 : 7;
    const diaVerde = maxDias == 30 ? 20 : 8;

    if (dias <= diaRojo) {
      return '#068460'; // 1-3 días: verde
    } else if (dias >= MindiaAmarillo && dias <= MaxdiaAmarillo) {
      return '#FFAB00'; // 4-7 días: amarillo
    } else if (dias >= diaVerde) {
      return '#A80521'; // 8-10 días: rojo
    }
    return 'gray'; // Default para valores inesperados
  }

  //OBTENER MEDIDOR (ALTO, MEDIO,BAJO)
  getMedidor(porcentaje:number, name:string): string {
    let text = '';
    switch (name) {
      case 'renta':
        if (porcentaje > 3.1) {
          text = 'Bajo'
        } else if(porcentaje > 2.1 || porcentaje <= 3.1) {
          text = 'Medio'
        } else {
          text = 'Alto'
        }
        break;
    
      default:
        break;
    }
    return text;
  }

  //Metodo para cambiar el valor del menuleft
  changeActiveNum(newValue: string, saved?: any) {
    if (this.solicitud.formulario.radicadoSalida) {
      saved = true;
    }
    if (newValue == '2') {
      if (saved) {
        this.stateService.setActiveNum(newValue);
      }
    } else if(newValue == '3') {
      if (saved && this.solicitud.formulario.excelModeloTransporte) {
        this.stateService.setActiveNum(newValue);
      }
      
    } else {
      this.stateService.setActiveNum(newValue);
    }
  }

  //Metodo para cambiar el valor del stepper
  changeActiveStep(newValue: number) {
    switch (newValue) {
      case 1:
        this.stepperService.setActiveNum(newValue);
        break;
      case 2:
        this.stepperService.setActiveNum(newValue);
        break;
      case 3:
        this.stepperService.setActiveNum(newValue);
        break;
      case 4:
        this.stepperService.setActiveNum(newValue);
        break;
      case 5:
        this.changeActiveNum('1');
        this.stepperService.setActiveNum(1);
        break;

      default:
        break;
    }

    console.log(this.errorStates);
  }

  //Metodo para cambiar el valor del stepper 1
  changeActiveStep1(newValue: number) {
    switch (newValue) {
      case 1:
        this.stepperService.setActiveNum(newValue);
        break;
      case 2:
        this.stepperService.setActiveNum(newValue);
        break;
      case 3:
        this.stepperService.setActiveNum(1);
        break;

      default:
        break;
    }

    console.log(this.errorStates);
  }

  //metodo para guardar el archivo seleccionado
  onFileSelected(file: File[], formControlName: number) {
    this.ActuFileGuardado(formControlName);

    this.convertFilesToBase64(file)
      .then((base64Array) => {
        const formControlMap: { [key: number]: FormGroup } = {
          1: this.formGroup1,
          2: this.formGroup2,
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

  //Actualizar archivos guardados
  ActuFileGuardado(num: number) {
    this.isActuFile.push(num);
  }

  //Metodo para mostrar el pdf
  truncatedFileName(fileName: string, maxLength: number = 20): string {
    if (fileName.length <= maxLength) {
      return fileName;
    }
    const truncated = fileName.substring(0, maxLength - 3) + '...';
    return truncated;
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

  getDocumentSize(base64File: string) {
    if (base64File == null || base64File == '') {
      return;
    }
    const blob = this.convertBase64ToBlob(base64File);
    const url = URL.createObjectURL(blob);

    return blob.size;
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
    let url;
    if (blob instanceof Blob) {
      url = URL.createObjectURL(blob);
    } else {
      const blobData = this.convertBase64ToBlob(blob);
      url = URL.createObjectURL(blobData);
    }

    window.open(url);
  }

  downloadPDF(blob: Blob, name: string) {
    let url;
    if (blob instanceof Blob) {
      url = URL.createObjectURL(blob);
    } else {
      const blobData = this.convertBase64ToBlob(blob);
      url = URL.createObjectURL(blobData);
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  }

  //MOSTRAR CONTRATOS GUARDADOS
  get visibleFiles(): any[] {
    return this.solicitud?.documentos.slice(
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
      this.solicitud?.documentos.length - this.maxVisibleFiles
    ) {
      this.currentIndex++;
    }
  }

  //MOSTRAR INFO CONTRATOS SLIDER
  get totalContracts() {
    return this.solicitud?.contratos?.length || 0;
  }

  // Avanzar al siguiente contrato
  nextContract() {
    if (this.currentContractIndex < this.totalContracts - 1) {
      this.currentContractIndex++;
    }
  }

  // Retroceder al contrato anterior
  prevContract() {
    if (this.currentContractIndex > 0) {
      this.currentContractIndex--;
    }
  }

  // Cambia el header activo en clase vehiculos / cantidad
  setActiveHeader(index: number): void {
    this.activeHeader = index;
    this.cdr.detectChanges();
  }

  //Metodos Modal
  handleClose() {
    console.log('Modal closed');
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
    this.showModal = false;
    this.router.navigate(['/dashboard']).then(() => {
      location.reload();
    });
  }

  //Metodo para guardar el formulario
  onSubmitAllForms() {
    if (this.validateFormGroup(this.formGroup1, this.errorStates)) {
      this.ShowLoadingModal = true; // Mostrar modal
      console.log(this.formGroup1.get('1')?.value);
      console.log(this.formGroup1);

      const data = {
        radicadoSalida: this.formGroup1.get('1')?.value[0],
      };
      // put paso 2 actualizar - cargue 2
      this.apiSFService
        .RadicadoSalida(this.solicitud.formulario.id, data)
        .subscribe(
          (response) => {
            // Aquí puedes manejar la respuesta, por ejemplo:
            this.showModal = true;

            console.log('Datos enviados exitosamente:', response);
          },
          (error) => {
            this.ShowLoadingModal = false;
            this.showErrorModal = true;
            // Manejo del error
            console.error('Error al enviar los datos:', error);
          }
        );
    } else {
      this.ShowLoadingModal = false; // Mostrar modal
      this.submitted = true;
      this.formGroup1.markAllAsTouched();
    }
  }

  SaveInfo() {
    if (this.validateFormGroup(this.formGroup2, this.errorStates)) {
      this.ShowLoadingModal = true; // Mostrar modal
      console.log(this.formGroup1.get('2')?.value);
      console.log(this.formGroup1);

      const data = {
        excelModeloTransporte: this.formGroup2.get('2')?.value[0],
        rentaNeta: '',
        solidez: '',
        liquidez: '',
        rentaOperacional: '',
      };
      // put paso 2 actualizar - cargue 2
      this.apiSFService
        .RadicadoSalida(this.solicitud.formulario.id, data)
        .subscribe(
          (response) => {
            // Aquí puedes manejar la respuesta, por ejemplo:
            this.showModal1 = true;

            console.log('Datos enviados exitosamente:', response);
          },
          (error) => {
            this.ShowLoadingModal = false;
            this.showErrorModal = true;
            // Manejo del error
            console.error('Error al enviar los datos:', error);
          }
        );
    } else {
      this.ShowLoadingModal = false; // Mostrar modal
      this.submitted = true;
      this.formGroup1.markAllAsTouched();
    }
  }
}
