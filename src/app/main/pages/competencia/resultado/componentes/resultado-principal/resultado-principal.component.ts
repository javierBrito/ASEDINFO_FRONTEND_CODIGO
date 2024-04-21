import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { ResultadoService } from '../../servicios/resultado.service';
import { Operacion } from 'app/main/pages/compartidos/modelos/Operacion';
import { ReporteDTO } from 'app/main/pages/compartidos/modelos/ReporteDTO.model';
import { Parametro } from 'app/main/pages/compartidos/modelos/Parametro';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { Puntaje } from 'app/main/pages/compartidos/modelos/Puntaje';
import { ParticipanteService } from '../../../participante/servicios/participante.service';
import dayjs from 'dayjs';
import moment from 'moment';
import { PuntajeService } from '../../../puntaje/servicios/puntaje.service';
import { PuntajeAux } from 'app/main/pages/compartidos/modelos/PuntajeAux';


@Component({
  selector: 'app-resultado-principal',
  templateUrl: './resultado-principal.component.html',
  styleUrls: ['./resultado-principal.component.scss']
})
export class ResultadoPrincipalComponent implements OnInit {
  /*INPUT RECIBEN*/
  @Input() listaResultadoChild: any;

  /*MODALES*/
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;

  /*VARIABLES*/
  public codCategoria: number;
  public codSubcategoria: number;
  public codInstancia: number;
  public datosEditar: any;
  public desCategoria: string;
  public desSubcategoria: string;
  public desInstancia: string;
  public pathImagenTrofeo: string;
  public dateLastActive: string;
  public displayNone: string = "";

  /*LISTAS*/
  public listaPuntajeTotal: any[] = [];
  public listaPuntajeTotalAux: any[] = [];
  public listaParticipante: any[] = [];
  public listaParticipanteAux: any[] = [];
  public listaCategoria: any[];
  public listaSubcategoria: any[];
  public listaInstancia: any[];
  public listaModeloPuntaje = [];
  public listaPuntaje: Puntaje[] = [];
  public listaPuntajeAux: Puntaje[] = [];

  /*TABS*/
  public selectedTab: number;

  /*OBJETOS*/
  private currentUser: LoginAplicacion;
  public parametro: Parametro;
  public operacion: Operacion;
  public reporteDTO: ReporteDTO;
  public puntajeAux: Puntaje;
  public participante: any;
  public puntajeAuxTotal: any = null;

  /*DETAIL*/
  public showDetail: boolean;

  /*PAGINACION*/
  public page: number;
  public itemsRegistros: number;

  /*OBJETOS*/
  public puntajeSeleccionado: Puntaje;

  /*FORMULARIOS*/
  public formResultado: FormGroup;

  /*CONSTRUCTOR */
  constructor(
    /*Servicios*/
    private readonly resultadoService: ResultadoService,
    private readonly participanteService: ParticipanteService,
    private readonly puntajeService: PuntajeService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder
  ) {
    this.itemsRegistros = 10;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.pathImagenTrofeo = "./assets/images/trofeo/trofeo";
  }

  ngOnInit() {
    this.formResultado = this.formBuilder.group({
      codCategoria: new FormControl('', Validators.required),
      codSubcategoria: new FormControl('', Validators.required),
      codInstancia: new FormControl('', Validators.required),
      dateLastActive: new FormControl(dayjs(new Date()).format("YYYY-MM-DD HH:mm")),
      numParticipante: new FormControl(''),
    });
    this.listarCategoriaActivo();
    if (this.currentUser.cedula == "Resultado") {
      this.displayNone = 'none';
    } else {
      this.displayNone = '';
    }
    this.listarModeloPuntajeActivo();
  }

  listarModeloPuntajeActivo() {
    this.listaModeloPuntaje = [];
    this.puntajeService.listarModeloPuntajeActivo().subscribe(
      (respuesta) => {
        this.listaModeloPuntaje = respuesta['listado'];
      }
    )
  }

  confirmarCargarInstancia() {
    Swal
      .fire({
        title: "Cargar Instancia",
        text: "¿Quieres cargar siguiente Instancia?'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "Sí, cargar",
        cancelButtonText: "Cancelar",
      })
      .then(resultado => {
        if (resultado.value) {
          // Hicieron click en "Sí, cargar"
          // Crear participantes con la nueva instancia
          this.crearParticipantes();
        } else {
          // Hicieron click en "Cancelar"
          console.log("*Se cancela el proceso...*");
        }
      });
  }

  crearParticipantes() {
    if (this.listaParticipante.length > 0) {
      let formSorteoTemp = this.formResultado.value;
      let numParticipante: number = 0;
      if (formSorteoTemp?.numParticipante != "" || formSorteoTemp?.numParticipante != undefined) {
        numParticipante = formSorteoTemp?.numParticipante;
      }
      this.dateLastActive = formSorteoTemp?.dateLastActive;
      // Tiempo a sumar en minutos
      let tiempo = "00:03";
      let fechaASumar: any;

      let indice = 0;
      for (let participante of this.listaParticipante) {
        indice += 1;
        participante.codigo = 0;
        participante.codInstancia = participante?.codInstancia + 1;
        participante.codEstadoCompetencia = 3;
        participante.numParticipante = indice;
        participante.numPuntajeJuez = 0;
        // Cuando ingresan fecha/hora competencia y numero participante
        if (numParticipante > 0) {
          numParticipante += 1;
          participante.numParticipante = numParticipante;
        }
        fechaASumar = moment(this.dateLastActive);
        participante.dateLastActive = (fechaASumar.add(moment.duration(tiempo))).format('yyyy-MM-DD HH:mm:ss.SSS');
        this.dateLastActive = participante?.dateLastActive;
        this.participanteService.guardarParticipante(participante).subscribe({
          next: (response) => {
            //this.mensajeService.mensajeCorrecto('Se ha creado el registro correctamente...');
          },
          error: (error) => {
            this.mensajeService.mensajeError('Ha habido un problema al crear el registro...');
            return;
          }
        });
        if (indice >= 5) {
          this.mensajeService.mensajeCorrecto('Se han creado los 5 registro correctamente...');
          break;
        }
      }
    }
  }

  listarCategoriaActivo() {
    this.resultadoService.listarCategoriaActivo().subscribe(
      (respuesta) => {
        this.listaCategoria = respuesta['listado'];
      }
    )
  }

  listarSubcategoriaPorCategoria() {
    this.listaParticipante = [];
    this.listaPuntajeTotal = [];
    // Receptar codCategoria, codSubcategoria y codInstancia de formResultado.value
    let resultadoParametroTemp = this.formResultado.value;
    this.codCategoria = resultadoParametroTemp?.codCategoria;
    this.buscarCategoriaPorCodigo();
    this.resultadoService.listarSubcategoriaPorCategoria(this.codCategoria).subscribe(
      (respuesta) => {
        this.listaSubcategoria = respuesta['listado'];
      }
    )
  }

  buscarCategoriaPorCodigo() {
    this.resultadoService.buscarCategoriaPorCodigo(this.codCategoria).subscribe(
      (respuesta) => {
        this.desCategoria = respuesta['objeto']?.denominacion;
      }
    )
  }

  buscarSubcategoriaPorCodigo() {
    this.resultadoService.buscarSubcategoriaPorCodigo(this.codSubcategoria).subscribe(
      (respuesta) => {
        this.desSubcategoria = respuesta['objeto']?.denominacion;
      }
    )
  }

  buscarInstanciaPorCodigo() {
    this.resultadoService.buscarInstanciaPorCodigo(this.codInstancia).subscribe(
      (respuesta) => {
        this.desInstancia = respuesta['objeto']?.denominacion;
      }
    )
  }

  listarInstanciaActivo() {
    this.listaParticipante = [];
    this.listaPuntajeTotal = [];
    // Receptar codCategoria de formResultado.value
    let puntajeParametroTemp = this.formResultado.value;
    this.codSubcategoria = puntajeParametroTemp?.codSubcategoria;
    this.buscarSubcategoriaPorCodigo();
    this.resultadoService.listarInstanciaActivo().subscribe(
      (respuesta) => {
        this.listaInstancia = respuesta['listado'];
      }
    )
  }

  async listarPuntajeTotalPorParticipante() {
    this.listaParticipante = [];
    this.listaPuntajeTotal = [];
    this.listaParticipanteAux = [];
    this.listaPuntajeTotalAux = [];
    // Receptar la descripción de formResultado.value
    let resultadoParametroTemp = this.formResultado.value;
    this.codSubcategoria = resultadoParametroTemp?.codSubcategoria;
    this.codInstancia = resultadoParametroTemp?.codInstancia;
    this.buscarInstanciaPorCodigo();

    await new Promise((resolve, rejects) => {
      this.resultadoService.listarPuntajePorSubcategoriaInstanciaRegSUMA(this.codSubcategoria, this.codInstancia).subscribe({
        next: async (respuesta) => {
          this.listaPuntajeTotal = respuesta['listado'];
          if (this.listaPuntajeTotal.length < this.itemsRegistros) {
            this.page = 1;
          }
          // Ordenar lista por puntaje
          this.listaPuntajeTotal.sort((firstItem, secondItem) => secondItem.puntaje - firstItem.puntaje);
          let indice = 0;
          for (let ele of this.listaPuntajeTotal) {
            indice += 1;
            // Asignar trofeo por posición
            if (indice >= 1 && indice <= 3) {
              ele.pathImagenTrofeo = this.pathImagenTrofeo + indice + ".png";
            }
            if (indice >= 1 && indice <= 20) {
              ele.estado = this.numeroOrden(indice);
            }
            if (indice >= 1 && indice <= 5) {
              this.listaPuntajeTotalAux.push(ele);
            }
            this.puntajeService.listarPuntajePorParticipanteSubcategoriaInstanciaCriterios(ele.codParticipante, ele.codSubcategoria, ele.codInstancia).subscribe(
              (respuesta) => {
                let listaPuntajes: PuntajeAux[] = [];
                let listaPuntajesConsulta: PuntajeAux[] = respuesta['listado'];
                for (const modelo of this.listaModeloPuntaje) {
                  let auxBusqueda = listaPuntajesConsulta.find(obj => obj.codModeloPuntaje == modelo.codigo)
                  if (auxBusqueda) {
                    auxBusqueda.porcentaje = modelo.porcentaje;
                    listaPuntajes.push(auxBusqueda)
                  } else {
                    let nuevoPuntajeAux = new PuntajeAux();
                    nuevoPuntajeAux = {
                      codigo: 0,
                      estado: 'A',
                      puntaje: 0,
                      codParticipante: ele?.codParticipante,
                      codInstancia: this.codInstancia,
                      codSubcategoria: this.codSubcategoria,
                      codModeloPuntaje: modelo?.codigo,
                      porcentaje: modelo?.porcentaje,
                      nombreParticipante: ele.nombreParticipante,
                      codUsuarioJuez: 0,
                    }
                    listaPuntajes.push(nuevoPuntajeAux)
                  }
                }
                ele.listaPuntajes = listaPuntajes;
              }
            )
          }
          await this.obtenerListaParticipante();
          resolve("OK");
        }, error: (error) => {
          console.log(error);
          rejects("Error");
        }
      });
    });
  }

  async obtenerListaParticipante() {
    this.listaParticipante = [];
    return new Promise((resolve, rejects) => {
      for (let ele of this.listaPuntajeTotalAux) {
        this.participanteService.buscarParticipantePorCodigo(ele?.codParticipante).subscribe(
          (respuesta) => {
            this.participante = respuesta['objeto'];
            this.participante.numPuntajeJuez = ele?.puntaje;
            this.listaParticipante.push(this.participante);
          }
        )
      }
      this.listaParticipante.sort((a, b) => (a.numPuntajeJuez < b.numPuntajeJuez ? -1 : 1));
    })
  }

  numeroOrden(indice: number): string {
    switch (indice) {
      case 1:
        return "Primero";
      case 2:
        return "Segundo";
      case 3:
        return "Tercero";
      case 4:
        return "Cuarto";
      case 5:
        return "Quinto";
      case 6:
        return "Sexto";
      case 7:
        return "Septimo";
      case 8:
        return "Octavo";
      case 9:
        return "Noveno";
      case 10:
        return "Décimo";
      case 11:
        return "Un Décimo";
      case 12:
        return "Duo Décimo";
      case 13:
        return "Décimo Tercero";
      case 14:
        return "Décimo Cuarto";
      case 15:
        return "Décimo Quinto";
      case 16:
        return "Décimo Sexto";
      case 17:
        return "Décimo Séptimo";
      case 18:
        return "Décimo Octavo";
      case 19:
        return "Décimo Noveno";
      case 20:
        return "Vigésimo";
      default:
        //console.log(httpEvent);
        break;
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

  closeDetail($event) {
    this.showDetail = $event;
    this.puntajeSeleccionado = null;
  }

  /* Variables del html, para receptar datos y validaciones*/
  get codCategoriaField() {
    return this.formResultado.get('codCategoria');
  }
  get codSubcategoriaField() {
    return this.formResultado.get('codSubcategoria');
  }
  get codInstanciaField() {
    return this.formResultado.get('codInstancia');
  }
  get dateLastActiveField() {
    return this.formResultado.get('dateLastActive');
  }
  get numParticipanteField() {
    return this.formResultado.get('numParticipante');
  }

}
