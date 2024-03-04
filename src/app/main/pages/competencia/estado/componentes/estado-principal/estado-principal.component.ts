import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import dayjs from "dayjs";
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { Instancia } from 'app/main/pages/compartidos/modelos/Instancia';
import { Subcategoria } from 'app/main/pages/compartidos/modelos/Subcategoria';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { EstadoCompetencia } from 'app/main/pages/compartidos/modelos/EstadoCompetencia';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Integrante } from 'app/main/pages/compartidos/modelos/Integrante';
import { ParticipanteService } from '../../../participante/servicios/participante.service';
import { AuthenticationService } from 'app/auth/service';
import { UsuarioWPDTO } from 'app/main/pages/compartidos/modelos/UsuarioWPDTO';

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

  /*LISTAS*/
  public listaParticipante: Participante[] = [];
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

  /*FORMULARIOS*/
  public formEstado: FormGroup;

  /*CONSTRUCTOR */
  constructor(
    /*Servicios*/
    private readonly participanteService: ParticipanteService,
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
      }, 24999);
      setTimeout(() => {
        //this.listarParticipantePorEstado();
        window.location.reload();
      }, 24999);
    }
  }

  // Inicio - Acceder directamente a la página de inscripción
  iniciarSesion() {
    this.autenticacion.login('minutoAminuto', '1512').subscribe(
      (respuesta) => {
        //this.listarParticipantePorEstado();
        setTimeout(() => {
          this.listarParticipantePorEstado();
          //window.location.reload();
        }, 24999);
      }
    );
  }
  // Fin - Acceder directamente a la página de inscripción

  listarParticipantePorEstado() {
    this.listaParticipante = [];
    this.participanteService.listarParticipantePorEstado("A").subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        if (this.listaParticipante.length < this.itemsRegistros) {
          this.page = 1;
        }
        if (this.listaParticipante.length > 0) {
          // Listar usuarios registrados en Wordpress
          this.listarUsuarioWPDTO();
          for (const ele of this.listaParticipante) {
            ele.displayNoneGrupo = "none";
            if (ele?.identificacion == this.currentUser.identificacion) {
              ele.desCategoria = "DIRECTOR";
              ele.desSubcategoria = "ACADEMIA";
            }
            if (ele?.desSubcategoria.includes("GRUPOS")) {
              ele.displayNoneGrupo = "";
            }
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          }
        }
        // Ordenar lista por numParticipante
        this.listaParticipante.sort((firstItem, secondItem) => firstItem.numParticipante - secondItem.numParticipante);
      }
    );
  }

  listarUsuarioWPDTO() {
    this.listaUsuarioWPDTO = [];
    this.participanteService.listarUsuarioWPDTO().subscribe(
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
        if (this.listaUsuarioWPDTO.length > (this.listaParticipanteUsuario.length - 1)) {
          this.migrarUsuarioWP();
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
