import { inject, Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiSFService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_URL;
  private baseUrlRues = environment.RUES;
  private baseUrlFinanciero = environment.FINANCIERO;
  private token = 'a6edc4af-4b84-4444-8c98-8afa14437cd1';

  // constructor(private http: HttpClient) {}

  setToken(token: string): void {
    this.token = token;
    console.log('Token received in DestinoService:', this.token);
  }

  // GET solicitudes con múltiples filtros
  getSolicitudes(

    estado: string,
    categoria: string,
    search: string,
    fechaSolicitud: string,
    pageSize: number,
    currentPage: number,
    usuario: string
  ): Observable<any> {

    let params: string[] = [];
    let formulario: string = 'formulario';
    // Expresión regular para detectar caracteres especiales excepto espacios
  const specialCharRegex = /[^a-zA-Z0-9 ]/;

    console.log(usuario);

    if (usuario == 'superTransp') {
      formulario = 'formulario/rol-super';
    } else if (usuario == 'gesDoc') {
      formulario = 'formulario/rol-gestion';
    }
    // Agregar parámetros de búsqueda si existen
    if (search) {
      let searchParam;
      if (specialCharRegex.test(search)) {
        searchParam = `nombreEmpresa=++`;
      } else {
        searchParam = !isNaN(+search)
          ? search.length > 7
            ? `nit=${search}`
            : `id=${search}`
          : `nombreEmpresa=${search}`;
      }
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
    return this.http.get(
      `${this.baseUrl}/api/${formulario}?size=${pageSize}&page=${currentPage}&${allParams}`);
  }

  //GET solicitud by ID
  getSolicitudByID(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/formulario/${id}`);
  }

  //GET solicitud-documentos by NIT
  getDocumentosByNIT(nit: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/documentos/${nit}`);
  }

  //GET solicitud-documentos by ID
  //GET solicitud by ID completo
  getAllSolicitudByID(id: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/formularioContratoPasos/detalle/${id}`
    );
  }

  //GET solicitud-documentos by ID NIT
  getDocumentosByID(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/documentos-contratos/${id}`);
  }

  //GET solicitud-contratos by ID
  getContratosByID(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/detalle-contratos/${id}`);
  }

  //GET solicitud-contratos by ID SOLICITUD
  getContratosByIDSolicitud(id: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/detalle-contratos/by-solicitud/${id}`
    );
  }

  //validator nit
  getSolicitudByNIT(nit: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/formulario/verificar-nit/${nit}`);
  }

  //consulta nit por cantidad vehiculos
  getcantidadVehiculosByNIT(nit: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/formulario/cantidad-vehiculos/${nit}`);
  }

  //get data by nit RUES
  getDataByNIT(nit: string): Observable<any> {
    return this.http.post(
      `${this.baseUrlRues}/getConfecamaras`,
      { document: nit },
      {
        responseType: 'text',
      }
    );
  }


  //OBTENER DATOS DE FINANCIEROOO
  getFinanciero(nit: number): Observable<any> {
    return this.http.post(
      `${this.baseUrlFinanciero}/api/indicadores-gestion/${nit}`,
      { document: nit },
      {
        responseType: 'text',
      }
    );
  }

  //get descargar excel
  descargarExcel(id: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/detalle-contratos/export/excel/${id}`,
      {
        responseType: 'blob' as 'json',
      }
    );
  }

  createAllSolicitud(data1: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/formularioContratoPasos/paso1`,
      data1,
      {
        responseType: 'text',
      }
    );
  }

  // POST solicitud primer creacion
  createSolicitud(data1: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/formularioContratoPasos/paso1`,
      data1,
      {
        responseType: 'text',
      }
    );
  }

  // POST solicitud primer contratos
  createContratos(data2: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/formularioContratoPasos/paso4`,
      data2,
      {
        responseType: 'text',
      }
    );
  }

  // PUT solicitud paso 1
  SolicitudPaso1(id: string, data1: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/formularioContratoPasos/paso1/${id}`,
      data1,
      {
        responseType: 'text',
      }
    );
  }

  // PUT solicitud paso 2
  SolicitudPaso2(id: string, data2: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/formularioContratoPasos/paso2/${id}`,
      data2,
      {
        responseType: 'text',
      }
    );
  }

  // PUT solicitud paso 3
  SolicitudPaso3(id: string, data3: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/formularioContratoPasos/paso3/${id}`,
      data3,
      {
        responseType: 'text',
      }
    );
  }

  // PUT solicitud paso 4 contratos
  SolicitudPaso4(id: string, data4: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/formularioContratoPasos/paso4/${id}`,
      data4,
      {
        responseType: 'text',
      }
    );
  }

  // PUT Subsanar
  ActivarSubsanar(id: string, data: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/formulario/subsanar/${id}`,
      data,
      {
        responseType: 'text',
      }
    );
  }

  // PUT Radicado entrada
  RadicadoEntrada(id: string, data2: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/formulario/radicado-entrada/${id}`,
      data2,
      {
        responseType: 'text',
      }
    );
  }

  // PUT Radicado salida
  RadicadoSalida(id: string, data2: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/formulario/radicado-salida/${id}`,
      data2,
      {
        responseType: 'text',
      }
    );
  }

  // PUT excel-transporte
  ExcelTransporte(id: string, data2: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/formulario/excel-trasporte-especial/${id}`,
      data2,
      {
        responseType: 'text',
      }
    );
  }


  // PUT generadores riesgo
  GeneradoresRiesgo(id: string, data2: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/formulario/generado-riesgos/${id}`,
      data2,
      {
        responseType: 'text',
      }
    );
  }

  // PUT emitir concepto
  emitirConcepto(id: string, data2: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/formulario/concepto/${id}`,
      data2,
      {
        responseType: 'text',
      }
    );
  }

  // DELETE documentos
  deleteDoc(id: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/documentos/${id}`,
      {
        responseType: 'text',
      }
    );
  }
}
