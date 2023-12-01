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
    return this.http.delete<any>(`${environment.url_seguridad}/venta/eliminarParticipantePorId/${codigo}`);
  }
  listarParticipantePorSede(codigoSede: number) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/venta/listarParticipantePorSede/${codigoSede}`);
  }
  listarParticipantePorIdentificacion(identificacion: string) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/venta/listarParticipantePorIdentificacion/${identificacion}`);
  }
  listarParticipantePorPersona(codPersona: number) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/venta/listarParticipantePorPersona/${codPersona}`);
  }
  listarTodosParticipante(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/venta/listarTodosParticipante`);
  }
  listarParticipanteActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/venta/listarParticipanteActivo`);
  }
  listarParticipantePadre(codigoAplicacion: number) {
    return this.http.get<Participante[]>(`${environment.url_seguridad}/venta/listarParticipantePadre/${codigoAplicacion}`);
  }
  buscarParticipantePorCodigo(codigo: number) {
    return this.http.get<Participante>(`${environment.url_seguridad}/venta/buscarParticipantePorCodigo/${codigo}`);
  }
  guardarParticipante(participante) {
    return this.http.post<Participante>(`${environment.url_seguridad}/venta/guardarParticipante`, participante);
  }

}
