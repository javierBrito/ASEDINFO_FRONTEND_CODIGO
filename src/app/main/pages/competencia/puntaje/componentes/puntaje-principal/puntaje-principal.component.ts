import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { PuntajeService } from '../../servicios/puntaje.service';
import { Aplicacion } from 'app/main/pages/compartidos/modelos/Aplicacion';
import { Modulo } from 'app/main/pages/compartidos/modelos/Modulo';
import { Operacion } from 'app/main/pages/compartidos/modelos/Operacion';
import { ReporteDTO } from 'app/main/pages/compartidos/modelos/ReporteDTO.model';
import { Parametro } from 'app/main/pages/compartidos/modelos/Parametro';
import { Puntaje } from 'app/main/pages/compartidos/modelos/Puntaje';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { PuntajeAux } from 'app/main/pages/compartidos/modelos/PuntajeAux';
import { ParticipanteService } from '../../../participante/servicios/participante.service';
import { Seguimiento } from 'app/main/pages/compartidos/modelos/Seguimiento';
import { ParticipanteSeguimiento } from 'app/main/pages/compartidos/modelos/ParticipanteSeguimiento';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
  public displayNone1: string = '';
  public desCategoria: string = "";
  public desSubcategoria: string = "";
  public desInstancia: string = "";
  public codEstadoCompetencia: number;
  public nombreUsuario: string;
  public siActualizaNumJuez: boolean = false;
  public numJueces: number = 0;
  public codParticipante: number = 0;
  public esUsuarioJuezAdmin: boolean = false;

  /*LISTAS*/
  public listaPuntaje: Puntaje[] = [];
  public listaPuntajeAux: Puntaje[] = [];
  public listaPuntajeGuardar: Puntaje[] = [];
  public listaAplicacion: Aplicacion[] = [];
  public listaPeriodoRegAniLec: any[];
  public listaCategoria: any[];
  public listaSubcategoria: any[];
  public listaInstancia: any[];
  public listaModeloPuntaje: any[];
  public listaModeloPuntajeAux: any[];
  public listaModeloPuntajeOp: any[];
  public listaModeloPuntajeOpAux: any[];
  public listaParticipante: any[];
  public listaParticipantePresentacion: any[] = [];
  public listaUsuarioModeloPuntaje: any[];
  public listaUsuarioModeloPuntajeOp: any[];
  public listaSeguimiento: Seguimiento[] = [];
  public listaParticipanteSeguimiento: any[];

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
  public participanteSeguimiento: ParticipanteSeguimiento;

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
    this.itemsRegistros = 10;
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
    if (this.currentUser.cedula == 'JUEZ') {
      this.listarModeloPuntajeActivo();
    }
    if (this.currentUser.cedula == 'JUEZOP') {
      this.listarModeloPuntajeOpActivo();
    }
    this.listarCategoriaActivo();
    //this.listarSeguimientoActivo(this.participante);
    if (this.currentUser.cedula == 'JUEZ' || this.currentUser.cedula == 'JUEZOP') {
      this.displayNone = 'none';
      this.displayNone1 = '';
      //this.obtenerParametros();
      this.listarPuntajePorParticipante();
      // Para habilitar el ingreso de puntajes directo
      this.editarPuntaje(this.participante, 'curso_0')
    }
    // Procesos de Juez Administrador
    if (this.currentUser.cedula == 'JUEZADMIN') {
      this.displayNone = '';
      this.displayNone1 = 'none';
      this.listarModeloPuntajeActivo();
      //this.obtenerParametros();
      //this.listarPuntajePorParticipante();
      // Para habilitar el ingreso de puntajes directo
      //this.editarPuntaje(this.participante, 'curso_0')
    }
  }

  guardarParticipanteSeguimiento(participanteSeguimiento: ParticipanteSeguimiento, event: any, indice: number) {
    if (event.target.checked) {
      this.participanteSeguimiento = new ParticipanteSeguimiento();
      this.participanteSeguimiento = {
        codigo: 0,
        codParticipante: this.codParticipante,
        codSeguimiento: participanteSeguimiento?.codigo,
        estado: 'A',
      };
      this.listaParticipanteSeguimiento.push(this.participanteSeguimiento);
    } else {
      let indice1 = 0;
      if (this.listaParticipanteSeguimiento.length > 0) {
        for (const ele1 of this.listaParticipanteSeguimiento) {
          if (participanteSeguimiento.codigo == ele1?.codSeguimiento) {
            break;
          }
          indice1 = indice1 + 1;
        }
      }
      this.listaParticipanteSeguimiento.splice(indice1, 1);
    }
  }

  async listarSeguimientoActivo(participante: Participante) {
    if (this.listaSeguimiento.length == 0) {
      this.puntajeService.listarSeguimientoActivo().subscribe(
        (respuesta) => {
          this.listaSeguimiento = respuesta['listado'];
          if (participante == null || participante == undefined) {
            this.codParticipante = 0;
          } else {
            this.codParticipante = participante?.codigo;
          }
          this.puntajeService.listarParticipanteSeguimientoPorParticipante(this.codParticipante).subscribe(
            (respuesta) => {
              this.listaParticipanteSeguimiento = respuesta['listado'];
              if (this.listaParticipanteSeguimiento === null) {
                this.listaParticipanteSeguimiento = [];
              }
              if (this.listaParticipanteSeguimiento.length > 0) {
                for (const ele of this.listaSeguimiento) {
                  ele.asignado = false;
                  for (const ele1 of this.listaParticipanteSeguimiento) {
                    if (ele?.codigo == ele1?.codSeguimiento) {
                      ele.asignado = true;
                    }
                  }
                }
              }
            }
          );
        }
      );
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
        this.puntajeService.listarUsuarioModeloPuntajePorUsuario(this.currentUser?.codigoUsuario).subscribe(
          (respuesta) => {
            this.listaUsuarioModeloPuntaje = respuesta['listado'];
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
      }
    )
  }

  listarModeloPuntajeOpActivo() {
    this.listaModeloPuntaje = [];
    this.puntajeService.listarModeloPuntajeOpActivo().subscribe(
      (respuesta) => {
        this.listaModeloPuntajeOpAux = respuesta['listado'];
        this.puntajeService.listarUsuarioModeloPuntajeOpPorUsuario(this.currentUser?.codigoUsuario).subscribe(
          (respuesta) => {
            this.listaUsuarioModeloPuntajeOp = respuesta['listado'];
            if (this.listaUsuarioModeloPuntajeOp.length > 0) {
              for (const ele of this.listaModeloPuntajeOpAux) {
                ele.asignado = false;
                for (const ele1 of this.listaUsuarioModeloPuntajeOp) {
                  if (ele?.codigo == ele1?.codModeloPuntaje) {
                    ele.asignado = true;
                    this.listaModeloPuntaje.push(ele);
                  }
                }
              }
            }
          }
        )
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
          if (this.participanteAux.numPuntajeJuez == this.participanteAux?.numJueces) {
            // Cambiar el estado de la competencia a Completado
            this.participanteAux.codEstadoCompetencia = 5;
          }
          this.participanteService.guardarParticipante(this.participanteAux).subscribe({
            next: (response) => {
              this.participante = response['objeto'];
              if (this.listaParticipanteSeguimiento.length > 0) {
                this.puntajeService.guardarListaParticipanteSeguimiento(this.listaParticipanteSeguimiento).subscribe({
                  next: async (response) => {
                    this.listarPuntajePorParticipante();
                    //this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
                  },
                  error: (error) => {
                    this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
                  }
                });
              } else {
                this.listarPuntajePorParticipante();
                //this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
              }
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

    if (this.currentUser.cedula != 'JUEZ' && this.currentUser.cedula != 'JUEZOP') {
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
    await new Promise((resolve, rejects) => {
      //this.puntajeService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, this.codEstadoCompetencia).subscribe({
      this.puntajeService.listarParticipantePorEstadoCompetencia(this.codEstadoCompetencia).subscribe({
        next: async (respuesta) => {
          this.listaParticipantePresentacion = respuesta['listado'];
          if (this.listaParticipantePresentacion.length < this.itemsRegistros) {
            this.page = 1;
          }
          for (const par of this.listaParticipantePresentacion) {
            // Tratar nombre de Pariicipante
            if (par?.nombrePareja != "" && par?.nombrePareja != null) {
              par.nombrePersona = par?.nombrePersona + " - " + par?.nombrePareja;
            }
            this.desCategoria = par?.desCategoria;
            this.desSubcategoria = par?.desSubcategoria;
            this.desInstancia = par?.desInstancia;

            await new Promise((resolve, rejects) => {
              this.puntajeService.listarPuntajePorParticipanteSubcategoriaInstancia(par.codigo, par.codSubcategoria, par.codInstancia, this.currentUser.codigoUsuario).subscribe({
                next: (respuesta) => {
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
                        codParticipante: par?.codigo,
                        codInstancia: this.codInstancia,
                        codSubcategoria: this.codSubcategoria,
                        codModeloPuntaje: modelo?.codigo,
                        porcentaje: modelo?.porcentaje,
                        nombreParticipante: par?.nombreParticipante,
                        codUsuarioJuez: 0,
                      }
                      listaPuntajes.push(nuevoPuntajeAux)
                    }
                  }
                  par.listaPuntajes = listaPuntajes;
                  resolve("OK");
                }, error: (error) => {
                  console.log(error);
                  rejects("Error");
                }
              });
            });
          }
          this.participante = this.listaParticipantePresentacion['0'];
          // Recuperar datos de Seguimiento
          await this.listarSeguimientoActivo(this.participante);
          resolve("OK");
        }, error: (error) => {
          console.log(error);
          rejects("Error");
        }
      });
    });
  }

  async listarPuntajePorParticipanteJuezAdmin() {
    this.esUsuarioJuezAdmin = false;
    this.listaParticipantePresentacion = [];

    // Receptar codCategoria, codSubcategoria y codInstancia de formPuntajeParametro.value
    let puntajeParametroTemp = this.formPuntajeParametro.value;
    this.codSubcategoria = puntajeParametroTemp?.codSubcategoria;
    this.codInstancia = puntajeParametroTemp?.codInstancia;
    this.buscarInstanciaPorCodigo();
    this.codEstadoCompetencia = 0;

    await new Promise((resolve, rejects) => {
      this.puntajeService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, this.codEstadoCompetencia).subscribe({
        //this.puntajeService.listarParticipantePorEstadoCompetencia(this.codEstadoCompetencia).subscribe({
        next: async (respuesta) => {
          this.listaParticipantePresentacion = respuesta['listado'];
          if (this.listaParticipantePresentacion.length < this.itemsRegistros) {
            this.page = 1;
          }
          this.listaParticipantePresentacion = this.listaParticipantePresentacion.filter((participante) => participante?.codEstadoCompetencia === 5);
          let puntajeTotal: number = 0;
          for (const par of this.listaParticipantePresentacion) {
            // Tratar nombre de Pariicipante
            if (par?.nombrePareja != "" && par?.nombrePareja != null) {
              par.nombrePersona = par?.nombrePersona + " - " + par?.nombrePareja;
            }
            // Adicionar puntaje total - jbrito-2024411
            par.puntajeTotal = 0;
            await new Promise((resolve, rejects) => {
              this.puntajeService.listarPuntajePorParticipanteSubcategoriaInstanciaRegSUMA(par.codSubcategoria, par.codInstancia, par.codigo).subscribe({
                next: (respuesta) => {
                  let listaPuntajeTotal: PuntajeAux[] = respuesta['listado'];
                  puntajeTotal = listaPuntajeTotal[0]?.puntaje;
                  par.puntajeTotal = puntajeTotal;
                  resolve("OK");
                }, error: (error) => {
                  console.log(error);
                  rejects("Error");
                }
              });
            });

            await new Promise((resolve, rejects) => {
              //this.puntajeService.listarPuntajePorParticipanteSubcategoriaInstancia(est.codigo, par.codSubcategoria, par.codInstancia, this.currentUser.codigoUsuario).subscribe({
              this.puntajeService.listarPuntajePorParticipanteSubcategoriaInstanciaCriterios(par.codigo, par.codSubcategoria, par.codInstancia).subscribe({
                next: (respuesta) => {
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
                        codParticipante: par?.codigo,
                        codInstancia: this.codInstancia,
                        codSubcategoria: this.codSubcategoria,
                        codModeloPuntaje: modelo?.codigo,
                        porcentaje: modelo?.porcentaje,
                        nombreParticipante: par?.nombreParticipante,
                        codUsuarioJuez: 0,
                      }
                      listaPuntajes.push(nuevoPuntajeAux)
                    }
                  }
                  par.listaPuntajes = listaPuntajes;
                  this.esUsuarioJuezAdmin = true;
                  resolve("OK");
                }, error: (error) => {
                  console.log(error);
                  rejects("Error");
                }
              });
            });
          }
          //this.participante = this.listaParticipantePresentacion['0'];
          // Recuperar datos de Seguimiento
          await this.listarSeguimientoActivo(this.participante);
          resolve("OK");
        }, error: (error) => {
          console.log(error);
          rejects("Error");
        }
      });
    });
    this.listaParticipantePresentacion.sort((a, b) => (a.puntajeTotal < b.puntajeTotal ? 1 : -1));
  }

  async guardarPuntajes(participante, indexSelec) {
    if (this.idInput === null) {
      // Guardar el primer registro en la misma fila
      this.guardarPuntaje(participante, indexSelec);
      this.datosEditar = null;
      return;
    }
    this.siActualizaNumJuez = true;
    if (this.esUsuarioJuezAdmin) {
      this.idInput = indexSelec;
    }
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
    let puntajeTotal = 0;
    let notaGuardada = 0;
    let errorGuardar = 0;
    this.listaPuntajeGuardar = [];
    for (let puntajeAux of participante.listaPuntajes) {
      puntajeAux.codSubcategoria = participante?.codSubcategoria;
      puntajeAux.codInstancia = participante?.codInstancia;
      this.codSubcategoria = participante?.codSubcategoria;
      this.codInstancia = participante?.codInstancia;
      puntajeAux.nombreParticipante = participante?.firstName;
      if (puntajeAux?.puntaje > 0 &&
        puntajeAux?.puntaje <= 10 &&
        puntajeAux?.puntaje != 0) {
        if (puntajeAux?.codigo != 0) {
          this.siActualizaNumJuez = false;
        }
        this.puntajeAuxTotal = puntajeAux;
        puntajeTotal = puntajeTotal + (puntajeAux?.porcentaje / 100) * Number(puntajeAux ? puntajeAux?.puntaje : 0);
        //await new Promise((resolve, rejects) => {
        let puntaje = new Puntaje;
        puntaje = this.moverDatosPuntaje(puntajeAux);
        /*
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
        */
        //});
      } else {
        errorGuardar = errorGuardar + 1;
        this.mensajeService.mensajeAdvertencia("El puntaje " + puntajeAux.puntaje + " no se encuentra en el rango de 1 a 10, vuelva a ingresar...  ");
        this.activarInput = false;
        break;
      }
    }
    if (errorGuardar == 0) {
      //this.mensajeService.mensajeCorrecto('Se ha guardado las notas correctamente...');

      // Guardar el puntaje total de cada participante
      if (puntajeTotal > 0 && this.puntajeAuxTotal != null) {
        // Verificar si ya existe el total por participante, instancia y modelo puntaje = 99
        //await this.verificarExistenciaRegistroTotal();
        this.puntajeAuxTotal.codigo = this.codPuntaje;
        this.puntajeAuxTotal.codModeloPuntaje = 99;
        this.puntajeAuxTotal.puntaje = puntajeTotal.toFixed(2);
        this.puntajeAuxTotal.codUsuarioJuez = this.currentUser?.codigoUsuario;

        let puntajeTotalEntidad = new Puntaje;
        puntajeTotalEntidad = this.moverDatosPuntaje(this.puntajeAuxTotal);
        /*
        this.puntajeService.guardarPuntaje(puntajeTotalEntidad).subscribe({
          next: (response) => {
            if (this.siActualizaNumJuez) {
              this.actualizarNumPuntajeJuez(participante?.codigo);
            }
            //this.mensajeService.mensajeCorrecto('Se ha actualizado el registro de totales correctamente...');
            this.mensajeService.mensajeCorrecto("Se registraron (" + notaGuardada + " PUNTAJES) correctamente ...... En caso de alguna novedad comunicarse con el ADMINISTRADOR ...");
          },
          error: (error) => {
            this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro de totales...');
          }
        });
        */
        this.activarInput = false;
      }
    }
    notaGuardada = this.listaPuntajeGuardar?.length - 1;
    await new Promise((resolve, rejects) => {
      this.puntajeService.guardarListaPuntaje(this.listaPuntajeGuardar).subscribe({
        next: (respuesta) => {
          this.mensajeService.mensajeCorrecto("Se registraron (" + notaGuardada + " PUNTAJES) correctamente ...... En caso de alguna novedad comunicarse con el ADMINISTRADOR ...");
          resolve("OK");
        }, error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al guardar el registro...' + error);
          puntajeTotal = 0;
          rejects("Error");
        }
      });
    });
    if (this.esUsuarioJuezAdmin) {
      this.listarPuntajePorParticipanteJuezAdmin();
    } else {
      this.listarPuntajePorParticipante();
    }
  }

  siguienteParticipante() {
    window.location.reload();
  }

  async verificarExistenciaRegistroTotal() {
    this.codPuntaje = 0;
    return new Promise((resolve, rejects) => {
      this.puntajeService.listarPuntajePorParticipanteRegTotal(this.puntajeAuxTotal?.codParticipante, this.puntajeAuxTotal?.codSubcategoria, this.puntajeAuxTotal?.codInstancia, this.currentUser?.codigoUsuario, 99).subscribe({
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
    //puntajeAux.codUsuarioJuez = puntajeAux?.codUsuarioJuez == 0 ? this.currentUser.codigoUsuario : puntajeAux?.codUsuarioJuez;
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
      //codUsuarioJuez: puntajeAux?.codUsuarioJuez,
      pathImagenTrofeo: "",
    }
    this.listaPuntajeGuardar.push(puntaje);

    return puntaje;
  }

  editarPuntaje = async (participante, indexSelec) => {
    this.participante = participante;
    this.indexSelec = indexSelec;
    if (!this.datosEditar) { this.datosEditar = participante; }
    this.idInput = indexSelec;
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
    for (let puntaje of participante['listaPuntajes']) {
      if (puntaje?.codParticipante == participante?.codigo) {
        if (puntaje?.puntaje < 1 || puntaje?.puntaje > 10) {
          this.mensajeService.mensajeError('Puntaje incorrecto, ingresar valores en el rango de 1 a 10...');
          return;
        };
      }
    }
    await new Promise((resolve, rejects) => {
      Swal
        .fire({
          title: "Registrar Puntajes",
          text: "Revisar puntajes! No existe REVERSA...",
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

  // Validar si ingresa  en el rango de 1 a 10.
  outFocus(event) {
    if (event.target.value < 1 || event.target.value > 10) {
      event.target.value = 0;
      this.mensajeService.mensajeError('Puntaje incorrecto, ingresar en el rango de 1 a 10...');
    }
  }

  capturarInputs(participante) {
    this.datosEditar = participante;
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

  generarPDFPuntaje() {
    /*
    console.log("this.listaParticipantePresentacion = ", this.listaParticipantePresentacion)
    for (let participante of this.listaParticipantePresentacion) {
      console.log("participante?.firstName = ", participante?.firstName);
      console.log("participante?.puntajeTotal = ", participante?.puntajeTotal);
      for (let puntaje of participante?.listaPuntajes) {
        console.log("puntaje = ", puntaje?.puntaje)
      }
    }
    */
    const bodyData = this.listaParticipantePresentacion.map((item, index) => [index + 1, item?.firstName,
    item?.listaPuntajes[0]?.puntaje == 0 ? "" : item?.listaPuntajes[0]?.puntaje,
    item?.listaPuntajes[1]?.puntaje == 0 ? "" : item?.listaPuntajes[1]?.puntaje,
    item?.listaPuntajes[2]?.puntaje == 0 ? "" : item?.listaPuntajes[2]?.puntaje,
    item?.listaPuntajes[3]?.puntaje == 0 ? "" : item?.listaPuntajes[3]?.puntaje,
    item?.listaPuntajes[4]?.puntaje == 0 ? "" : item?.listaPuntajes[4]?.puntaje,
    item?.listaPuntajes[5]?.puntaje == 0 ? "" : item?.listaPuntajes[5]?.puntaje,
    (item?.puntajeTotal == 0 || item?.puntajeTotal == undefined) ? "" : item?.puntajeTotal]);
    const pdfDefinition: any = {
      content: [
        { text: 'Reporte Puntajes', style: 'datoTituloGeneral' },
        { text: this.listaParticipantePresentacion['0']?.desCategoria + " / " + this.listaParticipantePresentacion['0']?.desSubcategoria, style: 'datoSubtitulo' },
        {
          table: {
            body: [
              ['#', 'PARTICIPANTE', 'TIEMPO', 'TÉC. SAL/BACH', 'COREOGRAFÍA', 'TÉC. (DANZA)', 'CONEXIÓN', 'PROFESIONAL', 'TOTAL'],
              ...bodyData
            ],
          },
          style: 'datosTabla'
        },
      ],
      styles: {
        datosTabla: {
          fontSize: 8.5,
          margin: [5, 5, 5, 5], // Margen inferior para separar la tabla de otros elementos
          fillColor: '#F2F2F2', // Color de fondo de la tabla
          alignment: 'center',
          color: 'black',
          bold: true,
        },
        datoTitulo: {
          fontSize: 10,
          fillColor: '#bada55',
        },
        datoTituloGeneral: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10], // Puedes ajustar el margen según tus preferencias
        },
        datoSubtitulo: {
          fontSize: 11,
          color: 'blue',
          bold: true,
          alignment: 'center', // Alineado a la izquierda
          margin: [0, 0, 0, 10], // Ajusta el margen según tus preferencias
        }
      },
    }
    const pdf = pdfMake.createPdf(pdfDefinition);
    pdf.open();
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