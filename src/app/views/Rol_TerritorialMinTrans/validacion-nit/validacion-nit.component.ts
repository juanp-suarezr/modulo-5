import { ApiSFService } from './../../../services/api/apiSF.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { PrimaryButtonComponent } from '../../../components/primary-button/primary-button.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertComponent } from '../../../components/alert/alert.component';
import { NoNegativeGlobal } from '../../../validator/noNegative.validator';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  timeout,
} from 'rxjs/operators';

@Component({
  selector: 'app-validacion-nit',
  standalone: true,
  imports: [
    PrimaryButtonComponent,
    CommonModule,
    ReactiveFormsModule,
    AlertComponent,
  ],
  templateUrl: './validacion-nit.component.html',
  styleUrl: './validacion-nit.component.css',
})
export default class ValidacionNitComponent {
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private apiSFService: ApiSFService,
    private router: Router
  ) {}

  submitted: boolean = false;
  formGroup1!: FormGroup;
  showModal: boolean = false; // Control para mostrar el modal de error
  ShowLoadingModal: boolean = false; //loading
  showModalWarning: boolean = false; //warning fallo en consulta solicitudes - nit
  showModalWarning1: boolean = false; //warning fallo en consulta rues
  showModalAlerta: boolean = false; // Control para mostrar el modal de error cuando no esta registrado
  showModalAlerta1: boolean = false; // Control para mostrar el modal de error cuando matricula vencida
  isProcessing: boolean = true; // Control para deshabilitar el botón

  ngOnInit(): void {
    this.initializeForm();

    // Configuración inicial del FormGroup
  }

  initializeForm() {
    this.formGroup1 = this.fb.group({
      nombreEmpresa: ['', { value: '', disabled: true }, Validators.required],
      nit: ['901852316', [Validators.required, NoNegativeGlobal]],
    });
  }

  ngAfterViewInit() {
    this.formGroup1.get('nombreEmpresa')?.disable();
    

    // Escuchar cambios en el campo 'nit'
    this.formGroup1
      .get('nit')
      ?.valueChanges.pipe(
        debounceTime(500), // Espera 500ms después de que el usuario haya dejado de escribir
        distinctUntilChanged(), // Solo realiza la consulta si el valor cambia realmente
        switchMap((value: string) => {
          this.isProcessing = true;
          this.formGroup1
                .get('nombreEmpresa')
                ?.setValue('');
          // Verificar si el valor es válido para hacer la consulta
          if (value && value.length >= 9) {
            return this.apiSFService.getDataByNIT(value).pipe(
              timeout(5000), // Tiempo máximo de espera de 5 segundos
              catchError((error) => {
                console.error('Error al enviar los datos:', error);
                this.showModalWarning1 = true;
                this.formGroup1.get('nombreEmpresa')?.enable();
                this.isProcessing = false;
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

  validator() {
    if (this.formGroup1.valid) {
      this.isProcessing = true; // Deshabilita el botón
      this.ShowLoadingModal = true;
      this.apiSFService
        .getSolicitudByNIT(this.formGroup1.get('nit')?.value)
        .subscribe(
          (response) => {
            console.log(response.registrado); // Muestra la respuesta en la consola
            this.isProcessing = false; // Habilita el botón de nuevo
            this.ShowLoadingModal = false;
            if (response.registrado) {
              this.showModal = true;
            } else {
              this.router.navigate(['/fijacioncapacidadtransportadora'], {
                state: {
                  nit: this.formGroup1.get('nit')?.value,
                  nombreEmpresa: this.formGroup1.get('nombreEmpresa')?.value,
                },
              });
            }
          },
          (error) => {
            console.error('Error fetching user data', error); // Maneja el error si ocurre
            this.isProcessing = false; // Habilita el botón de nuevo
            this.ShowLoadingModal = false;
            this.showModalWarning = true;
          }
        );
    } else {
      this.submitted = true;
      this.formGroup1.markAllAsTouched();
    }
  }

  handleCloseByButton2() {
    this.router.navigate(['/dashboard']).then(() => {});
  }
}
