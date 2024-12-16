import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from '../../../environments/environment';
import { Authority, Permiso } from '../../models/auth.types';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken'; // Clave para guardar el token en sessionStorage
  private token: string | null = null;
  private decodedToken: { user?: string; authorities?: string } | null = null;
  private apiUrl = environment.LOGOUT;

  constructor(private jwtHelper: JwtHelperService) {
    this.initializeToken();
  }

  /**
   * Inicializa el token desde la URL o desde sessionStorage.
   */
  private initializeToken(): void {
    const urlToken = this.getTokenFromUrl();
    const storedToken = this.getStoredToken();

    if (urlToken) {
      this.token = urlToken;
      this.setToken(this.token);
      this.storeToken(this.token); // Almacena el token en sessionStorage
    } else if (storedToken) {
      this.token = storedToken;
      this.setToken(this.token);
    }
  }

  /**
   * Extrae el token desde la URL.
   */
  private getTokenFromUrl(): string | null {
    const url = window.location.href;
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('token');
  }


  /**
   * Decodifica y configura el token.
   */
  setToken(token: string | null): void {
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.token = token;
      this.decodedToken = this.jwtHelper.decodeToken(token);
    } else {
      this.token = null;
      this.decodedToken = null;
    }
  }

  changeToken(newToken: string): Promise<void> {
    return new Promise((resolve) => {
      this.setToken(newToken);
      this.storeToken(newToken); // Almacena el token en sessionStorage // Almacenar el nuevo token en localStorage
      resolve();
    });
  }

  /**
   * Obtiene el token almacenado en sessionStorage.
   */
  private getStoredToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Almacena el token en sessionStorage.
   */
  private storeToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    if (this.token && this.jwtHelper.isTokenExpired(this.token)) {
      this.clearToken();
      return null;
    }
    return this.token;
  }

  /**
   * Limpia el token almacenado.
   */
  clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.token = null;
    this.decodedToken = null;
    window.location.href = this.apiUrl + '/transversales/usuarios/login';
  }

  /**
   * Retorna el token actual.
   */
  getTestToken(): string | null {
    return this.getToken();
  }

  // Métodos existentes para obtener información de usuario y permisos:
  getUserInfo(): any {
    return this.decodedToken?.user ? JSON.parse(this.decodedToken.user) : null;
  }

  getUserRoles(): Authority[] {
    return this.decodedToken?.authorities
      ? JSON.parse(this.decodedToken.authorities) as Authority[]
      : [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().some((auth: Authority) => auth.sistema === role);
  }

  hasPermission(permission: string): boolean {
    return this.getUserRoles().some((auth: Authority) =>
      auth.permisos.some((permiso: Permiso) => permiso.sistema === permission)
    );
  }
}
