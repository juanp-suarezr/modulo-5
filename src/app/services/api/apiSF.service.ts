import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiSFService {
  private baseUrl = 'http://localhost:9090';

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

  //get solicitudes
  getSolicitudes(estado: any, categoria: any, search: any): Observable<any> {
    let searchParam = '';
    
    
    // Verificar si es un número o un string
    if (!isNaN(search)) {
      // Es un número, buscar por ID
      searchParam = `id=${search}`;
    } else {
      // Es una cadena de texto, buscar por nombre de empresa
      searchParam = `nombreEmpresa=${search}`;
    }
    return this.http.get(
      `${this.baseUrl}/api/formulario?${searchParam}&?idEstadoSolicitud=${estado}&?idCategoriaSolicitud=${categoria}`
    );
  }

  //validator nit
  getSolicitudByNIT(nit: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/formulario/verificar-nit/${nit}`);
  }

  //get data by nit
  getDataByNIT(nit: string): Observable<any> {
    return this.http.post(`http://104.211.39.160:8000/getConfecamaras`, {"document": nit}, {
      responseType: 'text',
    });
  }
  

  // POST fijar capacidad transportadora
  createSolicitud(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/formulario-contrato`, data, {
      responseType: 'text',
    });
  }
}
