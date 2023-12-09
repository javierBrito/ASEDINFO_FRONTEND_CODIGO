import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Parametro } from 'app/main/pages/compartidos/modelos/Parametro';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParametroService {
  constructor(private http: HttpClient) { }
  eliminarParametroPorId(codigo: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_seguridad}/catalogo/eliminarParametroPorId/${codigo}`);
  }
  listarParametroActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarParametroActivo`);
  }
  buscarParametroPorCodigo(codigo: number) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarParametroPorCodigo/${codigo}`);
  }
  buscarParametroPorNemonico(nemonico: string) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarParametroPorNemonico/${nemonico}`);
  }
  guardarParametro(parametro) {
    return this.http.post<Parametro>(`${environment.url_seguridad}/catalogo/guardarParametro`, parametro);
  }
}
