import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from 'app/main/pages/compartidos/modelos/Producto';
import { ReporteDTO } from 'app/main/pages/compartidos/modelos/ReporteDTO.model';
import { Transaccion } from 'app/main/pages/compartidos/modelos/Transaccion';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import axios from 'axios';
import { CuentaClave } from 'app/main/pages/compartidos/modelos/CuentaClave';

@Injectable({
  providedIn: 'root'
})
export class TransaccionConsultaService {

  constructor(private http: HttpClient) { }
  /*SERVICIOS INTERNOS*/
  eliminarTransaccionPorId(codigo: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_seguridad}/catalogo/eliminarTransaccionPorId/${codigo}`);
  }
  listarTransaccionPorSede(codigoSede: number) {
    return this.http.get<Transaccion[]>(`${environment.url_seguridad}/catalogo/listarTransaccionPorSede/${codigoSede}`);
  }
  listarTransaccionPorDescripcion(descripcion: string) {
    return this.http.get<Transaccion[]>(`${environment.url_seguridad}/catalogo/listarTransaccionPorDescripcion/${descripcion}`);
  }
  listarTransaccionPorClaveCuenta(claveCuenta: string) {
    return this.http.get<Transaccion[]>(`${environment.url_seguridad}/catalogo/listarTransaccionPorClaveCuenta/${claveCuenta}`);
  }
  listarTransaccionPorCliente(codCliente: number) {
    return this.http.get<Transaccion[]>(`${environment.url_seguridad}/catalogo/listarTransaccionPorCliente/${codCliente}`);
  }
  listarTransaccionACaducarse(numDias: number) {
    return this.http.get<Transaccion[]>(`${environment.url_seguridad}/catalogo/listarTransaccionACaducarse/${numDias}`);
  }
  listarTransaccionPorRangoFechas(fechaInicio: string, fechaFin: string) {
    return this.http.get<Transaccion[]>(`${environment.url_seguridad}/catalogo/listarTransaccionPorRangoFechas/${fechaInicio}/${fechaFin}`);
  }
  listarTodosTransaccion(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarTodosTransaccion`);
  }
  listarTransaccionActivo(nemonicoModulo: string): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarTransaccionActivo/${nemonicoModulo}`);
  }
  listarTransaccionPadre(codigoAplicacion: number) {
    return this.http.get<Transaccion[]>(`${environment.url_seguridad}/catalogo/listarTransaccionPadre/${codigoAplicacion}`);
  }
  listarCuentaClavePorTransaccion(codTransaccion: number) {
    return this.http.get<Transaccion[]>(`${environment.url_seguridad}/venta/listarCuentaClavePorTransaccion/${codTransaccion}`);
  }
  guardarListaCuentaClave(listaCuentaClave: CuentaClave[]) {
    return this.http.post<CuentaClave[]>(`${environment.url_seguridad}/venta/guardarListaCuentaClave`, listaCuentaClave);
  }

  buscarTransaccionPorCodigo(codigo: number) {
    return this.http.get<Transaccion>(`${environment.url_seguridad}/catalogo/buscarTransaccionPorCodigo/${codigo}`);
  }
  guardarTransaccion(transaccion) {
    return this.http.post<Transaccion>(`${environment.url_seguridad}/catalogo/guardarTransaccion`, transaccion);
  }
  // Enviar Correo con Archivo PDF
  enviarCorreo(reporteDTO: ReporteDTO): Observable<any> {
    return this.http.post(`${environment.url_seguridad}/private/enviarCorreo`, reporteDTO);
  }

  // Servicios de Modulo
  buscarModuloPorCodigo(codigo: number) {
    return this.http.get<Producto>(`${environment.url_seguridad}/catalogo/buscarModuloPorCodigo/${codigo}`);
  }
  listarModuloActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarModuloActivo`);
  }
  buscarModuloPorNemonico(nemonico: string) {
    return this.http.get<Producto>(`${environment.url_seguridad}/catalogo/buscarModuloPorNemonico/${nemonico}`);
  }

  // Servicios de Parametro
  buscarParametroPorCodigo(codigo: number) {
    return this.http.get<Producto>(`${environment.url_seguridad}/catalogo/buscarParametroPorCodigo/${codigo}`);
  }
  listarParametroActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarParametroActivo`);
  }
  buscarParametroPorNemonico(nemonico: string) {
    return this.http.get<Producto>(`${environment.url_seguridad}/catalogo/buscarParametroPorNemonico/${nemonico}`);
  }

  // Servicios de Operacion
  buscarOperacionPorCodigo(codigo: number) {
    return this.http.get<Producto>(`${environment.url_seguridad}/catalogo/buscarOperacionPorCodigo/${codigo}`);
  }
  listarOperacionActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarOperacionActivo`);
  }
  buscarOperacionPorNemonico(nemonico: string) {
    return this.http.get<Producto>(`${environment.url_seguridad}/catalogo/buscarOperacionPorNemonico/${nemonico}`);
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

  enviarMensajeWhatsappAI(celular: string, mensaje: string) {
    let objeto = { message: mensaje, mode: 'no-cors' };
    return this.http.post(`${environment.url_wspAI}/chat/sendmessage/${celular}`, objeto);
  }

  enviarMensajeWhatsappND(celular: string, mensaje: string) {
    let objeto = { message: mensaje, mode: 'no-cors' };
    return this.http.post(`${environment.url_wspND}/chat/sendmessage/${celular}`, objeto);
  }

  enviarMensajeWhatsappQR(celular: string, mensaje: string) {
    return this.http.get(`${environment.url_wspAI}/auth/getqr`);
  }

}
