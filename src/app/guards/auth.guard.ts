import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private jwtHelper: JwtHelperService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = route.queryParamMap.get('token') || this.authService.getTestToken();

    // Si el token es null, asignar un valor vacío (o cualquier otro valor por defecto que prefieras)
    if (!token) {
      this.router.navigate(['/errorautenticacion']);
      return false;
    }
    
    this.authService.setToken(token);

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const requiredPermission = route.data['permission'];
      if (requiredPermission && this.authService.hasPermission(requiredPermission)) {
        return true;
      }
    }

    this.router.navigate(['/errorautenticacion']);
    return false;
  }
}