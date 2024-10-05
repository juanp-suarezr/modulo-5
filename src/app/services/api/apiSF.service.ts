import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class ApiSFService {
  private baseUrl = environment.API_URL;
  private baseUrlRues = environment.RUES;

  constructor(private http: HttpClient) {}
  
  // Ejemplo de método DELETE
  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/items/${id}`);
  }

  // GET solicitudes con múltiples filtros
  getSolicitudes(
    estado: string,
    categoria: string,
    search: string, 
    fechaSolicitud: string,
    pageSize: number,
    currentPage: number,
  ): Observable<any> {
    let params: string[] = [];

    // Agregar parámetros de búsqueda si existen
    if (search) {
      const searchParam = !isNaN(+search)
        ?  search.length > 7 ? `nit=${search}` :`id=${search}`
        : `nombreEmpresa=${search}`;
      params.push(searchParam);
    }

    if (estado) {
      params.push(`estadoSolicitudDescripcion=${estado}`);
    }

    if (categoria) {
      params.push(`categoriaSolicitudDescripcion=${categoria}`);
    }

    if (fechaSolicitud) {
      params.push(`fechaSolicitud=${fechaSolicitud}`);
    }

    // Unir todos los parámetros con '&'
    let allParams = params.join('&');
    

    // Realizar la solicitud HTTP con los parámetros construidos
    return this.http.get(`${this.baseUrl}/api/formulario?size=${pageSize}&page=${currentPage}&${allParams}`);
  }

  //GET solicitud by ID
  getSolicitudByID(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/formulario/${id}`);
  }

  //GET solicitud-documentos by ID NIT
  getDocumentosByID(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/documentos/${id}`);
  }

  //GET solicitud-contratos by ID
  getContratosByID(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/detalle-contratos/${id}`);
  }

  //GET solicitud-contratos by ID SOLICITUD
  getContratosByIDSolicitud(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/detalle-contratos/by-solicitud/${id}`);
  }

  //validator nit
  getSolicitudByNIT(nit: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/formulario/verificar-nit/${nit}`);
  }

  //get data by nit
  getDataByNIT(nit: string): Observable<any> {
    return this.http.post(
      `${this.baseUrlRues}/getConfecamaras`,
      { document: nit },
      {
        responseType: 'text',
      }
    );
  }

  // POST solicitud primer creacion
  createSolicitud(data1: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/formularioContratoPasos/paso1`, data1, {
      responseType: 'text',
    });
  }

  // POST solicitud primer contratos
  createContratos(data2: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/formularioContratoPasos/paso4`, data2, {
      responseType: 'text',
    });
  }

  // PUT solicitud paso 1
  SolicitudPaso1(id: string, data1: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/formularioContratoPasos/paso1/${id}`, data1, {
      responseType: 'text',
    });
  }

  // PUT solicitud paso 2
  SolicitudPaso2(id: string, data2: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/formularioContratoPasos/paso2/${id}`, data2, {
      responseType: 'text',
    });
  }

  // PUT solicitud paso 3
  SolicitudPaso3(id: string, data3: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/formularioContratoPasos/paso3/${id}`, data3, {
      responseType: 'text',
    });
  }

  // PUT solicitud paso 4 contratos
  SolicitudPaso4(id: string, data4: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/formularioContratoPasos/paso4/${id}`, data4, {
      responseType: 'text',
    });
  }
  
  

}
