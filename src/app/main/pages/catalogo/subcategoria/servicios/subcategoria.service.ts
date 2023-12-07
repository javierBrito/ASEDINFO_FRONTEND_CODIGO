import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subcategoria } from 'app/main/pages/compartidos/modelos/Subcategoria';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriaService {

  constructor(private http: HttpClient) { }
  /*SERVICIOS EXTERNOS*/
  eliminarSubcategoriaPorId(codigo: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_seguridad}/catalogo/eliminarSubcategoriaPorId/${codigo}`);
  }
  listarSubcategoriaPorCategoria(codCategoria: number) {
    return this.http.get<Subcategoria[]>(`${environment.url_seguridad}/catalogo/listarSubcategoriaPorCategoria/${codCategoria}`);
  }
  listarSubcategoriaPorCodRolCategoria(codigoRolCategoria: number) {
    return this.http.get<Subcategoria[]>(`${environment.url_seguridad}/catalogo/listarSubcategoriaPorCodRolCategoria/${codigoRolCategoria}`);
  }
  listarTodosSubcategoria(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarTodosSubcategoria`);
  }
  listarSubcategoriaActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarSubcategoriaActivo`);
  }
  listarSubcategoriaPadre(codigoCategoria: number) {
    return this.http.get<Subcategoria[]>(`${environment.url_seguridad}/catalogo/listarSubcategoriaPadre/${codigoCategoria}`);
  }
  buscarSubcategoriaPorCodigo(codigo: number) {
    return this.http.get<Subcategoria>(`${environment.url_seguridad}/catalogo/buscarSubcategoriaPorCodigo/${codigo}`);
  }
  guardarSubcategoria(subcategoria) {
    return this.http.post<Subcategoria>(`${environment.url_seguridad}/catalogo/guardarSubcategoria`, subcategoria);
  }

}
