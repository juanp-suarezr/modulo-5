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

  constructor(private router: Router) {
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


    if (url.includes('dashboard')) {
      this.breadcrumbSubject.next([{ name: 'Tramitar solicitud', route: 'NA' }]);
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
        {name: 'Tramitar solicitud', route: 'NA'},
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
  }
}
