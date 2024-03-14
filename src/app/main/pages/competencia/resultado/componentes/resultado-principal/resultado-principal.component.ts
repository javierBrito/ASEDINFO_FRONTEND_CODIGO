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

  /*LISTAS*/
  public listaPuntajeTotal: Puntaje[] = [];
  public listaParticipante: Participante[] = [];
  public listaCategoria: any[];
  public listaSubcategoria: any[];
  public listaInstancia: any[];

  /*TABS*/
  public selectedTab: number;

  /*OBJETOS*/
  private currentUser: LoginAplicacion;
  public parametro: Parametro;
  public operacion: Operacion;
  public reporteDTO: ReporteDTO;
  public puntajeAux: Puntaje;
  public participante: Participante;
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
  public formResultadoParametro: FormGroup;

  /*CONSTRUCTOR */
  constructor(
    /*Servicios*/
    private readonly resultadoService: ResultadoService,
    private readonly participanteService: ParticipanteService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder
  ) {
    this.itemsRegistros = 10;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
    this.formResultadoParametro = this.formBuilder.group({
      codCategoria: new FormControl('', Validators.required),
      codSubcategoria: new FormControl('', Validators.required),
      codInstancia: new FormControl('', Validators.required),
    });
    this.listarCategoriaActivo();
  }

  cargarInstancia() {
    this.confirmarCargarInstancia();
  }

  confirmarCargarInstancia() {
    Swal
      .fire({
        title: "Cargar Instancia",
        text: "¿Quieres cargar la siguiente Instancia de la Competencia?'",
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
      for (let participante of this.listaParticipante) {
        participante.codigo = 0;
        participante.codInstancia = participante?.codInstancia + 1;
        participante.codEstadoCompetencia = 3;
        participante.numParticipante = 0;
        participante.numPuntajeJuez = 0;
        this.participanteService.guardarParticipante(participante).subscribe({
          next: (response) => {
            this.mensajeService.mensajeCorrecto('Se ha creado el registro correctamente...');
          },
          error: (error) => {
            this.mensajeService.mensajeError('Ha habido un problema al crear el registro...');
          }
        });
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
    // Receptar codCategoria, codSubcategoria y codInstancia de formResultadoParametro.value
    let resultadoParametroTemp = this.formResultadoParametro.value;
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
    // Receptar codCategoria de formResultadoParametro.value
    let puntajeParametroTemp = this.formResultadoParametro.value;
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
    // Receptar la descripción de formResultadoParametro.value
    let resultadoParametroTemp = this.formResultadoParametro.value;
    this.codSubcategoria = resultadoParametroTemp?.codSubcategoria;
    this.codInstancia = resultadoParametroTemp?.codInstancia;
    this.buscarInstanciaPorCodigo();

    await new Promise((resolve, rejects) => {
      this.resultadoService.listarPuntajePorSubcategoriaInstanciaRegSUMA(this.codSubcategoria, this.codInstancia).subscribe({
        next: async (respuesta) => {
          this.listaPuntajeTotal = respuesta['listado'];
          // Ordenar lista por puntaje
          this.listaPuntajeTotal.sort((firstItem, secondItem) => secondItem.puntaje - firstItem.puntaje);
          // Obtener los participantes para luego clonar
          this.participanteService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, 5).subscribe(
            (respuesta) => {
              this.listaParticipante = respuesta['listado'];
            }
          )
          resolve("OK");
        }, error: (error) => {
          console.log(error);
          rejects("Error");
        }
      });
    });
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
    return this.formResultadoParametro.get('codCategoria');
  }
  get codSubcategoriaField() {
    return this.formResultadoParametro.get('codSubcategoria');
  }
  get codInstanciaField() {
    return this.formResultadoParametro.get('codInstancia');
  }

}
