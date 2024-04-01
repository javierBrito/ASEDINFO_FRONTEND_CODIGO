import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import dayjs from "dayjs";
import { EstadoCompetencia } from 'app/main/pages/compartidos/modelos/EstadoCompetencia';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Integrante } from 'app/main/pages/compartidos/modelos/Integrante';
import { ParticipanteService } from '../../../participante/servicios/participante.service';
import { AuthenticationService } from 'app/auth/service';
import { UsuarioWPDTO } from 'app/main/pages/compartidos/modelos/UsuarioWPDTO';
import { ParametroService } from 'app/main/pages/catalogo/parametro/servicios/parametro.service';
import { Parametro } from 'app/main/pages/compartidos/modelos/Parametro';

@Component({
  selector: 'app-estado-principal',
  templateUrl: './estado-principal.component.html',
  styleUrls: ['./estado-principal.component.scss']
})
export class EstadoPrincipalComponent implements OnInit {
  /*INPUT RECIBEN*/

  /*MODALES*/
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;

  @ViewChild("myModalInfo", { static: false }) myModalInfo: TemplateRef<any>;
  @ViewChild("modalIntegrante", { static: false }) modalIntegrante: TemplateRef<any>;

  /*VARIABLES*/
  public disabledEstado: boolean;
  public codInstancia: number = 0;

  /*LISTAS*/
  public listaParticipante: Participante[] = [];
  public listaParticipanteAux: Participante[] = [];
  public listaParticipanteUsuario: Participante[] = [];
  public listaUsuarioWPDTO: UsuarioWPDTO[] = [];
  public listaEstadoCompetencia: EstadoCompetencia[] = [];
  public listaIntegrante: Integrante[] = [];

  /*TABS*/
  public selectedTab: number;

  /*OBJETOS*/
  private currentUser: LoginAplicacion;

  /*DETAIL*/
  public showDetail: boolean;

  /*PAGINACION*/
  public page: number;
  public itemsRegistros: number;

  /*OBJETOS*/
  public participanteSeleccionado: Participante;
  public participante: Participante;
  public parametro: Parametro;

  /*FORMULARIOS*/
  public formEstado: FormGroup;

  /*CONSTRUCTOR */
  constructor(
    /*Servicios*/
    private readonly participanteService: ParticipanteService,
    private readonly parametroService: ParametroService,
    private readonly mensajeService: MensajeService,
    private modalService: NgbModal,
    private autenticacion: AuthenticationService,
  ) {
    // Inicio - Acceder directamente a la página de inscripción
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //if (this.currentUser == null || this.currentUser?.identificacion != "minutoAminuto") {
    this.iniciarSesion();
    //};
    // Fin - Acceder directamente a la página de inscripción
  }

  ngOnInit() {
    this.obtenerParametros();
    this.itemsRegistros = 20;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
    this.disabledEstado = true;
    if (this.currentUser != null) {
      this.listarParticipantePorEstado();
    }
    if (this.currentUser?.identificacion == "minutoAminuto") {
      setTimeout(() => {
        this.listarParticipantePorEstado();
        //window.location.reload();
      }, 249999);
      setTimeout(() => {
        //this.listarParticipantePorEstado();
        window.location.reload();
      }, 249999);
    }
  }

  obtenerParametros() {
    this.parametroService.buscarParametroPorNemonico('INSTANCIA').subscribe(
      (respuesta) => {
        this.parametro = respuesta['objeto'];
        this.codInstancia = this.parametro?.valor;
        if (this.codInstancia == undefined || this.codInstancia == 0) {
          this.mensajeService.mensajeError('Ingrese parámetros de SUBCATEGORÍA E INSTANCIA, para ingreso de puntaje..');
        }
      }
    )
  }

  // Inicio - Acceder directamente a la página de inscripción
  iniciarSesion() {
    this.autenticacion.login('minutoAminuto', '1512').subscribe(
      (respuesta) => {
        //this.listarParticipantePorEstado();
        setTimeout(() => {
          this.listarParticipantePorEstado();
          //window.location.reload();
        }, 249999);
      }
    );
  }
  // Fin - Acceder directamente a la página de inscripción

  listarParticipantePorEstado() {
    this.listaParticipante = [];
    this.listaParticipanteAux = [];
    this.participanteService.listarParticipantePorEstado("A").subscribe(
      (respuesta) => {
        this.listaParticipanteAux = respuesta['listado'];
        if (this.listaParticipanteAux.length < this.itemsRegistros) {
          this.page = 1;
        }
        if (this.listaParticipanteAux.length > 0) {
          // Listar usuarios registrados en Wordpress
          this.listarUsuarioWPDTO();
          for (let ele of this.listaParticipanteAux) {
            // Verificar si existe el parametro de codInstancia
            if (this.codInstancia == ele?.codInstancia) {
              // Tratar nombre de Pariicipante
              if (ele?.lastName != "" && ele?.username == "") {
                ele.nombrePersona = ele?.firstName + " - " + ele?.lastName;
              } else {
                ele.nombrePersona = ele?.firstName;
              }
              ele.displayNoneGrupo = "none";
              if (ele?.identificacion == this.currentUser.identificacion) {
                ele.desCategoria = "DIRECTOR";
                ele.desSubcategoria = "ACADEMIA";
              }
              if (ele.desSubcategoria.includes("GRUPOS") || ele.desSubcategoria.includes("CREW") ||
                ele.desSubcategoria.includes("SHOW DANCE")) {
                ele.displayNoneGrupo = "";
              }
              ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
              this.listaParticipante.push(ele);
            }
          }
        }
        // Ordenar lista por numParticipante
        //this.listaParticipante.sort((firstItem, secondItem) => firstItem.numParticipante - secondItem.numParticipante);
      }
    );
  }

  listarUsuarioWPDTO() {
    this.listaUsuarioWPDTO = [];
    this.participanteService.listarUsuarioWP().subscribe(
      (respuesta) => {
        this.listaUsuarioWPDTO = respuesta['listado'];
        // Listar usuarios registrados en asedinfo_data
        this.listarParticipanteUsuario();
      }
    );
  }

  listarParticipanteUsuario() {
    this.listaParticipanteUsuario = [];
    this.participanteService.listarParticipanteUsuario().subscribe(
      (respuesta) => {
        this.listaParticipanteUsuario = respuesta['listado'];
        //console.log("this.listaUsuarioWPDTO.length = ", this.listaUsuarioWPDTO.length)
        //console.log("this.listaParticipanteUsuario.length - 1) = ", (this.listaParticipanteUsuario.length - 1))
        if (this.listaUsuarioWPDTO.length > (this.listaParticipanteUsuario.length - 1)) {
          //this.migrarUsuarioWP();
        }
      }
    );
  }

  migrarUsuarioWP() {
    this.participanteService.migrarUsuarioWP().subscribe({
      next: (response) => {
        console.log("Migrar Participantes correcto...");
      },
      error: (error) => {
        console.log("Migrar Participantes con error = " + error);
      }
    });
  }

  closeDetail($event) {
    this.showDetail = $event;
    this.participanteSeleccionado = null;
  }

  verListaIntegrante = async (codParticipante: number) => {
    await this.listarIntegrantePorParticipante(codParticipante);
    await this.verModalIntegrante();
  }

  async listarIntegrantePorParticipante(codParticipante: number) {
    return new Promise((resolve, rejects) => {
      this.participanteService.listarIntegrantePorParticipante(codParticipante).subscribe({
        next: (respuesta) => {
          this.listaIntegrante = respuesta['listado'];
          resolve(respuesta);
        }, error: (error) => {
          rejects("Error");
          console.log("Error =", error);
        }
      })
    })
  }

  async verModalIntegrante() {
    this.modalService.open(this.modalIntegrante).result.then(r => {
      console.log("Tu respuesta ha sido: " + r);
    }, error => {
      console.log(error);
    });
  }

  /* Variables del html, para receptar datos y validaciones*/

}
