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

  // GET solicitudes con múltiples filtros
  getSolicitudes(
    estado: string,
    categoria: string,
    search: string
  ): Observable<any> {
    let params: string[] = [];

    // Agregar parámetros de búsqueda si existen
    if (search) {
      const searchParam = !isNaN(+search)
        ?  search.length > 8 ? `nit=${search}` :`id=${search}`
        : `nombreEmpresa=${search}`;
      params.push(searchParam);
    }

    if (estado) {
      params.push(`estadoSolicitudDescripcion=${estado}`);
    }

    if (categoria) {
      params.push(`categoriaSolicitudDescripcion=${categoria}`);
    }

    // Unir todos los parámetros con '&'
    let allParams = params.join('&');
    console.log(allParams);

    // Realizar la solicitud HTTP con los parámetros construidos
    return this.http.get(`${this.baseUrl}/api/formulario?${allParams}`);
  }

  //validator nit
  getSolicitudByNIT(nit: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/formulario/verificar-nit/${nit}`);
  }

  //get data by nit
  getDataByNIT(nit: string): Observable<any> {
    return this.http.post(
      `http://104.211.39.160:8000/getConfecamaras`,
      { document: nit },
      {
        responseType: 'text',
      }
    );
  }

  // POST fijar capacidad transportadora
  createSolicitud(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/formulario-contrato`, data, {
      responseType: 'text',
    });
  }
}
