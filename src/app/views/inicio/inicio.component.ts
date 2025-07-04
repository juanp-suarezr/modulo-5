import {AuthService} from '../../services/auth/auth.service';
import {
  Component, OnInit, ApplicationRef, ChangeDetectorRef,
} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {CommonModule} from '@angular/common';
import {AccordionModule} from 'primeng/accordion';
import {BadgeModule} from 'primeng/badge';
import {PaginatorComponent} from '../../components/paginator/paginator.component';
import {TableComponent} from '../../components/table/table.component';
import {ApiService} from '../../services/api/api.service';
import {ApiSFService} from '../../services/api/apiSF.service';
import {SkeletonModule} from 'primeng/skeleton';
import {Router} from '@angular/router';
import {first} from 'rxjs';
import {PrimaryButtonComponent} from '../../components/primary-button/primary-button.component';
import {FormsModule} from '@angular/forms';
import {ActiveNumService} from '../../services/left-nav/active-num.service';
import {ActiveNumStepperService} from '../../services/stepper/active-num.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RippleModule, AccordionModule, BadgeModule, PaginatorComponent, TableComponent, SkeletonModule, PrimaryButtonComponent,],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
})
export default class InicioComponent {
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

  headers = [{id: 1, titulo: 'ID'}, {id: 2, titulo: 'Fecha solicitud <br> (dd/mm/aaaa)'}, {
    id: 3,
    titulo: 'NIT empresa'
  }, {id: 4, titulo: 'Nombre de la empresa <br> que realiza solicitud'}, {
    id: 5,
    titulo: 'Territorial que <br> emitió la solicitud'
  }, {id: 6, titulo: 'Categoría de <br> solicitud'}, {id: 7, titulo: 'Estado <br> solicitud'}, {
    id: 8,
    titulo: 'observaciones <br> subsanación'
  }, {id: 9, titulo: 'Acciones'},];

  constructor(private apiService: ApiService, private router: Router, private apiSFService: ApiSFService, private authService: AuthService, private appRef: ApplicationRef, // Servicio para manejar el estado de la aplicación
    private cdRef: ChangeDetectorRef, // Inyecta el ChangeDetectorRef
    private stateService: ActiveNumService, private stepperService: ActiveNumStepperService) {
    this.user = this.authService.getUserInfo();
    this.hasPermission = this.authService.hasPermission('MSF_TERRITORIAL');
  }

  // Getter para verificar el rol
  get hasSuperTransporteRole(): boolean {
    return this.authService.hasRole('MSF_SUPERTRANSPORTE');
  }

  ngOnInit(): void {
    // Espera a que la aplicación esté estable
    this.appRef.isStable.pipe(first((isStable) => isStable)) // `first(isStable => isStable)` toma el primer valor `true` emitido
      .subscribe(() => {
        localStorage.setItem('idSolicitud', '');
        this.stateService.setActiveNum('0');
        this.stepperService.setActiveNum(1);

        console.log(this.hasPermission);
        console.log(this.user);
        console.log(this.authService.getUserRoles()[0].sistema);

        // Cuando la aplicación esté estable, comienza a cargar los datos

        if(this.authService.getUserRoles()[0].sistema === 'MSF_SUPERTRANSPORTE' || this.authService.getUserRoles()[0].sistema === 'MSF_GESTION_DOCUMENTAL') {
          if(this.authService.getUserRoles()[0].sistema === 'MSF_SUPERTRANSPORTE') {
            this.usuarioRol = 'superTransp';
          } else {
            this.usuarioRol = 'gesDoc';
          }

          this.headers = [{id: 1, titulo: 'ID'}, {id: 2, titulo: 'Fecha solicitud <br> (dd/mm/aaaa)'}, {
            id: 3,
            titulo: 'NIT empresa'
          }, {
            id: 4, titulo: 'Nombre de la empresa <br> que realiza solicitud',
          }, {id: 5, titulo: 'Territorial que <br> emitió la solicitud'}, {
            id: 6,
            titulo: 'Estado <br> solicitud'
          }, {id: 7, titulo: 'Categoría de<br> solicitud'}, {id: 8, titulo: 'Semáforo <br> alerta'}, {
            id: 9,
            titulo: 'Número<br> radicado'
          },];
          //llamado api
          this.loadInitialData();
        } else {
          //llamado api
          this.loadInitialData();
        }
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    //llamado a el servicio que le trae el listado de registros
    this.getSolicitudes(this.categorias, this.filterStatus, this.filterCategory, this.searchQuery, this.fechaSolicitud, this.pageSize, this.currentPage, this.usuarioRol);
  }

  loadInitialData(): void {
    // Realiza una llamada a la API para obtener las categorías
    this.apiService.getCategorias().subscribe((response) => {
      console.log(response); // Muestra la respuesta en la consola
      this.categorias = response.detalle;
      console.log(this.categorias);
    }, (error) => {
      console.error('Error fetching user data', error); // Maneja el error si ocurre
    });

    // Realiza una llamada a la API para obtener los estados de solicitudas categorías
    this.apiService.getEstados().subscribe((response) => {
      let descriptionsToInclude = ['Asignar', 'En estudio', 'Aprobado', 'Rechazado', 'Pendiente', 'Subsanar',];
      console.log(response); // Muestra la respuesta en la consola
      if(this.usuarioRol == 'superTransp') {
        descriptionsToInclude = ['Asignar', 'En estudio', 'Aprobado', 'Rechazado', 'Subsanar',];
      } else if(this.usuarioRol == 'gesDoc') {
        descriptionsToInclude = ['Asignar', 'En estudio'];
      }
      this.estadosSolicitud = response.detalle.filter((item: {
        descripcion: string
      }) => descriptionsToInclude.includes(item.descripcion));

      console.log(this.estadosSolicitud);
    }, (error) => {
      console.error('Error fetching user data', error); // Maneja el error si ocurre
    });

    this.getSolicitudes(this.categorias, this.filterStatus, this.filterCategory, this.searchQuery, this.fechaSolicitud, this.pageSize, this.currentPage, this.usuarioRol); // Llama a otro método para manejar los datos de solicitudes
  }

  //obtener solicitudes
  getSolicitudes(res: any, estado: any, categoria: any, search: any, fechaSolicitud: any, pageSize: number, currentPage: number, usuario: string) {
    this.loading = true; // Comienza la carga de datos

    // traer los datos de la consulta
    this.apiSFService.getSolicitudes(estado, categoria, search, fechaSolicitud, pageSize, currentPage, usuario).subscribe((response) => {
      console.log(response);

      this.totalPages = response.page.totalPages;
      // Validar roles y generar headers después de cargar los datos
      if(this.authService.getUserRoles()[0].sistema === 'MSF_GESTION_DOCUMENTAL') {
        this.getHeaders();
        //rol de GESTION DOCUMENTAL
        this.response = response.content.map((clase: any) => {
          // Convertir las fechas a milisegundos
          const fechaHoy = new Date().valueOf(); // Fecha actual en milisegundos
          const fechaSolicitud = new Date(clase.fechaSolicitud).valueOf(); // Fecha de solicitud en milisegundos

          // Calcular la diferencia en milisegundos
          const diferenciaMilisegundos = fechaHoy - fechaSolicitud;

          // Convertir la diferencia de milisegundos a días
          const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

          return {
            id: clase.id + ',' + (clase.estadoSolicitudDescripcion === 'Asignar'),
            fecha: clase.fechaSolicitud,
            nit: clase.nit,
            empresa: clase.nombreEmpresa,
            territorial: clase.territorial,
            estado: clase.estadoSolicitudDescripcion + clase.subsanar ? '(Subsanación)' : '',
            categoria: clase.categoriaSolicitudDescripcion === 'Fijación' ? 'Fijación de Capacidad Transportadora' : clase.categoriaSolicitudDescripcion === 'Incremento' ? 'Incremento de Capacidad Transportadora' : 'Sin categoría',
            semaforo: diferenciaDias, // Diferencia en días entre la fecha actual y la fecha de solicitud
            radicado: clase.numeroRadicado,
            radicadoSalida: clase.numeroRadicadoSalida,
          };
        });

        console.log(this.response);

        this.loading = false; // Termina la carga de datos
        this.cdRef.detectChanges(); // Forzar la detección de cambios
      } else if(this.authService.getUserRoles()[0].sistema === 'MSF_SUPERTRANSPORTE') {
        this.getHeaders();
        //rol de SUPERTRANSPORTE
        this.response = response.content.map((clase: any) => {
          // Convertir las fechas a milisegundos
          const fechaHoy = new Date().valueOf(); // Fecha actual en milisegundos
          const fechaSolicitud = new Date(clase.fechaSolicitud).valueOf(); // Fecha de solicitud en milisegundos

          // Calcular la diferencia en milisegundos
          const diferenciaMilisegundos = fechaHoy - fechaSolicitud;

          // Convertir la diferencia de milisegundos a días
          const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

          return {
            id: clase.id + ',' + (clase.estadoSolicitudDescripcion == 'En estudio' || clase.estadoSolicitudDescripcion == 'Aprobada' || clase.estadoSolicitudDescripcion == 'Aprobado' || clase.estadoSolicitudDescripcion == 'Subsanar'),
            fecha: clase.fechaSolicitud,
            nit: clase.nit,
            empresa: clase.nombreEmpresa,
            territorial: clase.territorial,
            estado: clase.estadoSolicitudDescripcion + (clase.subsanar ? ' (Subsanación)' : ''),
            categoria: clase.categoriaSolicitudDescripcion === 'Fijación' ? 'Fijación de Capacidad Transportadora' : clase.categoriaSolicitudDescripcion === 'Incremento' ? 'Incremento de Capacidad Transportadora' : 'Sin categoría',
            semaforo: diferenciaDias, // Diferencia en días entre la fecha actual y la fecha de solicitud
            radicado: clase.numeroRadicado,
            radicadoSalida: clase.numeroRadicadoSalida,
            subsanar: clase.subsanar
          };
        });

        console.log(this.response);

        this.loading = false; // Termina la carga de datos
        this.cdRef.detectChanges(); // Forzar la detección de cambios
      } else {
        console.log(response);
        this.response = response.content.map((clase: any) => ({
          id: clase.id + ',' + false,
          fecha: clase.fechaSolicitud,
          nit: clase.nit,
          empresa: clase.nombreEmpresa,
          territorial: clase.territorial,
          categoria: clase.categoriaSolicitudDescripcion === 'Fijación' ? 'Fijación de Capacidad Transportadora' : clase.categoriaSolicitudDescripcion === 'Incremento' ? 'Incremento de Capacidad Transportadora' : 'Sin categoría',
          estadoSolicitud: clase.subsanar ? 'Subsanación' : clase.estadoSolicitudDescripcion,
          observaciones: clase.observaciones,
          estadoSolicitudDescripcion: clase.subsanar && clase.estadosSolicitud == 283 ? 'Subsanación' : clase.estadoSolicitudDescripcion,

        }));

        this.loading = false; // Termina la carga de datos
        this.cdRef.detectChanges(); // Forzar la detección de cambios
        console.log(this.loading);
      }
    }, (error) => {
      this.loading = false; // Termina la carga de datos en caso de error
      this.response = []; // Vacía la respuesta
      this.cdRef.detectChanges(); // Forzar la detección de cambios
      console.error('Error fetching user data', error);
    });
  }

  getHeaders() {
    return (this.headers = [{id: 1, titulo: 'ID'}, {id: 2, titulo: 'Fecha solicitud <br> (dd/mm/aaaa)'}, {
      id: 3,
      titulo: 'NIT empresa'
    }, {
      id: 4, titulo: 'Nombre de la empresa <br> que realiza solicitud',
    }, {id: 5, titulo: 'Territorial que <br> emitió la solicitud'}, {id: 6, titulo: 'Estado <br> solicitud'}, {
      id: 7,
      titulo: 'Categoría de<br> solicitud'
    }, {id: 8, titulo: 'Semáforo <br> alerta'}, {id: 9, titulo: 'Número<br> radicado'}, { id: 10, titulo: 'Número<br> radicado salida' },]);
  }

  onKeyDown(event: KeyboardEvent) {
    if(event.key === 'Enter') {
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
    if(this.categorias) {
      this.getSolicitudes(this.categorias, this.filterStatus, this.filterCategory, this.searchQuery, this.fechaSolicitud, this.pageSize, this.currentPage, this.usuarioRol);
    }
    // Lógica para filtrar los datos
  }

  // Método para limpiar los filtros
  clearFilters(): void {
    this.filterCategory = '';
    this.filterStatus = '';
    this.searchQuery = '';
    (this.fechaSolicitud = ''), (this.currentPage = 1);
    console.log('Filtros limpiados');

    // Llamar a getSolicitudes sin filtros, sin volver a cargar las categorías
    if(this.categorias) {
      this.getSolicitudes(this.categorias, this.filterStatus, this.filterCategory, this.searchQuery, this.fechaSolicitud, this.pageSize, this.currentPage, this.usuarioRol);
    }
  }

  //Metodo para redirigir el id a la vista solicitud
  onIdClicked(id: number): void {
    console.log(id);

    let router;
    if(this.authService.getUserRoles()[0].sistema === 'MSF_SUPERTRANSPORTE') {

      const response = this.response.find((item: any) => parseInt(item.id.split(',')[0]) == id);


      if(response.subsanar && response.estadoSolicitud == 281) {

        router = 'solicitudAprobacion-subsanacion';
      } else {
        router = 'solicitudAprobacion';
      }


    } else if(this.authService.getUserRoles()[0].sistema === 'MSF_GESTION_DOCUMENTAL') {
      router = 'solicitudRadicacion';
    }

    this.router.navigate([router], {
      state: {
        id: id,
      },
    });
  }

  solicitudGuardadaClick(solicitud: any): void {
    console.log(solicitud.id);
    console.log(solicitud.categoria);
    let router = solicitud.categoria == 'Incremento de Capacidad Transportadora' ? '/incrementocapacidadtransportadora' : 'fijacioncapacidadtransportadora';
    this.router.navigate([router], {
      state: {
        idSolicitud: solicitud.id,
      },
    });
  }

  solicitudSubsanacionClick(solicitud: any): void {
    console.log(solicitud.id);
    console.log(solicitud.categoria);
    let router = solicitud.categoria == 'Incremento de Capacidad Transportadora' ? '/incrementocapacidadtransportadora-subsanacion' : 'fijacioncapacidadtransportadora-subsanacion';
    this.router.navigate([router], {
      state: {
        idSolicitud: solicitud.id,
      },
    });
  }
}
