import { Routes } from '@angular/router';
import { CategoriaPrincipalComponent } from '../componentes/categoria-principal/categoria-principal.component';

export const RUTA_CATEGORIA: Routes = [
  {
    path: 'catalogo/categoria',
    component: CategoriaPrincipalComponent,
    //canActivate: [AuthGuard],
  }
];