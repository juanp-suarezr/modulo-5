import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layouts/layout/layout.component'),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./views/dashboard/dashboard.component')
                
            },
            {
                path: 'fijacioncapacidadtransportadora',
                loadComponent: () => import('./views/fijacion/fijacion.component')
                
            },
            {
                path: 'incrementocapacidadtransportadora',
                loadComponent: () => import('./views/incremento/incremento.component')
                
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
            },
            {
                path: 'verificacion',
                loadComponent: () => import('./views/verificacion/verificacion.component'),
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
