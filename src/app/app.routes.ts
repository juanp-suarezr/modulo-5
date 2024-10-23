import {Routes} from '@angular/router';
import {AuthGuard} from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/layout/layout.component'),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./views/dashboard/dashboard.component'),
        canActivate: [AuthGuard],
      },
      {
        path: 'validador_nit',
        loadComponent: () => import('./views/Rol_TerritorialMinTrans/validacion-nit/validacion-nit.component'),
        canActivate: [AuthGuard],
      },
      {
        path: 'fijacioncapacidadtransportadora',
        loadComponent: () => import('./views/Rol_TerritorialMinTrans/fijacion/fijacion.component'),
        canActivate: [AuthGuard],
      },
      {
        path: 'incrementocapacidadtransportadora',
        loadComponent: () => import('./views/Rol_TerritorialMinTrans/incremento/incremento.component'),
        canActivate: [AuthGuard],
      },
      {
        path: 'solicitudRadicacion',
        loadComponent: () => import('./views/Rol_GestionDocumental/solicitud/solicitud.component'),
        canActivate: [AuthGuard],
      },
      {
        path: 'solicitudAprobacion',
        loadComponent: () => import('./views/Rol_Supertransporte/solicitud/solicitud.component'),
        canActivate: [AuthGuard],
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'

      },
      //INDICADORES

      {
        path: 'indicadores',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/power-bi/power-bi.component'),
        canActivate: [AuthGuard],
      },


    ]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component'),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./views/login/login.component'),
        canActivate: [AuthGuard],
      },
      {
        path: 'verificacion',
        loadComponent: () => import('./views/verificacion/verificacion.component'),
        canActivate: [AuthGuard],
      },

      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'

  }
];
