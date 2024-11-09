// auth.service.ts
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Authority, Permiso } from '../../models/auth.types';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly testToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBZG1pbmlzdHJhZG9yIiwiYXV0aG9yaXRpZXMiOiJbe1wiaWRcIjoxLFwibm9tYnJlXCI6XCJDYW5kaWRhdG8gYSB2aWdpbGFkb1wiLFwic2lzdGVtYVwiOlwiTVVWX0NBTkRJREFUT0FWSUdJTEFET1wiLFwicGVybWlzb3NcIjpbe1wiaWRcIjoxLFwibm9tYnJlXCI6XCJQcmUtcmVnaXN0cm9cIixcInNpc3RlbWFcIjpcIk1VVl9QUkVSRUdJU1RST1wifSx7XCJpZFwiOjIsXCJub21icmVcIjpcIkNhcmdhIGRlIERvY3VtZW50YWNpb25cIixcInNpc3RlbWFcIjpcIk1VVl9DQVJHQURPQ1VNRU5UQUNJT05cIn0se1wiaWRcIjozLFwibm9tYnJlXCI6XCJJbmdyZXNhIGluZm9ybWFjaW9uXCIsXCJzaXN0ZW1hXCI6XCJNVVZfSU5HUkVTQUlORk9STUFDSU9OXCJ9LHtcImlkXCI6NCxcIm5vbWJyZVwiOlwiU3Vic2FuYWNpb24gZGUgZG9jdW1lbnRhY2lvblwiLFwic2lzdGVtYVwiOlwiTVVWX1NVQlNBTkFDSU9OSU5GT1JNQUNJT05cIn0se1wiaWRcIjo1LFwibm9tYnJlXCI6XCJDb25zdWx0YSBzb2xpY2l0dWRcIixcInNpc3RlbWFcIjpcIk1VVl9DT05TVUxUQVNPTElDSVRVRFwifSx7XCJpZFwiOjYsXCJub21icmVcIjpcIk5vdGlmaWNhY2lvblwiLFwic2lzdGVtYVwiOlwiTVVWX05PVElGSUNBQ0lPTlwifV19XSIsImlkIjoyMSwidXNlciI6IntcImlkXCI6MjEsXCJub21icmVzXCI6XCJBZG1pbmlzdHJhZG9yXCIsXCJhcGVsbGlkb3NcIjpudWxsLFwiY29ycmVvXCI6XCJwcnVlYmFzc3VwZXJwQGdtYWlsLmNvbVwiLFwiZGVsZWdhdHVyYUlkXCI6bnVsbCxcInJhem9uU29jaWFsXCI6XCJBZG1pbmlzdHJhZG9yIG51bGxcIn0iLCJleHAiOjE3MzIyODI2OTQsImlhdCI6MTczMDk4NjY5NH0.ZhW9FC4lugfs1GAp48nS3Gzu35BWeDZYWRfG2nOK01Q';
  private token: string | null = null;

  private decodedToken: { user?: string; authorities?: string } | null = null;

  constructor(private jwtHelper: JwtHelperService) {}

  setToken(token: string = this.testToken): void {
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.decodedToken = this.jwtHelper.decodeToken(token);
    } else {
      this.decodedToken = null;
    }
  }

  getTestToken(): string | null {
    return this.token || this.testToken;  // Retorna el token actual o el de prueba si no hay token
  }

  getUserInfo(): any {
    return this.decodedToken?.user ? JSON.parse(this.decodedToken.user) : null;
  }

  getUserRoles(): Authority[] {
    return this.decodedToken?.authorities ? JSON.parse(this.decodedToken.authorities) as Authority[] : [];
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