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
  getSolicitudes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/formulario`);
  }

  //validator nit
  getSolicitudByNIT(nit: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/formulario/verificar-nit/${nit}`);
  }





}
