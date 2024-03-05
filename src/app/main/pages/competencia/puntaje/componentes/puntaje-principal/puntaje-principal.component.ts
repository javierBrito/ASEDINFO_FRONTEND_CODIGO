import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { PuntajeService } from '../../servicios/puntaje.service';
import { Aplicacion } from 'app/main/pages/compartidos/modelos/Aplicacion';
import dayjs from "dayjs";
import { Modulo } from 'app/main/pages/compartidos/modelos/Modulo';
import { Operacion } from 'app/main/pages/compartidos/modelos/Operacion';
import { ReporteDTO } from 'app/main/pages/compartidos/modelos/ReporteDTO.model';
import { ajax } from 'jquery';
import { Parametro } from 'app/main/pages/compartidos/modelos/Parametro';
import { Puntaje } from 'app/main/pages/compartidos/modelos/Puntaje';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { PuntajeAux } from 'app/main/pages/compartidos/modelos/PuntajeAux';
import { ParticipanteService } from '../../../participante/servicios/participante.service';

@Component({
  selector: 'app-puntaje-principal',
  templateUrl: './puntaje-principal.component.html',
  styleUrls: ['./puntaje-principal.component.scss']
})
export class PuntajePrincipalComponent implements OnInit {
  /*INPUT RECIBEN*/
  @Input() listaPuntajeChild: any;

  /*MODALES*/
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;

  /*VARIABLES*/
  public codigo: number;
  public institucion: any;
  public colorFila: string;
  public celularEnvioWhatsapp: string;
  public codigoPostal: string = '593';
  public descripcionProducto: string;
  public mensaje: string;
  public fechaFinMensaje: string;
  public nombreCliente: string;
  public enviarNotificacion: boolean;
  public seEnvioWhatsapp: boolean;
  public respuestaEnvioWhatsapp: string;
  public token: string;
  public celular: string;
  public codCategoria: number;
  public codSubcategoria: number;
  public codInstancia: number;
  public idInput = '';
  public indexSelec = '';
  public datosEditar: any;
  public activarInput = false;
  public continuarGuardarPendiente: boolean;
  public codPuntaje: number = 0;
  public displayNone: string = '';
  public desCategoria: string;
  public desSubcategoria: string;
  public desInstancia: string;
  public codEstadoCompetencia: number;
  public nombreUsuario: string;
  public siActualizaNumJuez: boolean = false;

  /*LISTAS*/
  public listaPuntaje: Puntaje[] = [];
  public listaPuntajeAux: Puntaje[] = [];
  public listaAplicacion: Aplicacion[] = [];
  public listaPeriodoRegAniLec: any[];
  public listaCategoria: any[];
  public listaSubcategoria: any[];
  public listaInstancia: any[];
  public listaModeloPuntaje: any[];
  public listaModeloPuntajeAux: any[];
  public listaParticipante: any[];
  public listaParticipantePresentacion: any[] = [];
  public listaUsuarioModeloPuntaje: any[];

  /*TABS*/
  public selectedTab: number;

  /*OBJETOS*/
  private currentUser: LoginAplicacion;
  private sede: Sede;
  public modulo: Modulo;
  public parametro: Parametro;
  public operacion: Operacion;
  public reporteDTO: ReporteDTO;
  public puntajeAux: Puntaje;
  public puntajeAuxTotal: any = null;
  public participante: Participante;
  public participanteAux: Participante;

  /*DETAIL*/
  public showDetail: boolean;

  /*PAGINACION*/
  public page: number;
  public itemsRegistros: number;

  /*OBJETOS*/
  public puntajeSeleccionado: Puntaje;

  /*FORMULARIOS*/
  public formPuntaje: FormGroup;
  public formPuntajeParametro: FormGroup;

  /*CONSTRUCTOR */
  constructor(
    /*Servicios*/
    private readonly puntajeService: PuntajeService,
    private readonly participanteService: ParticipanteService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder
  ) {
    this.codigo = 0;
    this.itemsRegistros = 5;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.nombreUsuario = this.currentUser.nombre;
    this.sede = this.currentUser.sede;
  }

  async ngOnInit() {
    if (this.listaPuntajeChild != null) {
      this.listaPuntaje = this.listaPuntajeChild;
    }
    this.formPuntajeParametro = this.formBuilder.group({
      codCategoria: new FormControl('', Validators.required),
      codSubcategoria: new FormControl('', Validators.required),
      codInstancia: new FormControl('', Validators.required),
    });
    this.listarModeloPuntajeActivo();
    this.listarCategoriaActivo();
    if (this.currentUser.cedula == 'JUEZ') {
      this.displayNone = 'none';
      //this.obtenerParametros();
      this.listarPuntajePorParticipante();
    }
  }

  obtenerParametros() {
    // Obtener codSubcategoria y codInstancia
    this.puntajeService.buscarParametroPorNemonico('SUBCATEGORIA').subscribe(
      (respuesta) => {
        this.parametro = respuesta['objeto'];
        this.codSubcategoria = this.parametro?.valor;
        if (this.codSubcategoria == undefined || this.codSubcategoria == 0) {
          this.mensajeService.mensajeError('Ingrese parámetros de SUBCATEGORÍA E INSTANCIA, para ingreso de puntaje..');
        }
        // Obtener la denominación de la subcategoria
        this.buscarSubcategoriaPorCodigo();
        // Obtener codInstancia para obtener el participante
        this.puntajeService.buscarParametroPorNemonico('INSTANCIA').subscribe(
          (respuesta) => {
            this.parametro = respuesta['objeto'];
            this.codInstancia = this.parametro?.valor;
            if (this.codInstancia == undefined || this.codInstancia == 0) {
              this.mensajeService.mensajeError('Ingrese parámetros de SUBCATEGORÍA E INSTANCIA, para ingreso de puntaje..');
            }
            // Obtener la denominación de la instancia
            this.buscarInstanciaPorCodigo();
            this.listarPuntajePorParticipante();
          }
        )
      }
    )
  }

  listarModeloPuntajeActivo() {
    this.listaModeloPuntaje = [];
    this.puntajeService.listarModeloPuntajeActivo().subscribe(
      (respuesta) => {
        this.listaModeloPuntajeAux = respuesta['listado'];
        console.log("this.listaModeloPuntajeAux = ", this.listaModeloPuntajeAux)
        this.puntajeService.listarUsuarioModeloPuntajePorUsuario(this.currentUser?.codigoUsuario).subscribe(
          (respuesta) => {
            this.listaUsuarioModeloPuntaje = respuesta['listado'];
            console.log("this.listaUsuarioModeloPuntaje = ", this.listaUsuarioModeloPuntaje)
            if (this.listaUsuarioModeloPuntaje.length > 0) {
              for (const ele of this.listaModeloPuntajeAux) {
                ele.asignado = false;
                for (const ele1 of this.listaUsuarioModeloPuntaje) {
                  if (ele?.codigo == ele1?.codModeloPuntaje) {
                    ele.asignado = true;
                    this.listaModeloPuntaje.push(ele);
                  }
                }
              }
            }
          }
        )
        console.log("this.listaModeloPuntaje = ", this.listaModeloPuntaje)
      }
    )
  }

  listarCategoriaActivo() {
    this.puntajeService.listarCategoriaActivo().subscribe(
      (respuesta) => {
        this.listaCategoria = respuesta['listado'];
      }
    )
  }

  listarSubcategoriaPorCategoria() {
    this.listaParticipantePresentacion = [];
    // Receptar codCategoria de formPuntajeParametro.value
    let puntajeParametroTemp = this.formPuntajeParametro.value;
    this.codCategoria = puntajeParametroTemp?.codCategoria;
    this.buscarCategoriaPorCodigo();
    this.puntajeService.listarSubcategoriaPorCategoria(this.codCategoria).subscribe(
      (respuesta) => {
        this.listaSubcategoria = respuesta['listado'];
      }
    )
  }

  async actualizarNumPuntajeJuez(codParticipante: number) {
    return new Promise((resolve, rejects) => {
      this.participanteService.buscarParticipantePorCodigo(codParticipante).subscribe({
        next: (respuesta) => {
          this.participanteAux = respuesta['objeto'];
          this.participanteAux.numPuntajeJuez = this.participanteAux?.numPuntajeJuez + 1;
          // Verificar si ya han puntuado los JUECES jbrito-20240223
          if (this.participanteAux.numPuntajeJuez == 3) {
            // Cambiar el estado de la competencia a Completado
            this.participanteAux.codEstadoCompetencia = 5;
          }
          this.participanteService.guardarParticipante(this.participanteAux).subscribe({
            next: (response) => {
              this.listarPuntajePorParticipante();
              this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
            },
            error: (error) => {
              this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
            }
          });
          resolve(respuesta);
        }, error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          rejects("Error");
        }
      })
    });
  }

  buscarCategoriaPorCodigo() {
    this.puntajeService.buscarCategoriaPorCodigo(this.codCategoria).subscribe(
      (respuesta) => {
        this.desCategoria = respuesta['objeto']?.denominacion;
      }
    )
  }

  buscarSubcategoriaPorCodigo() {
    this.puntajeService.buscarSubcategoriaPorCodigo(this.codSubcategoria).subscribe(
      (respuesta) => {
        this.desSubcategoria = respuesta['objeto']?.denominacion;
        this.codCategoria = respuesta['objeto']?.codCategoria;
        this.buscarCategoriaPorCodigo();
      }
    )
  }

  listarInstanciaActivo() {
    // Receptar codCategoria de formPuntajeParametro.value
    let puntajeParametroTemp = this.formPuntajeParametro.value;
    this.codSubcategoria = puntajeParametroTemp?.codSubcategoria;
    this.buscarSubcategoriaPorCodigo();
    this.listaParticipantePresentacion = [];
    this.puntajeService.listarInstanciaActivo().subscribe(
      (respuesta) => {
        this.listaInstancia = respuesta['listado'];
      }
    )
  }

  buscarInstanciaPorCodigo() {
    this.puntajeService.buscarInstanciaPorCodigo(this.codInstancia).subscribe(
      (respuesta) => {
        this.desInstancia = respuesta['objeto']?.denominacion;
      }
    )
  }

  async listarPuntajePorParticipante() {
    this.listaParticipantePresentacion = [];

    if (this.currentUser.cedula != 'JUEZ') {
      // Receptar codCategoria, codSubcategoria y codInstancia de formPuntajeParametro.value
      let puntajeParametroTemp = this.formPuntajeParametro.value;
      this.codSubcategoria = puntajeParametroTemp?.codSubcategoria;
      this.codInstancia = puntajeParametroTemp?.codInstancia;
      this.buscarInstanciaPorCodigo();
      this.codEstadoCompetencia = 0;
    } else {
      // Estado de Competencia "En Escenario"
      this.codEstadoCompetencia = 4;
    }

    if (this.activarInput) {
      this.editarPuntaje(this.participante, " ");
      return;
    }

    this.idInput = '';
    this.activarInput = false;

    await new Promise((resolve, rejects) => {
      //this.puntajeService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, this.codEstadoCompetencia).subscribe({
      this.puntajeService.listarParticipantePorEstadoCompetencia(this.codEstadoCompetencia).subscribe({
        next: async (respuesta) => {
          this.listaParticipantePresentacion = respuesta['listado'];
          for (const est of this.listaParticipantePresentacion) {
            await new Promise((resolve, rejects) => {
              this.puntajeService.listarPuntajePorParticipanteSubcategoriaInstancia(est.codigo, est.codSubcategoria, est.codInstancia, this.currentUser.codigoUsuario).subscribe({
                next: (respuesta) => {
                  let listPuntajes: PuntajeAux[] = [];
                  let listPuntajesConsulta: PuntajeAux[] = respuesta['listado'];
                  for (const modelo of this.listaModeloPuntaje) {
                    let auxBusqueda = listPuntajesConsulta.find(obj => obj.codModeloPuntaje == modelo.codigo)
                    if (auxBusqueda) {
                      auxBusqueda.porcentaje = modelo.porcentaje;
                      listPuntajes.push(auxBusqueda)
                    } else {
                      let nuevoPuntajeAux = new PuntajeAux();
                      nuevoPuntajeAux = {
                        codigo: 0,
                        estado: 'A',
                        puntaje: 0,
                        codParticipante: est?.codigo,
                        codInstancia: this.codInstancia,
                        codSubcategoria: this.codSubcategoria,
                        codModeloPuntaje: modelo?.codigo,
                        porcentaje: modelo?.porcentaje,
                        nombreParticipante: est?.nombreParticipante,
                        codUsuarioJuez: 0,
                      }
                      listPuntajes.push(nuevoPuntajeAux)
                    }
                  }
                  est.listaPuntajes = listPuntajes;
                  resolve("OK");
                }, error: (error) => {
                  console.log(error);
                  rejects("Error");
                }
              });
            });
          }
          resolve("OK");
        }, error: (error) => {
          console.log(error);
          rejects("Error");
        }
      });
    });
  }

  async guardarPuntajes(participante, indexSelec) {
    console.log("participante guardarPuntajes = ", participante)
    if (this.idInput === null) {
      // Guardar el primer registro en la misma fila
      this.guardarPuntaje(participante, indexSelec);
      this.datosEditar = null;
      return;
    }
    this.siActualizaNumJuez = true;
    if (this.idInput != indexSelec) {
      await this.verificarGuardarPendiente();
      if (this.continuarGuardarPendiente) {
        // Primero guardar los campos anteriores
        this.guardarPuntaje(participante, indexSelec);

        // Reseteamos variables
        this.idInput = null;
        this.datosEditar = null;
        this.activarInput = false;
      }
    } else {
      this.guardarPuntaje(participante, indexSelec);
      this.idInput = null;
      this.datosEditar = null;
      this.activarInput = false;
    }
  }

  async guardarPuntaje(participante, indexSelec) {
    console.log("participante guardarPuntaje = ", participante)
    let puntajeTotal = 0;
    let notaGuardada = 0;
    let errorGuardar = 0;
    for (let puntajeAux of participante.listaPuntajes) {
      puntajeAux.codSubcategoria = participante?.codSubcategoria
      puntajeAux.codInstancia = participante?.codInstancia
      this.codSubcategoria = participante?.codSubcategoria
      this.codInstancia = participante?.codInstancia
      console.log("puntajeAux = ", puntajeAux)
      if (puntajeAux?.puntaje > 0 &&
        puntajeAux?.puntaje <= 10 &&
        puntajeAux?.puntaje != 0) {
        if (puntajeAux?.codigo != 0) {
          //this.siActualizaNumJuez = false;
        }
        this.puntajeAuxTotal = puntajeAux;
        puntajeTotal = puntajeTotal + (puntajeAux?.porcentaje / 100) * Number(puntajeAux ? puntajeAux?.puntaje : 0);
        await new Promise((resolve, rejects) => {
          let puntaje = new Puntaje;
          console.log("puntajeAux 2 = ", puntajeAux)
          puntaje = this.moverDatosPuntaje(puntajeAux);
          console.log("puntaje 1 = ", puntaje)
          this.puntajeService.guardarPuntaje(puntaje).subscribe({
            next: (respuesta) => {
              puntaje.codigo = respuesta['objeto'].codigo;
              notaGuardada = notaGuardada + 1;
              resolve("OK");
            }, error: (error) => {
              this.mensajeService.mensajeError('Ha habido un problema al guardar el registro...' + error);
              puntajeTotal = 0;
              rejects("Error");
            }
          });
        });
      } else {
        errorGuardar = errorGuardar + 1;
        this.mensajeService.mensajeAdvertencia("El puntaje " + puntajeAux.puntaje + " no se encuentra en el rango de 1 a 10, vuelva a ingresar...  ");
        this.activarInput = false;
        break;
      }
    }
    if (errorGuardar == 0) {
      this.mensajeService.mensajeCorrecto('Se ha guardado las notas correctamente...');

      // Guardar el puntaje total de cada participante
      if (puntajeTotal > 0 && this.puntajeAuxTotal != null) {
        // Verificar si ya existe el total por participante, instancia y modelo puntaje = 99
        await this.verificarExistenciaRegistroTotal();
        this.puntajeAuxTotal.codigo = this.codPuntaje;
        this.puntajeAuxTotal.codModeloPuntaje = 99;
        this.puntajeAuxTotal.puntaje = puntajeTotal;
        this.puntajeAuxTotal.codUsuarioJuez = this.currentUser?.codigoUsuario;

        let puntajeTotalEntidad = new Puntaje;
        puntajeTotalEntidad = this.moverDatosPuntaje(this.puntajeAuxTotal);
        this.puntajeService.guardarPuntaje(puntajeTotalEntidad).subscribe({
          next: (response) => {
            if (this.siActualizaNumJuez) {
              this.actualizarNumPuntajeJuez(participante?.codigo);
            }
            this.mensajeService.mensajeCorrecto('Se ha actualizado el registro de totales correctamente...');
          },
          error: (error) => {
            this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro de totales...');
          }
        });
        this.activarInput = false;
      }
    }
    this.listarPuntajePorParticipante();
  }

  async verificarExistenciaRegistroTotal() {
    this.codPuntaje = 0;
    return new Promise((resolve, rejects) => {
      this.puntajeService.listarPuntajePorParticipanteRegTotal(this.puntajeAuxTotal.codParticipante, this.codSubcategoria, this.puntajeAuxTotal.codInstancia, this.currentUser.codigoUsuario, 99).subscribe({
        next: (respuesta) => {
          this.listaPuntajeAux = respuesta['listado'];
          if (this.listaPuntajeAux.length > 0) {
            this.codPuntaje = this.listaPuntajeAux[0].codigo;
          }
          resolve(respuesta);
        }, error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          rejects("Error");
        }
      })
    })
  }

  moverDatosPuntaje(puntajeAux: PuntajeAux): Puntaje {
    let puntaje = new Puntaje();
    puntaje = {
      codigo: puntajeAux?.codigo,
      estado: puntajeAux?.estado,
      puntaje: puntajeAux?.puntaje,
      codParticipante: puntajeAux?.codParticipante,
      codModeloPuntaje: puntajeAux?.codModeloPuntaje,
      codSubcategoria: puntajeAux?.codSubcategoria,
      codInstancia: puntajeAux?.codInstancia,
      nombreParticipante: puntajeAux?.nombreParticipante,
      codUsuarioJuez: this.currentUser.codigoUsuario,
    }

    return puntaje;
  }

  editarPuntaje = async (participante, indexSelec) => {
    this.participante = participante;
    this.indexSelec = indexSelec;
    if (!this.datosEditar) { this.datosEditar = participante; }
    if (this.activarInput && this.idInput != indexSelec) {
      await this.verificarGuardarPendiente();
      if (this.continuarGuardarPendiente) {
        // Hicieron click en "Sí, Guardar"
        this.guardarPuntaje(this.datosEditar, indexSelec);
        this.idInput = indexSelec;
        this.activarInput = false;
        this.datosEditar = null;
      } else {
        this.activarInput = false;
        this.listarPuntajePorParticipante();
      }
    } else {
      this.idInput = indexSelec;
      this.activarInput = true;
    }
  }

  async verificarGuardarPendiente() {
    this.continuarGuardarPendiente = false;
    await new Promise((resolve, rejects) => {
      Swal
        .fire({
          title: "Actualizar Registro",
          text: "¿Aun tiene registros por guardar?'",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: "Sí, guardar",
          cancelButtonText: "Cancelar",
        })
        .then(async resultado => {
          if (resultado.value) {
            // Hicieron click en "Sí, Guardar"
            this.continuarGuardarPendiente = true;
          } else {
            // Hicieron click en "Cancelar"
            console.log("*Se cancela el proceso...*");
          }
          resolve(resultado);
        });
    })
  }

  async verificarGuardarPuntajes(participante, indexSelec) {
    console.log("participante verificarGuardarPuntajes = ", participante)
    await new Promise((resolve, rejects) => {
      Swal
        .fire({
          title: "Registrar Puntajes",
          text: "¿Revisar, ya que no existe reversa...?'",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: "Sí, guardar",
          cancelButtonText: "Cancelar",
        })
        .then(async resultado => {
          if (resultado.value) {
            // Hicieron click en "Sí, Guardar"
            await this.guardarPuntajes(participante, indexSelec);
          } else {
            // Hicieron click en "Cancelar"
            console.log("*Se cancela el proceso...*");
          }
          resolve(resultado);
        });
    })
  }

  // Contar los caracteres de la cedula para activar boton <Buscar>
  onKey(event) {
    if (event.target.value < 1 || event.target.value > 10) {
      event.target.value = 0;
      this.mensajeService.mensajeError('Puntaje incorrecto, ingresar en el rango de 1 a 10...');
    }
  }

  capturarInputs(datosParticipante) {
    this.datosEditar = datosParticipante;
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

  resetTheForm(): void {
    this.listaPuntaje = null;
  }

  async enviarWhatsappApi(ele: Puntaje) {
    this.seEnvioWhatsapp = true;
    this.puntajeService.enviarMensajeWhatsapp(this.celularEnvioWhatsapp, this.mensaje).subscribe({
      next: async (response) => {
        this.mensajeService.mensajeCorrecto('Las notificaciones se enviaron con éxito...');
      },
      error: (error) => {
        console.log("error = ", error);
        this.mensajeService.mensajeError('Ha habido un problema al enviar las notificaciones ' + error);
      }
    });
  }

  /* Variables del html, para receptar datos y validaciones*/
  get codCategoriaField() {
    return this.formPuntajeParametro.get('codCategoria');
  }
  get codSubcategoriaField() {
    return this.formPuntajeParametro.get('codSubcategoria');
  }
  get codInstanciaField() {
    return this.formPuntajeParametro.get('codInstancia');
  }

}