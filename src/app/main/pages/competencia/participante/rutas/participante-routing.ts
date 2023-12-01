import { Routes } from '@angular/router';
import { ParticipantePrincipalComponent } from '../componentes/participante-principal/participante-principal.component';

export const RUTA_PARTICIPANTE: Routes = [
  {
    path: 'competencia/participante',
    component: ParticipantePrincipalComponent,
    //canActivate: [AuthGuard],
  }
];