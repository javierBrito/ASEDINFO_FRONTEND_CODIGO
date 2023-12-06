import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  constructor(private http: HttpClient) { }
  eliminarCategoriaPorId(codigo: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_seguridad}/catalogo/eliminarCategoriaPorId/${codigo}`);
  }
  listarCategoriaActivo(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarCategoriaActivo`);
  }
  listarCategoriaSuperior(): Observable<any> | undefined {
    return this.http.get<any[]>(`${environment.url_seguridad}/catalogo/listarCategoriaSuperior`);
    
  }
  buscarCategoriaPorCodigo(codigo: number) {
    return this.http.get<any>(`${environment.url_seguridad}/catalogo/buscarCategoriaPorCodigo/${codigo}`);

  }
  guardarCategoria(categoria) {
    return this.http.post<Categoria>(`${environment.url_seguridad}/catalogo/guardarCategoria`, categoria);
  }
}
