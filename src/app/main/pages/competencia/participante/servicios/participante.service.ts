import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
  listarTodosParticipante(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/competencia/listarTodosParticipante`);
  }
  listarParticipanteActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/competencia/listarParticipanteActivo`);
  }
  listarParticipantePadre(codigoAplicacion: number) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/competencia/listarParticipantePadre/${codigoAplicacion}`);
  }
  buscarParticipantePorCodigo(codigo: number) {
    return this.http.get<Participante>(`${environment.url_seguridad}/competencia/buscarParticipantePorCodigo/${codigo}`);
  }
  guardarParticipante(participante) {
    return this.http.post<Participante>(`${environment.url_seguridad}/competencia/guardarParticipante`, participante);
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

}

