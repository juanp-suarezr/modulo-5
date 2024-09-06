import { AuthService } from './../../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { PaginatorComponent } from '../../components/paginator/paginator.component';
import { TableComponent } from '../../components/table/table.component';
import { ApiService } from '../../services/api/api.service';
import { ApiSFService } from '../../services/api/apiSF.service';
import { SkeletonModule } from 'primeng/skeleton';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    AccordionModule,
    BadgeModule,
    PaginatorComponent,
    TableComponent,
    SkeletonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export default class DashboardComponent {
  response: any;
  apiResponse: any;
  user: any;
  loading: boolean = true; // Estado de carga

  headers = [
    {id: 1, titulo: 'ID'},
    {id: 2, titulo: 'Fecha solicitud <br> (dd/mm/aaaa)'},
    {id: 3, titulo: 'Nombre de la empresa <br> que realiza solicitud'},
    {id: 4, titulo: 'Territorial que <br> emitió la solicitud'},
    {id: 5, titulo: 'Categoría de <br> solicitud'},
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private apiSFService: ApiSFService,
    private authService: AuthService
  ) {
    this.user = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.apiService.getCategorias().subscribe(
      (response) => {
        console.log(response);
        this.getSolicitudes(response);
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );
  }

  //obtener solicitudes
  getSolicitudes(res: any) {
    this.loading = true; // Comienza la carga de datos
  
    // traer los datos de la consulta
    this.apiSFService.getSolicitudes().subscribe(
      (response) => {
        
        // Validar roles y generar headers después de cargar los datos
        if (
          this.user.roles.some((role: any) =>
            role.roleName.includes('ROLE_SUPERTRANSPORTE')
          )
        ) {
          this.headers = [
            { id: 1, titulo: 'ID' },
            { id: 2, titulo: 'Fecha solicitud <br> (dd/mm/aaaa)' },
            { id: 3, titulo: 'Nombre de la empresa <br> que realiza solicitud' },
            { id: 4, titulo: 'Territorial que <br> emitió la solicitud' },
            { id: 6, titulo: 'Estado <br> solicitud' },
            { id: 7, titulo: 'Categoría de<br> solicitud' },
            { id: 8, titulo: 'Semáforo <br> alerta' },
            { id: 9, titulo: 'Número<br> radicado' },
          ];
  
          this.response = response.map((clase: any) => ({
            id: clase.id,
            fecha: clase.fechaSolicitud,
            empresa: clase.nombreEmpresa,
            territorial: clase.territorial,
            estado: clase.estado,
            categoria: clase.idCategoriaSolicitud,
            semaforo: clase.idCategoriaSolicitud,
            radicado: clase.idCategoriaSolicitud,
          }));

          this.loading = false; // Termina la carga de datos

        } else {
          console.log(response);
          this.response = response.map((clase: any) => ({
            id: clase.id,
            fecha: clase.fechaSolicitud,
            empresa: clase.nombreEmpresa,
            territorial: clase.territorial,
            categoria: clase.idCategoriaSolicitud,
          }));

          this.loading = false; // Termina la carga de datos

        }
      },
      (error) => {
        this.loading = false; // Termina la carga de datos en caso de error
        console.error('Error fetching user data', error);
      }
    );
  }
  

  //ejemplo uso update
  updateItem(id: number, data: any): void {
    this.apiService.updateItem(id, data).subscribe(
      (response) => {
        console.log('Item updated successfully:', response);
      },
      (error) => {
        console.error('Error updating item', error);
      }
    );
  }

  //Metodo para redirigir el id a la vista solicitud
  onIdClicked(id: number): void {
    this.router.navigate(['/solicitud', id]);
  }
}
