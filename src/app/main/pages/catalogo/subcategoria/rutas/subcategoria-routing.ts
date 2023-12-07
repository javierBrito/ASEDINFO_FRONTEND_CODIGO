import { Routes } from '@angular/router';
import { SubcategoriaPrincipalComponent } from '../componentes/subcategoria-principal/subcategoria-principal.component';

export const RUTA_SUBCATEGORIA: Routes = [
  {
    path: 'catalogo/subcategoria',
    component: SubcategoriaPrincipalComponent,
    //canActivate: [AuthGuard],
  }
];