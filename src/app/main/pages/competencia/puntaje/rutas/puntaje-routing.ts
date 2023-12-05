import { Routes } from '@angular/router';
import { PuntajePrincipalComponent } from '../componentes/puntaje-principal/puntaje-principal.component';

export const RUTA_PUNTAJE: Routes = [
  {
    path: 'competencia/puntaje',
    component: PuntajePrincipalComponent,
    //canActivate: [AuthGuard],
  }
];