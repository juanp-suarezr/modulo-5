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
  hasPermission: boolean = false;

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
    this.user = this.authService.getUserInfo();
    this.hasPermission = this.authService.hasPermission(
      'MUV_CARGADOCUMENTACION'
    );

    //routeo dependiendo del rol
    if (this.authService.getUserRoles()[0].sistema === 'MSF_TERRITORIAL') {
      if (url.includes('inicio')) {
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
    } else if (
      this.authService.getUserRoles()[0].sistema === 'MSF_GESTION_DOCUMENTAL'
    ) {
      if (url.includes('inicio')) {
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
      //rol MSF_SUPERTRANSPORTE
    } else if (
      this.authService.getUserRoles()[0].sistema === 'MSF_SUPERTRANSPORTE'
    ) {
      switch (true) {
        //routeo dashboard
        case url.includes('inicio'):
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
        // 1 routeo indicadores
        case url.includes('indicadores'):
          this.breadcrumbSubject.next([{ name: 'Indicadores', route: 'NA' }]);
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
