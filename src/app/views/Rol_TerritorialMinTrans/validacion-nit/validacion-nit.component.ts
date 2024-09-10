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
  isProcessing: boolean = false; // Control para deshabilitar el botón

  ngOnInit(): void {
    this.initializeForm();
    // Configuración inicial del FormGroup
  }

  initializeForm() {
    this.formGroup1 = this.fb.group({
      nombreEmpresa: ['', [Validators.required]],
      nit: ['', [Validators.required, NoNegativeGlobal]],
    });
  }

  validator() {
    if (this.formGroup1.valid) {
      this.isProcessing = true; // Deshabilita el botón
      this.apiSFService
        .getSolicitudByNIT(this.formGroup1.get('nit')?.value)
        .subscribe(
          (response) => {
            console.log(response.registrado); // Muestra la respuesta en la consola
            this.isProcessing = false; // Habilita el botón de nuevo
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
