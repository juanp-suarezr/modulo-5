import { AuthService } from './../../services/auth/auth.service';
import {
  Component,
  OnInit,
  ApplicationRef,
  ChangeDetectorRef,
} from '@angular/core';
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
import { first } from 'rxjs';
import { PrimaryButtonComponent } from "../../components/primary-button/primary-button.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    AccordionModule,
    BadgeModule,
    PaginatorComponent,
    TableComponent,
    SkeletonModule,
    PrimaryButtonComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export default class DashboardComponent {
  response: any;
  apiResponse: any;
  user: any;
  loading: boolean = true; // Estado de carga


  //arrays 
  categorias: any;
  estadoSolicitud: any;
  // Variables de filtro
  filterCategory: number = 0;
  filterStatus: number = 0;
  searchQuery: string = '';

  headers = [
    { id: 1, titulo: 'ID' },
    { id: 2, titulo: 'Fecha solicitud <br> (dd/mm/aaaa)' },
    { id: 3, titulo: 'Nombre de la empresa <br> que realiza solicitud' },
    { id: 4, titulo: 'Territorial que <br> emitió la solicitud' },
    { id: 5, titulo: 'Categoría de <br> solicitud' },
  ];
  

  constructor(
    private apiService: ApiService,
    private router: Router,
    private apiSFService: ApiSFService,
    private authService: AuthService,
    private appRef: ApplicationRef, // Servicio para manejar el estado de la aplicación
    private cdRef: ChangeDetectorRef // Inyecta el ChangeDetectorRef
  ) {
    this.user = this.authService.currentUser; // Almacena el usuario actual desde el servicio de autenticación
  }

  // Getter para verificar el rol
  get hasSuperTransporteRole(): boolean {
    return (
      this.user?.roles?.some((role: any) =>
        role.roleName.includes('ROLE_SUPERTRANSPORTE')
      ) ?? false
    );
  }

  ngOnInit(): void {
    // Espera a que la aplicación esté estable
    this.appRef.isStable
      .pipe(first((isStable) => isStable)) // `first(isStable => isStable)` toma el primer valor `true` emitido
      .subscribe(() => {
        // Cuando la aplicación esté estable, comienza a cargar los datos
        this.loadInitialData();
      });
  }
  
  loadInitialData(): void {
    // Realiza una llamada a la API para obtener las categorías
    this.apiService.getCategorias().subscribe(
      (response) => {
        console.log(response); // Muestra la respuesta en la consola
        this.categorias = response.detalle;
        console.log(this.categorias);
        
        this.getSolicitudes(this.categorias, this.filterStatus, this.filterCategory, this.searchQuery); // Llama a otro método para manejar los datos de solicitudes
      },
      (error) => {
        console.error('Error fetching user data', error); // Maneja el error si ocurre
      }
    );
  }

  //obtener solicitudes
  getSolicitudes(res: any, estado: any, categoria:any, search: any) {
    this.loading = true; // Comienza la carga de datos
    console.log(res);

    // traer los datos de la consulta
    this.apiSFService.getSolicitudes(estado, categoria, search).subscribe(
      
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
            {
              id: 3,
              titulo: 'Nombre de la empresa <br> que realiza solicitud',
            },
            { id: 4, titulo: 'Territorial que <br> emitió la solicitud' },
            { id: 6, titulo: 'Estado <br> solicitud' },
            { id: 7, titulo: 'Categoría de<br> solicitud' },
            { id: 8, titulo: 'Semáforo <br> alerta' },
            { id: 9, titulo: 'Número<br> radicado' },
          ];

          this.apiService.getEstados().subscribe(
            (responseEstados) => {
              this.estadoSolicitud = responseEstados.detalle;
              this.response = response.registros.map((clase: any) => {
                // Convertir las fechas a milisegundos
                const fechaHoy = new Date().valueOf(); // Fecha actual en milisegundos
                const fechaSolicitud = new Date(clase.fechaSolicitud).valueOf(); // Fecha de solicitud en milisegundos

                // Calcular la diferencia en milisegundos
                const diferenciaMilisegundos = fechaHoy - fechaSolicitud;

                // Convertir la diferencia de milisegundos a días
                const diferenciaDias = Math.floor(
                  diferenciaMilisegundos / (1000 * 60 * 60 * 24)
                );

                return {
                  id: clase.id,
                  fecha: clase.fechaSolicitud,
                  empresa: clase.nombreEmpresa,
                  territorial: clase.territorial,
                  estado: responseEstados.detalle.find(
                    (item: any) => item.id == clase.idEstadoSolicitud
                  )?.descripcion,
                  categoria:
                    res.find(
                      (item: any) => item.id == clase.idCategoriaSolicitud
                    )?.descripcion === 'Fijación'
                      ? 'Fijación de Capacidad Transportadora'
                      : res.find(
                          (item: any) => item.id == clase.idCategoriaSolicitud
                        )?.descripcion === 'Incremento'
                      ? 'Incremento de Capacidad Transportadora'
                      : 'Sin categoría',
                  semaforo: diferenciaDias, // Diferencia en días entre la fecha actual y la fecha de solicitud
                  radicado: clase.numeroRadicado,
                };
              });

              console.log(this.response);

              this.loading = false; // Termina la carga de datos
              this.cdRef.detectChanges(); // Forzar la detección de cambios
            },
            (error) => {
              this.loading = false; // Termina la carga de datos en caso de error
              this.cdRef.detectChanges(); // Forzar la detección de cambios
              console.error('Error fetching user data', error);
            }
          );
        } else {
          this.response = response.registros.map((clase: any) => ({
            id: clase.id,
            fecha: clase.fechaSolicitud,
            empresa: clase.nombreEmpresa,
            territorial: clase.territorial,
            categoria:
              res.find(
                (item: any) => item.id == clase.idCategoriaSolicitud
              )?.descripcion === 'Fijación'
                ? 'Fijación de Capacidad Transportadora'
                : res.find(
                    (item: any) => item.id == clase.idCategoriaSolicitud
                  )?.descripcion === 'Incremento'
                ? 'Incremento de Capacidad Transportadora'
                : 'Sin categoría',
          }));

          this.loading = false; // Termina la carga de datos
          this.cdRef.detectChanges(); // Forzar la detección de cambios
          console.log(this.loading);
        }
      },
      (error) => {
        this.loading = false; // Termina la carga de datos en caso de error
        this.cdRef.detectChanges(); // Forzar la detección de cambios
        console.error('Error fetching user data', error);
      }
    );
  }


  // Método para aplicar filtros
  applyFilters() {
    console.log('Aplicando filtros:', {
      category: this.filterCategory,
      status: this.filterStatus,
      searchQuery: this.searchQuery
    });

    // Si las categorías ya están cargadas, solo aplica los filtros
  if (this.categorias) {
    this.getSolicitudes(this.categorias, this.filterStatus, this.filterCategory, this.searchQuery);
  }
    // Lógica para filtrar los datos
  }

  // Método para limpiar los filtros
  clearFilters(): void {
    this.filterCategory = 0;
    this.filterStatus = 0;
    this.searchQuery = '';
    console.log('Filtros limpiados');
    
    // Llamar a getSolicitudes sin filtros, sin volver a cargar las categorías
    if (this.categorias) {
      this.getSolicitudes(this.categorias, this.filterStatus, this.filterCategory, this.searchQuery);
    }
  }

  //Metodo para redirigir el id a la vista solicitud
  onIdClicked(id: number): void {
    console.log(id);
    
    this.router.navigate(['/solicitudAprobacion'], {
      state: {
        id: id,
        
      },
    });
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

  
}
