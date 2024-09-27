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

  //Control para mostrar el modal intermedio
  showModal: boolean = false;

  //Variables de pdf
  pdfUrl: string = 'https://www.orimi.com/pdf-test.pdf';
  fileName: string = 'archivo-prueba.pdf';
  fileSizeInKB: number = 123.45;

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
    this.apiSFService.getSolicitudByID(this.idSubject.getValue()).subscribe(
      (response) => {
        this.solicitud = response;
        console.log(response);
        this.loadingPage = false;
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );
  }
  //FORMATO FECHA
  formatField(value: any): string {
    // Si el valor es una fecha válida, formatearlo

    if (this.isDateTime(value)) {
      return formatDate(value, 'dd/MM/yyyy', 'en-US', 'UTC');
    }
    return value;
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

  //METODO PARA SEMAFORO
  diferencias(): number {
    if (this.solicitud) {
      // Convertir las fechas a milisegundos
      const fechaHoy = new Date().valueOf(); // Fecha actual en milisegundos
      const fechaSolicitud = new Date(this.solicitud.fechaSolicitud).valueOf(); // Fecha de solicitud en milisegundos

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
        if (this.formGroup1) {
          this.stepperService.setActiveNum(newValue);
        }
        break;
      case 3:
        if (this.formGroup2) {
          this.changeActiveNum('1');
          this.stepperService.setActiveNum(newValue);
        }
        break;
      case 4:
        if (this.formGroup3) {
          this.changeActiveNum('2');
          this.stepperService.setActiveNum(newValue);
        }
        break;

      default:
        break;
    }

    console.log(this.errorStates);
  }

  //Metodo para guardar el archivo seleccionado
  onFileSelected(file: File[], formControlName: number) {
    const formControlMap: { [key: number]: FormGroup } = {
      9: this.formGroup4,
    };

    const formGroup = formControlMap[formControlName];
    if (formGroup) {
      formGroup.patchValue({ [formControlName]: file });
    }
  }

  //Metodo para mostrar el pdf
  truncatedFileName(fileName: string, maxLength: number = 20): string {
    if (fileName.length <= maxLength) {
      return fileName;
    }
    const truncated = fileName.substring(0, maxLength - 3) + '...';
    return truncated;
  }

  //Metodo para descargar pdf
  downloadPdf() {
    fetch(this.pdfUrl, { mode: 'no-cors' })
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = this.fileName;
        link.click();
      })
      .catch((error) => console.error('Error al descargar el archivo:', error));
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
}
