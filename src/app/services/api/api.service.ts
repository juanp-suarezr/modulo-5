import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // Ejemplo de método GET
  getItems(): Observable<any> {
    return this.http.get(`${this.baseUrl}/items`);
  }
  // Ejemplo de método POST
  createItem(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/items`, data);
  }
  // Ejemplo de método PATCH
  updateItem(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/items/${id}`, data);
  }
  // Ejemplo de método DELETE
  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/items/${id}`);
  }

  //obtener auth y roles
  getAuthUserAndRoles(): Observable<any> {
    // Datos "quemados" simulando la respuesta de un API en Spring Boot
    const response = {
      user: {
        id: 1,
        username: 'juan.perez',
        fullName: 'Rol escritura territorial ministerio',
        email: 'juan.perez@example.com',
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
    };

    // Retornamos los datos como un Observable simulando la respuesta de un API
    return of(response);
  }

  //obtener solicitudes indicadores gestion
  getSolicitudesTransporte(): Observable<any> {
    const response = {
      data: [
        {
          id: '1.586',
          fecha: '2024-07-11T05:00:00',
          empresa: 'Transdep Especial Colombia S.A.S',
          territorial: 'Dirección Territorial Magdalena',
          categoria: 'Fijación de Capacidad Transportadora',
        },
        {
          id: '1.587',
          fecha: '2024-08-11T05:00:00',
          empresa: 'Transdep Especial Colombia S.A.S',
          territorial: 'Dirección Territorial Magdalena',
          categoria: 'Fijación de Capacidad Transportadora',
        },
        {
          id: '1.588',
          fecha: '2024-09-11T05:00:00',
          empresa: 'Transdep Especial Colombia S.A.S',
          territorial: 'Dirección Territorial Magdalena',
          categoria: 'Fijación de Capacidad Transportadora',
        },
      ],
      current_page: 1,
      per_page: 3,
      total: 10,
      total_pages: 4,
      next_page_url: 'https://api.example.com/data?page=2',
      prev_page_url: null,
      links: [
        { url: null, label: 'Anterior', active: false },
        {
          url: 'https://api.example.com/data?page=1',
          label: '1',
          active: true,
        },
        {
          url: 'https://api.example.com/data?page=2',
          label: '2',
          active: false,
        },
        {
          url: 'https://api.example.com/data?page=3',
          label: '3',
          active: false,
        },
        {
          url: 'https://api.example.com/data?page=4',
          label: '4',
          active: false,
        },
        {
          url: 'https://api.example.com/data?page=2',
          label: 'Siguiente',
          active: false,
        },
      ],
    };

    return of(response);
  }

  //obtener solicitudes indicadores gestion
  getSolicitudesTransporte2(): Observable<any> {
    const response = {
      data: [
        {
          id: '1.586',
          fecha: '2024-07-11T05:00:00',
          empresa: 'Transdep Especial Colombia S.A.S',
          territorial: 'Dirección Territorial Magdalena',
          EstadoSolicitud: 'Asignar',
          categoria: 'Fijación de Capacidad Transportadora',
          Semáforoalerta: '',
          numradicado: ''
        },
        {
          id: '1.587',
          fecha: '2024-08-11T05:00:00',
          empresa: 'Transdep Especial Colombia S.A.S',
          territorial: 'Dirección Territorial Magdalena',
          EstadoSolicitud: 'En estudio',
          categoria: 'Fijación de Capacidad Transportadora',
          Semáforoalerta: '6 dias',
          numradicado: '2024123456'

        },
        {
          id: '1.588',
          fecha: '2024-09-11T05:00:00',
          empresa: 'Transdep Especial Colombia S.A.S',
          territorial: 'Dirección Territorial Magdalena',
          EstadoSolicitud: 'Asignar',
          categoria: 'Fijación de Capacidad Transportadora',
          Semáforoalerta: '',
          numradicado: ''
        },
      ],
      current_page: 1,
      per_page: 3,
      total: 10,
      total_pages: 4,
      next_page_url: 'https://api.example.com/data?page=2',
      prev_page_url: null,
      links: [
        { url: null, label: 'Anterior', active: false },
        {
          url: 'https://api.example.com/data?page=1',
          label: '1',
          active: true,
        },
        
      ],
    };

    return of(response);
  }

  //departamentos
  getDeparts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/departamentos`);
  }

  //clase vehiculo
  getClaseVehiculo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/catalogos/ClaseVehiculo`);
  }

  
  
}
