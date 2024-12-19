import { CommonModule } from '@angular/common';
import { ApplicationRef, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { PaginatorComponent } from '../../components/paginator/paginator.component';
import { SkeletonModule } from 'primeng/skeleton';
import { PrimaryButtonComponent } from '../../components/primary-button/primary-button.component';
import { ApiService } from '../../services/api/api.service';
import { Router } from '@angular/router';
import { ApiSFService } from '../../services/api/apiSF.service';
import { AuthService } from '../../services/auth/auth.service';
import { ActiveNumService } from '../../services/left-nav/active-num.service';
import { ActiveNumStepperService } from '../../services/stepper/active-num.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-vigilado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    AccordionModule,
    BadgeModule,
    PaginatorComponent,
    SkeletonModule,
    PrimaryButtonComponent,
  ],
  templateUrl: './vigilado.component.html',
  styleUrl: './vigilado.component.css',
})
export default class VigiladoComponent {
  response: any;
  apiResponse: any;
  user: any;
  hasPermission: boolean = false;
  loading: boolean = true; // Estado de carga

  //paginator datas

  currentPage: number = 1;
  pageSize: number = 4;
  totalPages: number = 1;

  //arrays
  categorias: any;
  estadosSolicitud: any;
  // Variables de filtro
  filterCategory: string = '';
  filterStatus: string = '';
  searchQuery: string = '';
  fechaSolicitud: string = '';
  usuarioRol: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private apiSFService: ApiSFService,
    private authService: AuthService,
    private appRef: ApplicationRef, // Servicio para manejar el estado de la aplicación
    private cdRef: ChangeDetectorRef, // Inyecta el ChangeDetectorRef
    private stateService: ActiveNumService,
    private stepperService: ActiveNumStepperService
  ) {
    this.user = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    // Espera a que la aplicación esté estable
    this.appRef.isStable
      .pipe(first((isStable) => isStable)) // `first(isStable => isStable)` toma el primer valor `true` emitido
      .subscribe(() => {
        this.stateService.setActiveNum('0');
        this.stepperService.setActiveNum(1);

        console.log(this.user);
        console.log(this.authService.getUserRoles()[0].sistema);

        // Cuando la aplicación esté estable, comienza a cargar los datos
        //llamado api
        this.searchQuery = this.authService.getUserInfo().nit;
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
      this.fechaSolicitud,
      this.pageSize,
      this.currentPage,
      this.usuarioRol
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

    // Realiza una llamada a la API para obtener los estados de solicitudas categorías
    this.apiService.getEstados().subscribe(
      (response) => {
        let descriptionsToInclude = [
          'Asignar',
          'En estudio',
          'Aprobado',
          'Rechazado',
          'Pendiente',
          'Subsanar',
        ];
        console.log(response); // Muestra la respuesta en la consola
        if (this.usuarioRol == 'superTransp') {
          descriptionsToInclude = [
            'Asignar',
            'En estudio',
            'Aprobado',
            'Rechazado',
            'Subsanar',
          ];
        } else if (this.usuarioRol == 'gesDoc') {
          descriptionsToInclude = ['Asignar', 'En estudio'];
        }
        this.estadosSolicitud = response.detalle.filter(
          (item: { descripcion: string }) =>
            descriptionsToInclude.includes(item.descripcion)
        );

        console.log(this.estadosSolicitud);
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
      this.fechaSolicitud,
      this.pageSize,
      this.currentPage,
      this.usuarioRol
    ); // Llama a otro método para manejar los datos de solicitudes
  }

  //obtener solicitudes
  getSolicitudes(
    res: any,
    estado: any,
    categoria: any,
    search: any,
    fechaSolicitud: any,
    pageSize: number,
    currentPage: number,
    usuario: string
  ) {
    this.loading = true; // Comienza la carga de datos

    // traer los datos de la consulta
    this.apiSFService
      .getSolicitudes(
        estado,
        categoria,
        search,
        fechaSolicitud,
        pageSize,
        currentPage,
        usuario
      )
      .subscribe(
        (response) => {
          console.log(response);

          this.totalPages = response.totalPages;
          // Validar roles y generar headers después de cargar los datos

          console.log(response);
          this.response = response.content.map((clase: any) => ({
            id: clase.id,
            fecha: clase.fechaSolicitud,
            nombre: clase.nombreEmpresa,
            territorial: clase.territorial,
            categoria:
              clase.categoriaSolicitudDescripcion === 'Fijación'
                ? 'Fijación de Capacidad Transportadora'
                : clase.categoriaSolicitudDescripcion === 'Incremento'
                ? 'Incremento de Capacidad Transportadora'
                : 'Sin categoría',
            estadoSolicitud: clase.estadoSolicitudDescripcion,
            observaciones: clase.observaciones,
            estadoSolicitudDescripcion: clase.estadoSolicitudDescripcion,
          }));

          this.loading = false; // Termina la carga de datos
          this.cdRef.detectChanges(); // Forzar la detección de cambios
          console.log(this.loading);
        },
        (error) => {
          this.loading = false; // Termina la carga de datos en caso de error
          this.cdRef.detectChanges(); // Forzar la detección de cambios
          console.error('Error fetching user data', error);
        }
      );
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      console.log(event.key);

      this.applyFilters();
    }
  }

  // Método para aplicar filtros
  applyFilters() {
    console.log('Aplicando filtros:', {
      category: this.filterCategory,
      status: this.filterStatus,
      searchQuery: this.searchQuery,
      fechaSolicitud: this.fechaSolicitud,
    });

    this.currentPage = 1;

    // Si las categorías ya están cargadas, solo aplica los filtros
    if (this.categorias) {
      this.getSolicitudes(
        this.categorias,
        this.filterStatus,
        this.filterCategory,
        this.searchQuery,
        this.fechaSolicitud,
        this.pageSize,
        this.currentPage,
        this.usuarioRol
      );
    }
    // Lógica para filtrar los datos
  }

  // Método para limpiar los filtros
  clearFilters(): void {
    this.filterCategory = '';
    this.filterStatus = '';
    (this.fechaSolicitud = ''), (this.currentPage = 1);
    console.log('Filtros limpiados');

    // Llamar a getSolicitudes sin filtros, sin volver a cargar las categorías
    if (this.categorias) {
      this.getSolicitudes(
        this.categorias,
        this.filterStatus,
        this.filterCategory,
        this.searchQuery,
        this.fechaSolicitud,
        this.pageSize,
        this.currentPage,
        this.usuarioRol
      );
    }
  }
}
