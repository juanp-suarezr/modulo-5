import { AuthService } from './../auth/auth.service';
import { Injectable } from '@angular/core';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class RouterService {
  private breadcrumbSubject = new BehaviorSubject<
    { name: string; route: string }[]
  >([]);
  breadcrumb$ = this.breadcrumbSubject.asObservable();

  user: any;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ) // Asegúrate de que el filtro devuelva NavigationEnd
      )
      .subscribe(() => {
        this.updateBreadcrumb();
      });
  }

  private updateBreadcrumb(): void {
    const url = this.router.url;
    this.user = this.authService.currentUser;

    //routeo dependiendo del rol
    if (this.user.roles[0].roleName == 'ROLE_ESCRITURA_MIN') {
      if (url.includes('dashboard')) {
        this.breadcrumbSubject.next([
          { name: 'Tramitar solicitud', route: 'NA' },
        ]);
      } else if (url.includes('validador_nit')) {
        this.breadcrumbSubject.next([
          { name: 'Tramitar solicitud', route: 'NA' },
          {
            name: 'validador NIT',
            route: 'validador_nit',
          },
        ]);
      } else if (url.includes('fijacioncapacidadtransportadora')) {
        this.breadcrumbSubject.next([
          { name: 'Tramitar solicitud', route: 'NA' },
          {
            name: 'Fijación de Capacidad Transportadora',
            route: 'fijacioncapacidadtransportadora',
          },
        ]);
      } else if (url.includes('incrementocapacidadtransportadora')) {
        this.breadcrumbSubject.next([
          { name: 'Tramitar solicitud', route: 'NA' },
          {
            name: 'Incremento de Capacidad Transportadora',
            route: 'incrementocapacidadtransportadora',
          },
        ]);
      } else {
        this.breadcrumbSubject.next([
          { name: 'Ruta no reconocida', route: 'NA' },
        ]);
      }
      //rol gestion documental
    } else if (this.user.roles[0].roleName == 'ROLE_ESCRITURA_GESDOC') {
      if (url.includes('dashboard')) {
        this.breadcrumbSubject.next([
          { name: 'Visualizar solicitudes', route: 'NA' },
        ]);
      } else if (url.includes('solicitudRadicacion')) {
        this.breadcrumbSubject.next([
          { name: 'Visualizar solicitudes', route: 'NA' },
          {
            name: 'Asignar radicado',
            route: 'solicitudRadicacion',
          },
        ]);
      } else {
        this.breadcrumbSubject.next([
          { name: 'Ruta no reconocida', route: 'NA' },
        ]);
      }
      //rol ROLE_SUPERTRANSPORTE
    } else if (this.user.roles[0].roleName == 'ROLE_SUPERTRANSPORTE') {
      switch (true) {
        //routeo dashboard
        case url.includes('dashboard'):
          this.breadcrumbSubject.next([{ name: 'Solicitudes', route: 'NA' }]);
          break;

        //routeo solicitud especifica
        case url.includes('solicitudAprobacion'):
          this.breadcrumbSubject.next([
            { name: 'Solicitudes', route: 'NA' },
            { name: 'Solicitud', route: 'solicitudAprobacion' },
          ]);
          break;
        //INDICADORES
        // 1 routeo comparativoVehiculo-placas
        case url.includes('comparativoVehiculo-placas'):
          this.breadcrumbSubject.next([
            { name: 'Indicadores', route: 'NA' },
            {
              name: 'Comparativo contractual de vehículos y placas',
              route: 'comparativoVehiculo-placas',
            },
          ]);
          break;

        //2 Solicitudes enviadas por territoriales
        case url.includes('solicitudxterritorial'):
          this.breadcrumbSubject.next([
            { name: 'Indicadores', route: 'NA' },
            {
              name: 'Solicitudes enviadas por territoriales',
              route: 'solicitudxterritorial',
            },
          ]);
          break;

        //3 Vehículos requeridos por territorial
        case url.includes('vehiculosxterritorial'):
          this.breadcrumbSubject.next([
            { name: 'Indicadores', route: 'NA' },
            {
              name: 'Vehículos requeridos por territorial',
              route: 'vehiculosxterritorial',
            },
          ]);
          break;

          //4 Solicitudes realizadas año a año
        case url.includes('solicitudesxaño'):
        this.breadcrumbSubject.next([
          { name: 'Indicadores', route: 'NA' },
          { name: 'Solicitudes realizadas año a año', route: 'solicitudesxaño' },
        ]);
        break;

        //5 routeo Solicitudes realizadas mes a mes
        case url.includes('solicitudesxmes'):
          this.breadcrumbSubject.next([
            { name: 'Indicadores', route: 'NA' },
            { name: 'Solicitudes realizadas mes a mes', route: 'solicitudesxmes' },
          ]);
          break;

        default:
          this.breadcrumbSubject.next([
            { name: 'Ruta no reconocida', route: 'NA' },
          ]);
          break;
      }
    }
  }
}
