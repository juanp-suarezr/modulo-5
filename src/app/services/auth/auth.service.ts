import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private users = [
    {
      id: 1,
      username: 'superTransporte',
      fullName: 'Rol escritura territorial ministerio',
      email: 'terriescritura@example.com',
      password: '123456',
      roles: [
        {
          id: 101,
          roleName: 'ROLE_ESCRITURA_MIN',
          description: 'Rol escritura territorial ministerio',
        },
      ],
      isActive: true,
      createdAt: '2024-08-16T08:30:00Z',
      lastLogin: '2024-08-15T18:45:00Z',
    },
    {
      id: 2,
      username: 'gestionDoc',
      fullName: 'Rol escritura gestión documental',
      email: 'gestiondoc@example.com',
      password: '123456',
      roles: [
        {
          id: 101,
          roleName: 'ROLE_ESCRITURA_GESDOC',
          description: 'Rol escritura gestion documental',
        },
      ],
      isActive: true,
      createdAt: '2024-08-16T08:30:00Z',
      lastLogin: '2024-08-15T18:45:00Z',
    },
    {
      id: 3,
      username: 'SuperiTransporte',
      fullName: 'Rol (Lectura y escritura) de la Superintendencia de Transporte',
      email: 'supertransporte@example.com',
      password: '123456',
      roles: [
        {
          id: 101,
          roleName: 'ROLE_SUPERTRANSPORTE',
          description: 'Rol escritura y lectura Superintendencia de Transporte',
        },
      ],
      isActive: true,
      createdAt: '2024-08-16T08:30:00Z',
      lastLogin: '2024-08-15T18:45:00Z',
    },
  ];
  currentUser: any = null;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser); // Restaura el usuario autenticado
      }
    } else {
      console.warn('localStorage is not available');
    }
  }
  

  login(email: string, password: string): Observable<any> {
    const user = this.users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Simula una respuesta tipo Spring Boot con JSON
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUser = user; // Actualiza el usuario autenticado en el servicio
      return of({
        token: 'fake-jwt-token',
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          roles: user.roles, // Devuelve todos los roles del usuario
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      });
    } else {
      // Simula un error de autenticación
      return of({ error: 'Invalid credentials' });
    }
  }

  getUsers(): any {
    return this.users;
  }

  logout(): void {
    localStorage.removeItem('user'); // Elimina el usuario de localStorage
    this.currentUser = null; // Resetea el estado del usuario autenticado
    location.reload();
  }

  isAuthenticated(): boolean {
    // Verifica si hay un usuario autenticado
    return !!this.currentUser;
  }
}
