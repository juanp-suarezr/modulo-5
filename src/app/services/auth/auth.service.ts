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
  ];

  constructor() {}

  login(email: string, password: string): Observable<any> {
    const user = this.users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Simula una respuesta tipo Spring Boot con JSON
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
}
