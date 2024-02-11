import { Routes } from '@angular/router';
import { SorteoPrincipalComponent } from '../componentes/sorteo-principal/sorteo-principal.component';

export const RUTA_SORTEO: Routes = [
  {
    path: 'competencia/sorteo',
    component: SorteoPrincipalComponent,
    //canActivate: [AuthGuard],
  }
];