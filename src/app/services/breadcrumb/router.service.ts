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
            name: 'validador nit',
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
      if (url.includes('dashboard')) {
        this.breadcrumbSubject.next([{ name: 'Solicitudes', route: 'NA' }]);
      } else if (url.includes('solicitudAprobacion')) {
        this.breadcrumbSubject.next([
          { name: 'Solicitudes', route: 'NA' },
          {
            name: 'Solicitud',
            route: 'solicitudAprobacion',
          },
        ]);
      } else {
        this.breadcrumbSubject.next([
          { name: 'Ruta no reconocida', route: 'NA' },
        ]);
      }
    }
  }
}
