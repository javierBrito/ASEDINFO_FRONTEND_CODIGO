import { Routes } from '@angular/router';
import { EstadoPrincipalComponent } from '../componentes/estado-principal/estado-principal.component';

export const RUTA_ESTADO: Routes = [
  {
    path: 'competencia/estado',
    component: EstadoPrincipalComponent,
    //canActivate: [AuthGuard],
  }
];