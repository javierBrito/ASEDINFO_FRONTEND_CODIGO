import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { Aplicacion } from 'app/main/pages/compartidos/modelos/Aplicacion';
import dayjs from "dayjs";
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { empty } from 'rxjs';
import { ParticipanteService } from '../../servicios/participante.service';
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { Instancia } from 'app/main/pages/compartidos/modelos/Instancia';
import { Subcategoria } from 'app/main/pages/compartidos/modelos/Subcategoria';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { EstadoCompetencia } from 'app/main/pages/compartidos/modelos/EstadoCompetencia';
import { userInfo } from 'os';

@Component({
  selector: 'app-participante-principal',
  templateUrl: './participante-principal.component.html',
  styleUrls: ['./participante-principal.component.scss']
})
export class ParticipantePrincipalComponent implements OnInit {
  /*INPUT RECIBEN*/

  /*MODALES*/
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;

  /*VARIABLES*/
  public codigo: number;
  public institucion: any;
  public codigoSede = null;
  public identificacion: string;
  public codCategoria: number;
  public codSubcategoria: number;
  public codInstancia: number;
  public desCategoria: string;
  public desSubcategoria: string;
  public desInstancia: string;
  public habilitarAgregarParticipante: boolean;
  public displayNone: string = '';
  public disabledAcciones: boolean;

  /*LISTAS*/
  public listaParticipante: Participante[] = [];
  public listaPersona: Persona[] = [];
  public listaCategoria: Categoria[] = [];
  public listaSubcategoria: Subcategoria[] = [];
  public listaInstancia: Instancia[] = [];
  public listaEstadoCompetencia: EstadoCompetencia[] = [];

  /*TABS*/
  public selectedTab: number;

  /*OBJETOS*/
  private currentUser: LoginAplicacion;
  private sede: Sede;

  /*DETAIL*/
  public showDetail: boolean;

  /*PAGINACION*/
  public page: number;
  public itemsRegistros: number;

  /*OBJETOS*/
  public participanteSeleccionado: Participante;
  public participante: Participante;

  /*FORMULARIOS*/
  public formParticipante: FormGroup;
  public formParticipanteParametro: FormGroup;

  /*CONSTRUCTOR */
  constructor(
    /*Servicios*/
    private readonly participanteService: ParticipanteService,
    private readonly personaService: PersonaService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
  ) {
    this.codigo = 0;
    this.codigoSede = 0;
    this.itemsRegistros = 5;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.sede = this.currentUser.sede;
    this.habilitarAgregarParticipante = true;
  }

  ngOnInit() {
    this.formParticipanteParametro = this.formBuilder.group({
      codCategoria: new FormControl('', Validators.required),
      codSubcategoria: new FormControl('', Validators.required),
      codInstancia: new FormControl('', Validators.required),
      identificacion: new FormControl(''),
    })
    this.listarCategoriaActivo();
    this.listarEstadoCompetenciaActivo();
    if (this.currentUser.cedula == "Suscriptor") {
      this.disabledAcciones = true;
      this.displayNone = 'none';
      this.listarParticipantePorEmail();
    }
  }

  cargarParticipantes() {
    this.confirmarCargarParticipantes();
  }

  listarEstadoCompetenciaActivo() {
    this.participanteService.listarEstadoCompetenciaActivo().subscribe(
      (respuesta) => {
        this.listaEstadoCompetencia = respuesta['listado'];
      }
    )
  }

  listarCategoriaActivo() {
    this.participanteService.listarCategoriaActivo().subscribe(
      (respuesta) => {
        this.listaCategoria = respuesta['listado'];
      }
    )
  }

  listarSubcategoriaPorCategoria() {
    this.habilitarAgregarParticipante = true;
    this.listaParticipante = [];
    // Receptar la descripción de formParticipanteParametro.value
    let participanteParametroTemp = this.formParticipanteParametro.value;
    this.codCategoria = participanteParametroTemp?.codCategoria;
    this.buscarCategoriaPorCodigo();
    this.participanteService.listarSubcategoriaPorCategoria(this.codCategoria).subscribe(
      (respuesta) => {
        this.listaSubcategoria = respuesta['listado'];
      }
    )
  }

  buscarCategoriaPorCodigo() {
    this.participanteService.buscarCategoriaPorCodigo(this.codCategoria).subscribe(
      (respuesta) => {
        this.desCategoria = respuesta['objeto']?.denominacion;
      }
    )
  }

  listarInstanciaActivo() {
    this.habilitarAgregarParticipante = true;
    this.listaParticipante = [];
    // Receptar codCategoria de formParticipanteParametro.value
    let participanteParametroTemp = this.formParticipanteParametro.value;
    this.codSubcategoria = participanteParametroTemp?.codSubcategoria;
    this.buscarSubcategoriaPorCodigo();
    this.participanteService.listarInstanciaActivo().subscribe(
      (respuesta) => {
        this.listaInstancia = respuesta['listado'];
      }
    )
  }

  buscarInstanciaPorCodigo() {
    this.participanteService.buscarInstanciaPorCodigo(this.codInstancia).subscribe(
      (respuesta) => {
        this.desInstancia = respuesta['objeto']?.denominacion;
      }
    )
  }

  buscarSubcategoriaPorCodigo() {
    this.participanteService.buscarSubcategoriaPorCodigo(this.codSubcategoria).subscribe(
      (respuesta) => {
        this.desSubcategoria = respuesta['objeto']?.denominacion;
        this.codCategoria = respuesta['objeto']?.codCategoria;
        this.buscarCategoriaPorCodigo();
      }
    )
  }

  listarParticipanteGeneral() {
    if (this.currentUser.cedula == "Suscriptor") {
      this.listarParticipantePorEmail();
    } else {
      this.listarParticipantePorSubcategoriaInstancia();
    }
  }

  listarParticipantePorEmail() {
    // Receptar la codSubcategoria y codInstancia de formParticipanteParametro.value
    let participanteParametroTemp = this.formParticipanteParametro.value;
    this.codSubcategoria = participanteParametroTemp?.codSubcategoria;
    this.codInstancia = participanteParametroTemp?.codInstancia;
    this.habilitarAgregarParticipante = true;
    this.participanteService.listarParticipantePorEmail(this.currentUser.identificacion).subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        if (this.listaParticipante.length > 0) {
          this.habilitarAgregarParticipante = false;
          for (const ele of this.listaParticipante) {
            if (ele.identificacion == this.currentUser.identificacion) {
              ele.desCategoria = "DIRECTOR";
              ele.desSubcategoria = "ACADEMIA";
            }
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          }
        }
        console.log("", this.listaParticipante)
      }
    );
  }

  listarParticipantePorSubcategoriaInstancia() {
    // Receptar la descripción de formParticipanteParametro.value
    let participanteParametroTemp = this.formParticipanteParametro.value;
    this.codSubcategoria = participanteParametroTemp?.codSubcategoria;
    this.codInstancia = participanteParametroTemp?.codInstancia;
    this.buscarInstanciaPorCodigo();
    this.habilitarAgregarParticipante = false;
    this.participanteService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, 0).subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        for (const ele of this.listaParticipante) {
          ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
        }
      }
    );
  }

  cambiarEstado(participante: Participante) {
    switch (participante?.codEstadoCompetencia) {
      case 1: {
        participante.codEstadoCompetencia = 2;
        this.participante = participante;
        this.addRegistroParticipante();
        break;
      }
      case 2: {
        participante.codEstadoCompetencia = 3;
        this.participante = participante;
        this.addRegistroParticipante();
        break;
      }
      case 3: {
        participante.codEstadoCompetencia = 4;
        this.participante = participante;
        this.addRegistroParticipante();
        break;
      }
      case 4: {
        participante.codEstadoCompetencia = 5;
        this.participante = participante;
        this.addRegistroParticipante();
        break;
      }
      case 5: {
        //participante.codEstadoCompetencia = 4;
        this.mensajeService.mensajeError('Su participación ha sido completada...');
        break;
      }
      default: {
        //participante.codEstadoCompetencia = 1;
        this.mensajeService.mensajeError('Defina un estado para el participante...');
        break;
      }
    }
  }

  addRegistroParticipante() {
    this.participante.dateLastActive = dayjs(this.participante?.dateLastActive).format("YYYY-MM-DD HH:mm:ss.SSS")
    this.participanteService.guardarParticipante(this.participante).subscribe({
      next: (response) => {
        this.listarParticipantePorSubcategoriaInstancia();
        this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
      },
      error: (error) => {
        this.listarParticipantePorSubcategoriaInstancia();
        this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
      }
    });
  }

  listarParticipanteActivoActualizada(event) {
    this.listaParticipante = event;
  }

  openDetail(codjornada) {
    this.showDetail = true;
  }

  openEditarDetail(participante: Participante) {
    this.participanteSeleccionado = participante;
    this.showDetail = true;
  }

  openRemoverDetail(persona: Persona) {
    Swal
      .fire({
        title: "Eliminar Registro",
        text: "¿Quieres borrar el registro?'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })
      .then(resultado => {
        if (resultado.value) {
          // Hicieron click en "Sí, eliminar"
          this.participanteService.eliminarParticipantePorId(persona.codigo).subscribe({
            next: (response) => {
              this.mensajeService.mensajeCorrecto('El registro ha sido borrada con éxito...');
            },
            error: (error) => {
              this.mensajeService.mensajeError('Ha habido un problema al borrar el registro...');
            }
          });
        } else {
          // Hicieron click en "Cancelar"
          console.log("*Se cancela el proceso...*");
        }
      });
  }

  confirmarCargarParticipantes() {
    Swal
      .fire({
        title: "Cargar Participantes",
        text: "¿Quieres cargar los participantes?'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "Sí, cargar",
        cancelButtonText: "Cancelar",
      })
      .then(resultado => {
        if (resultado.value) {
          // Hicieron click en "Sí, eliminar"
          this.participanteService.migrarClienteWP().subscribe({
            next: (response) => {
              this.mensajeService.mensajeCorrecto('Se ha cargado los participantes...');
            },
            error: (error) => {
              this.mensajeService.mensajeError('Ha habido un problema al cargar los participantes...');
            }
          });
        } else {
          // Hicieron click en "Cancelar"
          console.log("*Se cancela el proceso...*");
        }
      });
  }

  closeDetail($event) {
    this.showDetail = $event;
    this.participanteSeleccionado = null;
  }

  // Contar los caracteres de la cedula para activar boton <Buscar>
  onKey(event) {
    if (event.target.value.length != 10) {
      this.resetTheForm();
    } else {
    }
  }

  resetTheForm(): void {
    this.listaPersona = null;
  }

  validateFormat(event) {
    let key;
    if (event.type === 'paste') {
      key = event.clipboardData.getData('text/plain');
    } else {
      key = event.keyCode;
      key = String.fromCharCode(key);
    }

    const regex = /[0-9]/;

    if (!regex.test(key)) {
      event.returnValue = false;
      if (event.preventDefault) {
        event.preventDefault();
      }
    }
  }

  compararCategoria(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }

  compararSubcategoria(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }

  compararInstancia(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }

  /* Variables del html, para receptar datos y validaciones*/
  get identificacionField() {
    return this.formParticipanteParametro.get('identificacion');
  }
  get codCategoriaField() {
    return this.formParticipanteParametro.get('codCategoria');
  }
  get codSubcategoriaField() {
    return this.formParticipanteParametro.get('codSubcategoria');
  }
  get codInstanciaField() {
    return this.formParticipanteParametro.get('codInstancia');
  }

}
