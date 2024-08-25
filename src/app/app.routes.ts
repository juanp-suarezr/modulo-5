import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

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
                path: 'fijacioncapacidadtransportadora',
                loadComponent: () => import('./views/fijacion/fijacion.component'),
                canActivate: [AuthGuard],
            },
            {
                path: 'incrementocapacidadtransportadora',
                loadComponent: () => import('./views/incremento/incremento.component'),
                canActivate: [AuthGuard],
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
                
            }
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
