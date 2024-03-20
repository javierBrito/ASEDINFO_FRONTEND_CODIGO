import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CoreCommonModule } from '@core/common.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgxPaginationModule } from 'ngx-pagination';
import { CorePipesModule } from './../../../@core/pipes/pipes.module';
import { AuthenticationModule } from './authentication/authentication.module';
/*Modulos*/
import { CoreDirectivesModule } from '@core/directives/directives';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { PrincipalModule } from './principal/principal.module';
import { ClienteModule } from './venta/cliente/modulos/cliente.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocioModule } from './ahorro/socio/modulos/socio.module';
import { SedeModule } from './seguridad/sede/modulos/sede.module';
import { AplicacionModule } from './seguridad/aplicacion/modulos/aplicacion.module';
import { RecursoModule } from './seguridad/recurso/modulos/recurso.module';
import { InicioSesionModule } from './seguridad/inicioSesion/modulos/inicioSesion.module';
import { RolAplicacionModule } from './seguridad/rolAplicacion/modulos/rolAplicacion.module';
import { RolAplicacionRecursoModule } from './seguridad/rolAplicacionRecurso/modulos/rolAplicacionRecurso.module';
import { UsuarioModule } from './seguridad/usuario/modulos/usuario.module';
import { UsuarioRolAplicacionModule } from './seguridad/usuarioRolAplicacion/modulos/usuarioRolAplicacion.module';
import { PersonaModule } from './catalogo/persona/modulos/persona.module';
import { ProductoModule } from './catalogo/producto/modulos/producto.module';
import { TransaccionModule } from './venta/transaccion/modulos/transaccion.module';
import { ParticipanteModule } from './competencia/participante/modulos/participante.module';
import { PuntajeModule } from './competencia/puntaje/modulos/puntaje.module';
import { CategoriaModule } from './catalogo/categoria/modulos/categoria.module';
import { SubcategoriaModule } from './catalogo/subcategoria/modulos/subcategoria.module';
import { ParametroModule } from './catalogo/parametro/modulos/parametro.module';
import { ResultadoModule } from './competencia/resultado/modulos/resultado.module';
import { EstadoModule } from './competencia/estado/modulos/estado.module';
import { SorteoModule } from './competencia/sorteo/modulos/sorteo.module';
import { TransaccionConsultaModule } from './venta/transaccion-consulta/modulos/transaccion-consulta.module';

@NgModule({
  declarations: [
    
  ],
  imports: [
    CorePipesModule,
    CoreDirectivesModule,
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    CoreCommonModule,
    ContentHeaderModule,
    NgbModule,
    NgSelectModule,
    FormsModule,
    AuthenticationModule,
    MiscellaneousModule,
    Ng2FlatpickrModule,
    PrincipalModule,
    NgxPaginationModule,
    SedeModule,
    AplicacionModule,
    RecursoModule,
    InicioSesionModule,
    RolAplicacionModule,
    RolAplicacionRecursoModule,
    UsuarioModule,
    UsuarioRolAplicacionModule,
    ClienteModule,
    PersonaModule,
    SocioModule,
    ProductoModule,
    TransaccionModule,
    ParticipanteModule,
    PuntajeModule,
    CategoriaModule,
    SubcategoriaModule,
    ParametroModule,
    ResultadoModule,
    EstadoModule,
    SorteoModule,
    TransaccionConsultaModule
  ],
  providers: []
})
export class PagesModule { }
