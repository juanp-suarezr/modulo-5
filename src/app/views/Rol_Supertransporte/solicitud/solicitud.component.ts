import { AuthService } from './../../../services/auth/auth.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';
import { InputText } from '../../../components/input/input.component';
import { LeftNavComponent } from '../../../components/left-nav/left-nav.component';
import { formatDate, NgClass, NgForOf, NgIf } from '@angular/common';
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
  }

  //Capturar objetos del navigation
  id: string = '0';
  //solicitud traida
  solicitud: any;

  //Objeto para manejar los active num del left menu y stepper.
  activeNum: string = '0'; //Left menu
  activeStep: number = 1; //Stteper

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

    

    //TRAERSE ID
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      id: string;
    };

    if (state) {
      this.id = state.id;
      console.log(this.id);
      localStorage.setItem('id', this.id.toString());
    } else {
      const storedId = localStorage.getItem('id');
      this.id = storedId ? storedId : '0';
    }

    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.loadOptions();

  }


  loadOptions() {
    //GET SOLICITUD
    this.apiSFService.getSolicitudByID(this.id).subscribe(
      (response) => {
        this.solicitud = response;
        console.log(response);
        
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
