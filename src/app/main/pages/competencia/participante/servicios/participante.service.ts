import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CargarArchivoModelo } from 'app/main/pages/compartidos/modelos/CargarArchivoModelo';
import { Integrante } from 'app/main/pages/compartidos/modelos/Integrante';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipanteService {

  constructor(private http: HttpClient) { }
  /*SERVICIOS EXTERNOS*/
  eliminarParticipantePorId(codigo: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_seguridad}/competencia/eliminarParticipantePorId/${codigo}`);
  }
  listarParticipantePorSede(codigoSede: number) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/competencia/listarParticipantePorSede/${codigoSede}`);
  }
  listarParticipantePorIdentificacion(identificacion: string) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/competencia/listarParticipantePorIdentificacion/${identificacion}`);
  }
  listarParticipantePorPersona(codPersona: number) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/competencia/listarParticipantePorPersona/${codPersona}`);
  }
  listarParticipantePorSubcategoriaInstancia(codSubcategoria: number, codInstancia: number, codEstadoCompetencia: number) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/competencia/listarParticipantePorSubcategoriaInstancia/${codSubcategoria}/${codInstancia}/${codEstadoCompetencia}`);
  }
  listarParticipantePorEmail(email: string) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/competencia/listarParticipantePorEmail/${email}`);
  }
  listarTodosParticipante(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/competencia/listarTodosParticipante`);
  }
  listarParticipanteUsuario(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/competencia/listarParticipanteUsuario`);
  }
  listarParticipantePorEstado(estado: string): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/competencia/listarParticipantePorEstado/${estado}`);
  }
  listarUsuarioWP(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/wordpress/listarUsuarioWP`);
  }
  listarParticipantePadre(codigoAplicacion: number) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/competencia/listarParticipantePadre/${codigoAplicacion}`);
  }
  buscarParticipantePorCodigo(codigo: number) {
    return this.http.get<Participante>(`${environment.url_seguridad}/competencia/buscarParticipantePorCodigo/${codigo}`);
  }
  guardarParticipante(participante: Participante) {
    return this.http.post<Participante>(`${environment.url_seguridad}/competencia/guardarParticipante`, participante);
  }
  guardarListaIntegrante(listaIntegrante: Integrante[]) {
    return this.http.post<Integrante[]>(`${environment.url_seguridad}/competencia/guardarListaIntegrante`, listaIntegrante);
  }
  actualizarListaParticipante(listaParticipante: Participante[]) {
    return this.http.post<Participante[]>(`${environment.url_seguridad}/competencia/actualizarListaParticipante`, listaParticipante);
  }
  listarIntegranteActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/competencia/listarIntegranteActivo`);
  }
  listarIntegrantePorParticipante(codParticipante: number) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/competencia/listarIntegrantePorParticipante/${codParticipante}`);
  }

  // Servicios de Categoria
  buscarCategoriaPorCodigo(codigo: number) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarCategoriaPorCodigo/${codigo}`);
  }
  listarCategoriaActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarCategoriaActivo`);
  }
  // Servicios de Subcategoria
  buscarSubcategoriaPorCodigo(codigo: number) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarSubcategoriaPorCodigo/${codigo}`);
  }
  listarSubcategoriaActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarSubcategoriaActivo`);
  }
  listarParticipanteEnEscenario(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/competencia/listarParticipanteEnEscenario`);
  }
  listarSubcategoriaPorCategoria(codCategoria: number): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarSubcategoriaPorCategoria/${codCategoria}`);
  }
  // Servicios de Instancia
  buscarInstanciaPorCodigo(codigo: number) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarInstanciaPorCodigo/${codigo}`);
  }
  listarInstanciaActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarInstanciaActivo`);
  }
  // Servicios de Estado Competencia
  buscarEstadoCompetenciaPorCodigo(codigo: number) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarEstadoCompetenciaPorCodigo/${codigo}`);
  }
  listarEstadoCompetenciaActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarEstadoCompetenciaActivo`);
  }
  migrarClienteWP(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/wordpress/migrarClienteWP`);
  }
  migrarUsuarioWP(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/wordpress/migrarUsuarioWP`);
  }

  // GESTIÓN DE ARCHIVOS
  // Cargar archivo PDF a una carpeta
  cargarArchivo(file: File, nombreArchivo: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('files', file);
    const req = new HttpRequest('POST', `${environment.url_seguridad}/private/cargarArchivo/${nombreArchivo}`, formData, {
      reportProgress: true,
      responseType: 'json'
    });
    console.log("this.http.request(req) = ", this.http.request(req))
    return this.http.request(req);
  }

  // Descargar archivos PDF desde una carpeta y los muestra en una lista
  descargarArchivos(): Observable<CargarArchivoModelo[]> {
    return this.http.get<CargarArchivoModelo[]>(`${environment.url_seguridad}/private/descargarArchivos`);
  }

  // Metodo para borrar los archivos
  deleteFile(filename: string) {
    return this.http.get(`${environment.url_seguridad}/private/delete/${filename}`);
  }

  // Descargar archivo PDF desde una carpeta
  descargarArchivo(filename: string, empCedulaRep: string): Observable<HttpEvent<any>> {
    let url_ws = `${environment.url_seguridad}/private/descargarArchivo/`;
    url_ws += filename + "/" + empCedulaRep;
    return this.http.get(`${url_ws}`, {
      headers: new HttpHeaders().set(
        'Authorization',
        localStorage.getItem('token')
      ),
      reportProgress: true,
      observe: 'events',
      responseType: 'blob'
    });
  }

  //Visualizar Archivo
  vizualizarArchivo(nombreArchivo: string): Observable<HttpEvent<Blob>> {
    let codigo = 1;
    return this.http.get(`${environment.url_seguridad}/private/descargarArchivo/${nombreArchivo}/${codigo}`, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob'
    });
  }
}



