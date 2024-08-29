import {Component} from '@angular/core';
import {FileUploadComponent} from "../../../components/file-upload/file-upload.component";
import {InputText} from "../../../components/input/input.component";
import {LeftNavComponent} from "../../../components/left-nav/left-nav.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {PrimaryButtonComponent} from "../../../components/primary-button/primary-button.component";
import {SelectComponent} from "../../../components/select/select.component";
import {SttepperComponent} from "../../../components/sttepper/sttepper.component";
import {ActiveNumService} from "../../../services/left-nav/active-num.service";
import {ActiveNumStepperService} from "../../../services/stepper/active-num.service";
import {ApiService} from "../../../services/api/api.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ErrorService} from "../../../services/error/error.service";
import {AlertComponent} from "../../../components/alert/alert.component";
import {Router} from "@angular/router";

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
    NgForOf
  ],
  templateUrl: './solicitud.component.html',
  styleUrl: './solicitud.component.css'
})
export default class SolicitudComponent {


  constructor(
    private stateService: ActiveNumService,
    private stepperService: ActiveNumStepperService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private errorService: ErrorService,
    private router: Router
  ) {
  }

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
      name: 'Radicado',
    },
  ];

  //Menu stepper
  infoStepper = [
    {
      num: 1,
      info: 'Visualizar documentos',
    },
    {
      num: 2,
      info: 'Visualizar información',
    }
  ];

  //Inputs
  inputs = [
    //Input 0
    {
      name: 'capital_social',
      type: 'number',
      placeholder: '$100.000',
      label: 'Capital social',
      required: false,
      value: ''
    },
    //Input 1
    {
      name: 'Patrimonio_liquido',
      type: 'number',
      placeholder: '$100.000',
      label: 'Patrimonio Líquido en SMLV',
      required: false,
      value: ''
    },
    //Input 2
    {
      name: 'Cantidad_vehiculo',
      type: 'number',
      placeholder: '5',
      label: 'Cantidad de vehículos',
      required: false,
      value: ''
    },

    //Formulario 3 Operativo

    //Contenido 1
    //Input 3
    {
      name: 'Cantidad de contratos',
      type: 'number',
      placeholder: '3',
      label: 'Cantidad de contratos*',
      required: false,
      value: '',
    },
    //Input 4
    {
      name: 'N° de contrato',
      type: 'number',
      placeholder: '3',
      label: 'N° de contrato*',
      required: false,
      value: '',
    },
    //Input 5
    {
      name: 'Contratante',
      type: 'string',
      placeholder: 'Pepito S.A.S',
      label: 'Contratante*',
      required: false,
      value: '',
    },

    //Contenido 2
    //Input 6
    {
      name: 'Fecha de inicio',
      type: 'string',
      placeholder: '',
      label: 'Fecha de inicio*',
      required: false,
      value: '01/01/2024',
    },
    //Input 7
    {
      name: 'Fecha de terminacion',
      type: 'string',
      placeholder: '',
      label: 'Fecha de terminación*',
      required: false,
      value: '31/07/2024',
    },
    //Input 8
    {
      name: 'Numero de meses',
      type: 'number',
      placeholder: '7',
      label: 'N° de meses*',
      required: false,
      value: '',
    },

    //Contenido 3
    //Input 9
    {
      name: 'Numero de vehiculos',
      type: 'number',
      placeholder: '5',
      label: 'N° de vehiculos*',
      required: false,
      value: '',
    },
    //Input 10
    {
      name: 'Clase de vehiculos',
      type: 'string',
      placeholder: 'Bus',
      label: 'Nombre de clase de vehiculos*',
      required: false,
      value: '',
    },
    //Input 11
    {
      name: 'Valor de contrato',
      type: 'number',
      placeholder: '$100.000.000',
      label: 'Valor de contrato*',
      required: false,
      value: '',
    },

    //Contenido 4
    //Input 12
    {
      name: 'Forma de pago',
      type: 'string',
      placeholder: 'diaria',
      label: 'Forma de pago*',
      required: false,
      value: '',
    },
    //Input 13
    {
      name: 'Areas de Operacion',
      type: 'string',
      placeholder: 'Risaralda',
      label: 'Areas de operacion*',
      required: false,
      value: '',
    },
    //Input 14
    {
      name: ' Tiempos estimados',
      type: 'number',
      placeholder: '10',
      label: ' Tiempos estimados en horas*',
      required: false,
      value: '',
    },

    //Formulario 4 Radicado

    //Contenido 1
    //Input 15
    {
      name: 'Fecha de radicado',
      type: 'date',
      placeholder: 'dd/mm/aaaa',
      label: 'Fecha de radicado*',
      required: true,
      value: '',
      error: 'Fecha de radicado es obligatorio',
      good: 'Dato correcto',
    },
    //Input 16
    {
      name: 'N° de radicado',
      type: 'number',
      placeholder: '#',
      label: 'N° de radicado*',
      required: true,
      value: '',
      error: 'N° de radicado es obligatorio',
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

    //Traer los datos de la consulta, para roles
    this.apiService.getAuthUserAndRoles().subscribe(
      (response) => {
        this.user = response.user;
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );

    //Validaciones segun el formulario
    this.formGroup1 = this.fb.group({
      1: [null],
      2: [null],
      3: [null],
      4: [null],
      5: [null],
      6: [null],
      7: [null],
      8: [null],
    });

    this.formGroup2 = this.fb.group({
      0: [''],
      1: [''],
      2: ['']
    });

    this.formGroup3 = this.fb.group({
      3: [''],
      4: [''],
      5: [''],
      6: [''],
      7: [''],
      8: [''],
      9: [''],
      10: [''],
      11: [''],
      12: [''],
      13: [''],
      14: [''],
    });

    this.formGroup4 = this.fb.group({
      9: [null, Validators.required],
      15: ['', Validators.required],
      16: ['', Validators.required]
    });

    //Suscribirse al servicio de manejo de errores
    this.errorService.errorStates$.subscribe((errorStates) => {
      this.errorStates = errorStates;
    });

  }

  //Validador de formularios
  validateFormGroup(
    formGroup: FormGroup,
    errorStates: { [key: number]: boolean }
  ): boolean {
    let isValid = true;
    for (const key in formGroup.controls) {
      if (formGroup.controls.hasOwnProperty(key)) {
        const control = formGroup.controls[key];
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
      9: this.formGroup3,
    };

    const formGroup = formControlMap[formControlName];
    if (formGroup) {
      formGroup.patchValue({[formControlName]: file});
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
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = this.fileName;
        link.click();
      })
      .catch(error => console.error('Error al descargar el archivo:', error));
  }


  //Metodo para guardar el valor del input y select
  onInputChange(index: number, event: any) {
    let value = null;

    if (event.target) {
      const inputElement = event.target as HTMLInputElement;
      value = inputElement?.value ?? ''; // Maneja valores nulos

      //Asumiendo que el `input-text` está en el índice 0
      if (index === 16) {
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
    this.formGroup4.patchValue({[index]: value});

  }

  //Metodo para guardar el formulario
  onSubmitAllForms() {
    if (this.validateFormGroup(this.formGroup4, this.errorStates)) {
      this.showModal = true; // Mostrar modal
    }
    else {
      this.validateFormGroup(this.formGroup4, this.errorStates);
    }
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
