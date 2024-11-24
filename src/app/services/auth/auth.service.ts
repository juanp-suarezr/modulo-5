// auth.service.ts
import { Injectable, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Authority, Permiso } from '../../models/auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnInit, OnChanges {
  //ROL TERRITORIAL: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ2aWdpbGFkbyIsImF1dGhvcml0aWVzIjoiW3tcImlkXCI6MTEsXCJub21icmVcIjpcInRlcnJpdG9yaWFsXCIsXCJzaXN0ZW1hXCI6XCJNU0ZfVEVSUklUT1JJQUxcIixcInBlcm1pc29zXCI6W3tcImlkXCI6MTksXCJub21icmVcIjpcIkNSRUFSX1NPTElDSVRVRFwiLFwic2lzdGVtYVwiOlwiTVNGX0NSRUFSX1NPTElDSVRVRFwiLFwiaWRfcmVsYWNpb25cIjoxN30se1wiaWRcIjoyMCxcIm5vbWJyZVwiOlwiU0ZfTElTVEFSX1NPTElDSVRVRF9UUlwiLFwic2lzdGVtYVwiOlwiTVNGX1NGX0xJU1RBUl9TT0xJQ0lUVURfVFJcIixcImlkX3JlbGFjaW9uXCI6MTh9XX1dIiwiaWQiOjM1LCJ1c2VyIjoie1wiaWRcIjozNSxcIm5vbWJyZXNcIjpcInZpZ2lsYWRvXCIsXCJhcGVsbGlkb3NcIjpudWxsLFwiY29ycmVvXCI6XCJqdWxpb2ppbW1lemFAZ21haWwuY29tXCIsXCJkZWxlZ2F0dXJhSWRcIjpudWxsLFwicmF6b25Tb2NpYWxcIjpcInZpZ2lsYWRvXCIsXCJkb2N1bWVudG9cIjpcIjg5ODg5ODkwMFwifSIsInN5c3RlbSI6Ik1TRiIsImV4cCI6MTczMjA4MDg2NiwiaWF0IjoxNzMyMDc3MjY2fQ.3XEaObL5l5Z_pSsQH2g87OjbvR4KVYCtb3C2ZuN5zJ4
  private token: string | null = null;
  private decodedToken: { user?: string; authorities?: string } | null = null;
  private readonly defaultToken: string =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ2aWdpbGFkbyIsImF1dGhvcml0aWVzIjoiW3tcImlkXCI6MTEsXCJub21icmVcIjpcInRlcnJpdG9yaWFsXCIsXCJzaXN0ZW1hXCI6XCJNU0ZfVEVSUklUT1JJQUxcIixcInBlcm1pc29zXCI6W3tcImlkXCI6MTksXCJub21icmVcIjpcIkNSRUFSX1NPTElDSVRVRFwiLFwic2lzdGVtYVwiOlwiTVNGX0NSRUFSX1NPTElDSVRVRFwiLFwiaWRfcmVsYWNpb25cIjoxN30se1wiaWRcIjoyMCxcIm5vbWJyZVwiOlwiU0ZfTElTVEFSX1NPTElDSVRVRF9UUlwiLFwic2lzdGVtYVwiOlwiTVNGX1NGX0xJU1RBUl9TT0xJQ0lUVURfVFJcIixcImlkX3JlbGFjaW9uXCI6MTh9XX1dIiwiaWQiOjM1LCJ1c2VyIjoie1wiaWRcIjozNSxcIm5vbWJyZXNcIjpcInZpZ2lsYWRvXCIsXCJhcGVsbGlkb3NcIjpudWxsLFwiY29ycmVvXCI6XCJqdWxpb2ppbW1lemFAZ21haWwuY29tXCIsXCJkZWxlZ2F0dXJhSWRcIjpudWxsLFwicmF6b25Tb2NpYWxcIjpcInZpZ2lsYWRvXCIsXCJkb2N1bWVudG9cIjpcIjg5ODg5ODkwMFwifSIsInN5c3RlbSI6Ik1TRiIsImV4cCI6MTczMjA4MDg2NiwiaWF0IjoxNzMyMDc3MjY2fQ.3XEaObL5l5Z_pSsQH2g87OjbvR4KVYCtb3C2ZuN5zJ4'; // Define your default token here

  constructor(private jwtHelper: JwtHelperService) {
    this.initializeToken();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.initializeToken();
  }

  ngOnInit() {
    this.initializeToken();
  }

  private initializeToken(): void {
    console.log('🚀 INITIALICE TOKEN ...:');
    const storedToken = localStorage.getItem('authToken');
    const authToken = storedToken ? storedToken : this.defaultToken;
    this.setToken(authToken);
    if (storedToken !== authToken) localStorage.setItem('authToken', authToken);
  }

  changeToken(newToken: string): Promise<void> {
    return new Promise((resolve) => {
      this.setToken(newToken);
      localStorage.setItem('authToken', newToken); // Almacenar el nuevo token en localStorage
      resolve();
    });
  }

  setToken(token: string = this.defaultToken): void {
    //&& !this.jwtHelper.isTokenExpired(token)
    if (token) {
      this.decodedToken = this.jwtHelper.decodeToken(token);
      this.token = token;
    } else {
      this.decodedToken = null;
      this.token = null;
    }
  }

  getCurrentToken(): string | null {
    return this.token || this.defaultToken;
  }

  getUserInfo(): any {
    return this.decodedToken?.user ? JSON.parse(this.decodedToken.user) : null;
  }

  getUserRoles(): Authority[] {
    return this.decodedToken?.authorities
      ? (JSON.parse(this.decodedToken.authorities) as Authority[])
      : [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().some((auth: Authority) => auth.sistema === role);
  }

  hasPermission(permission: string | string[]): boolean {
    const roles = this.getUserRoles();
    
    // Verifica si el parámetro es un arreglo
    if (Array.isArray(permission)) {
      // Retorna true si el usuario tiene al menos uno de los permisos
      const hasAnyPermission = roles.some((auth: Authority) =>
        auth.permisos.some((permiso: Permiso) =>
          permission.includes(permiso.sistema)
        )
      );


      return hasAnyPermission;
    } else {
      // Retorna true si el usuario tiene el permiso individual
      const hasPermission = roles.some((auth: Authority) =>
        auth.permisos.some((permiso: Permiso) => permiso.sistema === permission)
      );

      return hasPermission;
    }
  }

  isAuthenticated(): boolean {
    const currentToken = this.token || this.defaultToken;
    // !this.jwtHelper.isTokenExpired(currentToken)
    return (
      currentToken !== null
    );
  }
}
