import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();

    // Si el usuario está intentando acceder al login, pero ya está autenticado, redirige al dashboard
    if (isAuthenticated && state.url === '/login') {
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Si el usuario está intentando acceder a una ruta protegida, verifica la autenticación
    if (!isAuthenticated && state.url !== '/login') {
      this.router.navigate(['/login']);
      return false;
    }

    // Permitir el acceso
    return true;
  }
}
