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
import { PrimaryButtonComponent } from '../../components/primary-button/primary-button.component';
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
    PrimaryButtonComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export default class DashboardComponent {
  response: any;
  apiResponse: any;
  user: any;
  loading: boolean = true; // Estado de carga

  //paginator datas
  
  currentPage: number = 1;
  pageSize: number = 4;
  totalPages: number = 1;

  //arrays
  categorias: any;
  estadoSolicitud: any;
  // Variables de filtro
  filterCategory: string = '';
  filterStatus: string = '';
  searchQuery: string = '';

  headers = [
    { id: 1, titulo: 'ID' },
    { id: 2, titulo: 'Fecha solicitud <br> (dd/mm/aaaa)' },
    { id: 3, titulo: 'NIT empresa' },
    { id: 4, titulo: 'Nombre de la empresa <br> que realiza solicitud' },
    { id: 5, titulo: 'Territorial que <br> emitió la solicitud' },
    { id: 6, titulo: 'Categoría de <br> solicitud' },
    { id: 7, titulo: 'Acciones' },
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

  onPageChange(page: number) {
    this.currentPage = page;
    //llamado a el servicio que le trae el listado de registros
    this.getSolicitudes(
      this.categorias,
      this.filterStatus,
      this.filterCategory,
      this.searchQuery,
      this.pageSize,
      this.currentPage,
    );
  }

  loadInitialData(): void {
    // Realiza una llamada a la API para obtener las categorías
    this.apiService.getCategorias().subscribe(
      (response) => {
        console.log(response); // Muestra la respuesta en la consola
        this.categorias = response.detalle;
        console.log(this.categorias);
      },
      (error) => {
        console.error('Error fetching user data', error); // Maneja el error si ocurre
      }
    );

    this.getSolicitudes(
      this.categorias,
      this.filterStatus,
      this.filterCategory,
      this.searchQuery,
      this.pageSize,
      this.currentPage,
    ); // Llama a otro método para manejar los datos de solicitudes
  }

  //obtener solicitudes
  getSolicitudes(
    res: any,
    estado: any,
    categoria: any,
    search: any,
    pageSize: number,
    currentPage: number
  ) {
    this.loading = true; // Comienza la carga de datos
    console.log(res);

    // traer los datos de la consulta
    this.apiSFService
      .getSolicitudes(estado, categoria, search, pageSize, currentPage)
      .subscribe(
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
              { id: 3, titulo: 'NIT empresa' },
              {
                id: 4,
                titulo: 'Nombre de la empresa <br> que realiza solicitud',
              },
              { id: 5, titulo: 'Territorial que <br> emitió la solicitud' },
              { id: 6, titulo: 'Estado <br> solicitud' },
              { id: 7, titulo: 'Categoría de<br> solicitud' },
              { id: 8, titulo: 'Semáforo <br> alerta' },
              { id: 9, titulo: 'Número<br> radicado' },
            ];

            this.totalPages = response.totalPages-1;
            this.response = response.content.map((clase: any) => {
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
                nit: clase.nit,
                empresa: clase.nombreEmpresa,
                territorial: clase.territorial,
                estado: clase.estadoSolicitudDescripcion,
                categoria:
                  clase.categoriaSolicitudDescripcion === 'Fijación'
                    ? 'Fijación de Capacidad Transportadora'
                    : clase.categoriaSolicitudDescripcion === 'Incremento'
                    ? 'Incremento de Capacidad Transportadora'
                    : 'Sin categoría',
                semaforo: diferenciaDias, // Diferencia en días entre la fecha actual y la fecha de solicitud
                radicado: clase.numeroRadicado,
              };
            });

            console.log(this.response);

            this.loading = false; // Termina la carga de datos
            this.cdRef.detectChanges(); // Forzar la detección de cambios
          } else {
            this.totalPages = response.totalPages-1;
            console.log(this.totalPages);
            
            console.log(response);
            this.response = response.content.map((clase: any) => ({
              id: clase.id,
              fecha: clase.fechaSolicitud,
              nit: clase.nit,
              empresa: clase.nombreEmpresa,
              territorial: clase.territorial,
              categoria:
                clase.categoriaSolicitudDescripcion === 'Fijación'
                  ? 'Fijación de Capacidad Transportadora'
                  : clase.categoriaSolicitudDescripcion === 'Incremento'
                  ? 'Incremento de Capacidad Transportadora'
                  : 'Sin categoría',
                  estadoSolicitudDescripcion: clase.estadoSolicitudDescripcion,
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
      searchQuery: this.searchQuery,
    });

    // Si las categorías ya están cargadas, solo aplica los filtros
    if (this.categorias) {
      this.getSolicitudes(
        this.categorias,
        this.filterStatus,
        this.filterCategory,
        this.searchQuery,
        this.pageSize,
        this.currentPage,
        
      );
    }
    // Lógica para filtrar los datos
  }

  // Método para limpiar los filtros
  clearFilters(): void {
    this.filterCategory = '';
    this.filterStatus = '';
    this.searchQuery = '';
    this.currentPage = 1;
    console.log('Filtros limpiados');

    // Llamar a getSolicitudes sin filtros, sin volver a cargar las categorías
    if (this.categorias) {
      this.getSolicitudes(
        this.categorias,
        this.filterStatus,
        this.filterCategory,
        this.searchQuery,
        this.pageSize,
        this.currentPage,
      );
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

  solicitudGuardada(id: number, categoria: string): void {
    console.log(id);
    let router =
      categoria == 'Incremento'
        ? '/incrementocapacidadtransportadora'
        : 'fijacioncapacidadtransportadora';
    this.router.navigate([router], {
      state: {
        id: id,
      },
    });
  }

  
}
