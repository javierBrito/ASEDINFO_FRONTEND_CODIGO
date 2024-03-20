import { Routes } from '@angular/router';
import { TransaccionConsultaPrincipalComponent } from '../componentes/transaccion-consulta-principal/transaccion-consulta-principal.component';

export const RUTA_TRANSACCION_CONSULTA: Routes = [
  {
    path: 'venta/transaccion-consulta',
    component: TransaccionConsultaPrincipalComponent,
    //canActivate: [AuthGuard],
  }
];