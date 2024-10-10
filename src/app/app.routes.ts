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
      //1 Comparativo contractual de vehículos y placas
      {
        path: 'comparativoVehiculo-placas',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/comparativo-veh-placas/comparativo-veh-placas.component'),
        canActivate: [AuthGuard],
      },
      //2 Solicitudes enviadas por territoriales
      {
        path: 'solicitudxterritorial',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/solicitudes-enviadas-territorial/solicitudes-enviadas-territorial.component'),
        canActivate: [AuthGuard],
      },
      //3 Vehículos requeridos por territorial
      {
        path: 'vehiculosxterritorial',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/comparativo-veh-placas/comparativo-veh-placas.component'),
        canActivate: [AuthGuard],
      },
      //4 Capacidad de un departamento para cierta cantidad de vehículos
      {
        path: 'capacidadDepartamentoxvehiculos',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/comparativo-veh-placas/comparativo-veh-placas.component'),
        canActivate: [AuthGuard],
      },
      //5 Solicitudes realizadas año a año
      {
        path: 'solicitudesxaño',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/comparativo-veh-placas/comparativo-veh-placas.component'),
        canActivate: [AuthGuard],
      },
      //6 Solicitudes realizadas mes a mes
      {
        path: 'solicitudesxmes',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/comparativo-veh-placas/comparativo-veh-placas.component'),
        canActivate: [AuthGuard],
      },
      //7 Cantidad de Empresas que solicitan Fijación de Capacidad Transportadora
      {
        path: 'empresasxfijacion',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/comparativo-veh-placas/comparativo-veh-placas.component'),
        canActivate: [AuthGuard],
      },
      //8 Cantidad de Empresas que solicitan Incremento de Capacidad Transportadora. 
      {
        path: 'empresasxincremento',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/solicitudes-enviadas-territorial/solicitudes-enviadas-territorial.component'),
        canActivate: [AuthGuard],
      },
      //9 Cantidad de Empresas con liquidez. 
      {
        path: 'empresasxliquidez',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/comparativo-veh-placas/comparativo-veh-placas.component'),
        canActivate: [AuthGuard],
      },
      //10 Cumplimiento del 10% flota propia o 7% mediante la figura de leasing financiero.
      {
        path: 'cumplimiento-leasignfinanciero',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/comparativo-veh-placas/comparativo-veh-placas.component'),
        canActivate: [AuthGuard],
      },
      //11 Cumplimiento de Capital Social / Patrimonio líquido para la totalidad de vehículos requeridos. 
      {
        path: 'cumplimiento-capitalxpatrimonio',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/comparativo-veh-placas/comparativo-veh-placas.component'),
        canActivate: [AuthGuard],
      },
      //12 Medición estados financieros
      {
        path: 'medicion-estadosfinancieros',
        loadComponent: () => import('./views/Rol_Supertransporte/indicadores/comparativo-veh-placas/comparativo-veh-placas.component'),
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
