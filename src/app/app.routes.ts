import {Routes} from '@angular/router';
import { AuthGuard } from './guards/auth.guard';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/layout/layout.component'),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./views/dashboard/dashboard.component'),
        canActivate: [AuthGuard],
        data: { permission: ['MSF_SF_LISTAR_SOLICITUD_TR', 'MSF_SF_LISTAR_SOLICITUD_GD', 'MSF_SF_LISTAR_SOLICITUD_ST'] }
      },
      {
        path: 'validador_nit',
        loadComponent: () => import('./views/Rol_TerritorialMinTrans/validacion-nit/validacion-nit.component'),
        canActivate: [AuthGuard],
        data: { permission: 'MSF_CREAR_SOLICITUD' }
      },
      {
        path: 'fijacioncapacidadtransportadora',
        loadComponent: () => import('./views/Rol_TerritorialMinTrans/fijacion/fijacion.component'),
        canActivate: [AuthGuard],
        data: { permission: 'MSF_CREAR_SOLICITUD' }
      },
      {
        path: 'incrementocapacidadtransportadora',
        loadComponent: () => import('./views/Rol_TerritorialMinTrans/incremento/incremento.component'),
        canActivate: [AuthGuard],
        data: { permission: 'MSF_CREAR_SOLICITUD' }
      },
      {
        path: 'solicitudRadicacion',
        loadComponent: () => import('./views/Rol_GestionDocumental/solicitud/solicitud.component'),
        canActivate: [AuthGuard],
        data: { permission: 'MSF_SF_GENERAR_RADICADO_E' }
      },
      {
        path: 'solicitudAprobacion',
        loadComponent: () => import('./views/Rol_Supertransporte/solicitud/solicitud.component'),
        canActivate: [AuthGuard],
        data: { permission: 'MSF_SF_GENERAR_RADICADO_SALIDA' }
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
        data: { permission: 'MSF_LISTAR_INDICADORES' }
      },


    ]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component'),
    children: [
      {
        path: 'errorautenticacion',
        loadComponent: () => import('./views/verificacion/verificacion.component'),
      },
      
      {
        path: '',
        redirectTo: 'errorAutentication',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'

  }
];
