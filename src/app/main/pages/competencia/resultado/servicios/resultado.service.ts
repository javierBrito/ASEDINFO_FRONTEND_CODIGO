import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from 'app/main/pages/compartidos/modelos/Producto';
import { ReporteDTO } from 'app/main/pages/compartidos/modelos/ReporteDTO.model';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import axios from 'axios';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { Puntaje } from 'app/main/pages/compartidos/modelos/Puntaje';

@Injectable({
  providedIn: 'root'
})
export class ResultadoService {

  constructor(private http: HttpClient) { }
  /*SERVICIOS INTERNOS*/
  eliminarResultadoPorId(codigo: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_seguridad}/catalogo/eliminarResultadoPorId/${codigo}`);
  }
  listarPuntajePorSede(codigoSede: number) {
    return this.http.get<Puntaje[]>(`${environment.url_seguridad}/catalogo/listarPuntajePorSede/${codigoSede}`);
  }
  listarPuntajePorDescripcion(descripcion: string) {
    return this.http.get<Puntaje[]>(`${environment.url_seguridad}/catalogo/listarPuntajePorDescripcion/${descripcion}`);
  }
  listarPuntajePorSubcategoria(codSubcategoria: number, codInstancia: number) {
    return this.http.get<Puntaje[]>(`${environment.url_seguridad}/competencia/listarPuntajePorSubcategoria/${codSubcategoria}/${codInstancia}`);
  }
  listarPuntajePorSubcategoriaRegTotal(codSubcategoria: number, codInstancia: number, codUsuarioJuez: number) {
    return this.http.get<Puntaje[]>(`${environment.url_seguridad}/competencia/listarPuntajePorSubcategoriaRegTotal/${codSubcategoria}/${codInstancia}/${codUsuarioJuez}`);
  }
  listarPuntajePorSubcategoriaInstanciaRegAVG(codSubcategoria: number, codInstancia: number) {
    return this.http.get<Puntaje[]>(`${environment.url_seguridad}/competencia/listarPuntajePorSubcategoriaInstanciaRegAVG/${codSubcategoria}/${codInstancia}`);
  }
  listarPuntajePorSubcategoriaInstanciaRegSUMA(codSubcategoria: number, codInstancia: number) {
    return this.http.get<Puntaje[]>(`${environment.url_seguridad}/competencia/listarPuntajePorSubcategoriaInstanciaRegSUMA/${codSubcategoria}/${codInstancia}`);
  }
  listarPuntajePorParticipanteSubcategoriaInstanciaRegSUMA(codSubcategoria: number, codInstancia: number, codParticipante: number) {
    return this.http.get<Puntaje[]>(`${environment.url_seguridad}/competencia/listarPuntajePorSubcategoriaInstanciaRegSUMA/${codSubcategoria}/${codInstancia}/${codParticipante}`);
  }
  listarPuntajePorParticipante(codParticipante: number, codInstancia: number) {
    return this.http.get<Puntaje[]>(`${environment.url_seguridad}/competencia/listarPuntajePorSubcategoriaRegTotal/${codParticipante}/${codInstancia}`);
  }
  listarPuntajePorParticipanteRegTotal(codParticipante: number, codInstancia: number, codModeloResultado: number) {
    return this.http.get<Puntaje[]>(`${environment.url_seguridad}/competencia/listarPuntajePorParticipanteRegTotal/${codParticipante}/${codInstancia}/${codModeloResultado}`);
  }
  listarPuntajePorRangoFechas(fechaInicio: string, fechaFin: string) {
    return this.http.get<Puntaje[]>(`${environment.url_seguridad}/catalogo/listarPuntajePorRangoFechas/${fechaInicio}/${fechaFin}`);
  }
  listarTodosResultado(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarTodosResultado`);
  }
  listarPuntajeActivo(nemonicoModulo: string): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarPuntajeActivo/${nemonicoModulo}`);
  }
  listarPuntajePadre(codigoAplicacion: number) {
    return this.http.get<Puntaje[]>(`${environment.url_seguridad}/catalogo/listarPuntajePadre/${codigoAplicacion}`);
  }
  buscarResultadoPorCodigo(codigo: number) {
    return this.http.get<Puntaje>(`${environment.url_seguridad}/catalogo/buscarResultadoPorCodigo/${codigo}`);
  }
  guardarPuntaje(puntaje) {
    return this.http.post<Puntaje>(`${environment.url_seguridad}/competencia/guardarPuntaje`, puntaje);
  }
  // Enviar Correo con Archivo PDF
  enviarCorreo(reporteDTO: ReporteDTO): Observable<any> {
    return this.http.post(`${environment.url_seguridad}/private/enviarCorreo`, reporteDTO);
  }

  // Servicios de Modulo
  buscarModuloPorCodigo(codigo: number) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarModuloPorCodigo/${codigo}`);
  }
  listarModuloActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarModuloActivo`);
  }
  buscarModuloPorNemonico(nemonico: string) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarModuloPorNemonico/${nemonico}`);
  }

  // Servicios de Parametro
  buscarParametroPorCodigo(codigo: number) {
    return this.http.get<Producto>(`${environment.url_seguridad}/catalogo/buscarParametroPorCodigo/${codigo}`);
  }
  listarParametroActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarParametroActivo`);
  }
  buscarParametroPorNemonico(nemonico: string) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarParametroPorNemonico/${nemonico}`);
  }

  // Servicios de Operacion
  buscarOperacionPorCodigo(codigo: number) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarOperacionPorCodigo/${codigo}`);
  }
  listarOperacionActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarOperacionActivo`);
  }
  buscarOperacionPorNemonico(nemonico: string) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarOperacionPorNemonico/${nemonico}`);
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
  // Servicios de Modelo Resultado
  buscarModeloResultadoPorCodigo(codigo: number) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarModeloResultadoPorCodigo/${codigo}`);
  }
  listarModeloPuntajeActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarModeloPuntajeActivo`);
  }
  // Servicios de Modelo Participante
  buscarParticipantejePorCodigo(codigo: number) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarParticipantejePorCodigo/${codigo}`);
  }
  listarParticipanteActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarParticipanteActivo`);
  }
  listarParticipantePorSubcategoria(codSubcategoria: number) {
    return this.http.get<any[]>(`${environment.url_seguridad}/competencia/listarParticipantePorSubcategoria/${codSubcategoria}`);
  }
  listarParticipantePorSubcategoriaInstancia(codSubcategoria: number, codInstancia: number, codEstadoCompetencia: number) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/competencia/listarParticipantePorSubcategoriaInstancia/${codSubcategoria}/${codInstancia}/${codEstadoCompetencia}`);
  }

  /*SERVICIOS EXTERNOS*/
  public loadScriptAnt() {
    let node = document.createElement('script');
    node.src = 'assets/js/bot-whatsapp.js';
    node.type = 'text/javascript';
    node.async = true;
    document.getElementsByTagName('head')[0].appendChild(node);
  }

  public loadScript({ id, url }) {
    return new Promise((resolve, reject) => {
      if (id && document.getElementById(id)) {
        resolve({ id: id, loaded: true, status: 'Already Loaded' });
      }
      let body = document.body;
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = '';
      script.src = url;
      script.id = id;
      script.onload = () => {
        resolve({ id: id, loaded: true, status: 'Loaded' });
      };
      script.onerror = (error: any) => resolve({ id: id, loaded: false, status: 'Loaded' });
      script.async = true;
      script.defer = true;
      body.appendChild(script);
    });
  }
}
