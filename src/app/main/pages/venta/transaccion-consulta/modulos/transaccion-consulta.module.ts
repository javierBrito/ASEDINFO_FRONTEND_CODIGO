import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterModule } from '@angular/router';
import { CoreCommonModule } from '@core/common.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { MaterialModule } from 'app/main/pages/material/material.module';
import { BlockUIModule } from 'ng-block-ui';
import { NgxPaginationModule } from 'ngx-pagination';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { MatTabsModule } from '@angular/material/tabs';
import { DetailComponent } from '../componentes/detail/detail.component';
import { RUTA_TRANSACCION_CONSULTA } from '../rutas/transaccion-consulta-routing';
import { TransaccionConsultaPrincipalComponent } from '../componentes/transaccion-consulta-principal/transaccion-consulta-principal.component';
import { FormTransaccionConsultaComponent } from '../componentes/transaccion-consulta-principal/form-transaccion-consulta/form-transaccion-consulta.component';

@NgModule({
  declarations: [
    TransaccionConsultaPrincipalComponent,
    FormTransaccionConsultaComponent,
    DetailComponent
    
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(RUTA_TRANSACCION_CONSULTA),
    CoreCommonModule,
    ContentHeaderModule,
    NgxPaginationModule,
    MaterialModule,
    MatStepperModule,
    MatSelectModule,
    FormsModule,
    TableModule,
    CheckboxModule,
    NgbModule,
    ContentHeaderModule,
    MaterialModule,
    MatTabsModule,
    NgxPaginationModule,
    BlockUIModule.forRoot(),
    
  ], schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class TransaccionConsultaModule { }
