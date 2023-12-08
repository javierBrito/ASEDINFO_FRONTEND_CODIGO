import { Routes } from '@angular/router';
import { ResultadoPrincipalComponent } from '../componentes/resultado-principal/resultado-principal.component';

export const RUTA_RESULTADO: Routes = [
  {
    path: 'competencia/resultado',
    component: ResultadoPrincipalComponent,
    //canActivate: [AuthGuard],
  }
];