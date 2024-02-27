import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { ResultadoService } from '../../servicios/resultado.service';
import { Aplicacion } from 'app/main/pages/compartidos/modelos/Aplicacion';
import dayjs from "dayjs";
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { ProductoService } from 'app/main/pages/catalogo/producto/servicios/producto.service';
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { Cliente } from 'app/main/pages/compartidos/modelos/Cliente';
import { Producto } from 'app/main/pages/compartidos/modelos/Producto';
import { Modulo } from 'app/main/pages/compartidos/modelos/Modulo';
import { Operacion } from 'app/main/pages/compartidos/modelos/Operacion';
import { ReporteDTO } from 'app/main/pages/compartidos/modelos/ReporteDTO.model';
import { ajax } from 'jquery';
import { Parametro } from 'app/main/pages/compartidos/modelos/Parametro';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { Puntaje } from 'app/main/pages/compartidos/modelos/Puntaje';
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
  public codigo: number;
  public institucion: any;
  public colorFila: string;
  public nemonicoModulo: string = 'VEN';
  public nemonicoOperacion: string = 'CRE';
  public fechaHoy = dayjs(new Date).format("YYYY-MM-DD");
  public fechaInicio: string;
  public fechaFin: string;
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
  public desCategoria: string;
  public desSubcategoria: string;
  public desInstancia: string;

  /*LISTAS*/
  public listaResultado: Puntaje[] = [];
  public listaPuntajeAux: Puntaje[] = [];
  public listaPuntajeTotal: Puntaje[] = [];
  public listaAplicacion: Aplicacion[] = [];
  public listaPeriodoRegAniLec: any[];
  public listaCategoria: any[];
  public listaSubcategoria: any[];
  public listaInstancia: any[];
  public listaModeloPuntaje: any[];
  public listaParticipante: any[];
  public listaParticipantePresentacion: any[] = [];

  /*TABS*/
  public selectedTab: number;

  /*OBJETOS*/
  private currentUser: LoginAplicacion;
  private sede: Sede;
  private persona: Persona;
  private cliente: Cliente;
  private producto: Producto;
  public modulo: Modulo;
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
    private readonly personaService: PersonaService,
    private readonly productoService: ProductoService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder
  ) {
    this.codigo = 0;
    this.itemsRegistros = 5;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.sede = this.currentUser.sede;
  }

  ngOnInit() {
    if (this.listaResultadoChild != null) {
      this.listaResultado = this.listaResultadoChild;
    }
    this.formResultadoParametro = this.formBuilder.group({
      codCategoria: new FormControl('', Validators.required),
      codSubcategoria: new FormControl('', Validators.required),
      codInstancia: new FormControl('', Validators.required),
    });
    this.listarModeloPuntajeActivo();
    this.listarCategoriaActivo();
  }

  listarModeloPuntajeActivo() {
    this.resultadoService.listarModeloPuntajeActivo().subscribe(
      (respuesta) => {
        this.listaModeloPuntaje = respuesta['listado'];
      }
    )
  }

  listarCategoriaActivo() {
    this.resultadoService.listarCategoriaActivo().subscribe(
      (respuesta) => {
        this.listaCategoria = respuesta['listado'];
      }
    )
  }

  listarSubcategoriaPorCategoria() {
    this.listaParticipantePresentacion = [];
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
    // Receptar codCategoria de formResultadoParametro.value
    let puntajeParametroTemp = this.formResultadoParametro.value;
    this.codSubcategoria = puntajeParametroTemp?.codSubcategoria;
    this.buscarSubcategoriaPorCodigo();
    this.listaParticipantePresentacion = [];
    this.resultadoService.listarInstanciaActivo().subscribe(
      (respuesta) => {
        this.listaInstancia = respuesta['listado'];
      }
    )
  }

  async listarPuntajeTotalPorParticipante() {
    this.listaParticipantePresentacion = [];
    // Receptar la descripción de formResultadoParametro.value
    let resultadoParametroTemp = this.formResultadoParametro.value;
    this.codSubcategoria = resultadoParametroTemp?.codSubcategoria;
    this.codInstancia = resultadoParametroTemp?.codInstancia;
    this.buscarInstanciaPorCodigo();

    if (this.activarInput) {
      this.editarNota(this.participante, " ");
      return;
    }

    this.idInput = '';
    this.activarInput = false;

    await new Promise((resolve, rejects) => {
      this.resultadoService.listarPuntajePorSubcategoriaInstanciaRegSUMA(this.codSubcategoria, this.codInstancia).subscribe({
        next: async (respuesta) => {
          this.listaPuntajeTotal = respuesta['listado'];
          // Ordenar lista por puntaje
          this.listaPuntajeTotal.sort((firstItem, secondItem) => secondItem.puntaje - firstItem.puntaje);
          resolve("OK");
        }, error: (error) => {
          console.log(error);
          rejects("Error");
        }
      });
    });
  }

  listaResultadoActualizada(event) {
    this.listaResultado = event;
  }

  openDetail(codjornada) {
    this.showDetail = true;
  }

  openEditarDetail(puntaje: Puntaje) {
    this.puntajeSeleccionado = puntaje;
    this.showDetail = true;
  }

  async guardarNotas(participante, indexSelec) {
    if (this.idInput === null) {
      // Guardar el primer registro en la misma fila
      this.guardarNota(participante, indexSelec);
      this.datosEditar = null;
      return;
    }
    if (this.idInput != indexSelec) {
      await this.verificarGuardarPendiente();
      if (this.continuarGuardarPendiente) {
        // Primero guardar los campos anteriores
        this.guardarNota(participante, indexSelec);
        // Reseteamos variables
        this.idInput = null;
        this.datosEditar = null;
        this.activarInput = false;
      }
    } else {
      this.guardarNota(participante, indexSelec);
      this.idInput = null;
      this.datosEditar = null;
      this.activarInput = false;
    }
  }

  async guardarNota(participante, indexSelec) {
    let puntajeTotal = 0;
    let notaGuardada = 0;
    let errorGuardar = 0;
    for (const puntajeAux of participante.listaNotas) {
      if (puntajeAux.puntaje > 0 &&
        puntajeAux.puntaje <= 10 &&
        puntajeAux.puntaje != 0) {
        this.puntajeAuxTotal = puntajeAux;
        puntajeTotal = puntajeTotal + (puntajeAux.porcentaje / 100) * Number(puntajeAux ? puntajeAux.puntaje : 0);
        await new Promise((resolve, rejects) => {
          let puntaje = new Puntaje;
          puntaje = this.moverDatosResultado(puntajeAux);
          this.resultadoService.guardarPuntaje(puntaje).subscribe({
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
        //this.controlarRangoNotas(puntajeAux);
        break;
      }
    }
    if (errorGuardar == 0) {
      this.mensajeService.mensajeCorrecto('Se ha guardado las notas correctamente...');
      // Guardar el resultado total de cada participante
      if (puntajeTotal > 0 && this.puntajeAuxTotal != null) {
        // Verificar si ya existe el total por participante, instancia y modelo resultado = 99
        await this.verificarExistenciaRegistroTotal();
        //participante.resultado = puntajeTotal;
        this.puntajeAuxTotal.codigo = this.codPuntaje;
        this.puntajeAuxTotal.codModeloPuntaje = 99;
        this.puntajeAuxTotal.puntaje = puntajeTotal;

        let puntajeTotalEntidad = new Puntaje;
        puntajeTotalEntidad = this.moverDatosResultado(this.puntajeAuxTotal);
        this.resultadoService.guardarPuntaje(puntajeTotalEntidad).subscribe({
          next: (response) => {
            this.mensajeService.mensajeCorrecto('Se ha actualizado el registro de correctamente...');
          },
          error: (error) => {
            this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          }
        });
        this.activarInput = false;
      }
    }
    this.listarPuntajeTotalPorParticipante();
  }

  async verificarExistenciaRegistroTotal() {
    this.codPuntaje = 0;
    return new Promise((resolve, rejects) => {
      this.resultadoService.listarPuntajePorParticipanteRegTotal(this.puntajeAuxTotal.codParticipante, this.puntajeAuxTotal.codInstancia, 99).subscribe({
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

  moverDatosResultado(puntajeAux: PuntajeAux): Puntaje {
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
      codUsuarioJuez: puntajeAux?.codUsuarioJuez,
    }

    return puntaje;
  }

  controlarRangoNotas(puntajeAux: Puntaje) {
    if (puntajeAux.puntaje != 0) {
      this.mensajeService.mensajeAdvertencia("La nota " + puntajeAux.puntaje + " no se encuentra en el rango de " + ", vuelva a ingresar...  ");
      if (puntajeAux.puntaje == 0) {
        puntajeAux.puntaje = 0;
      } else {
        this.activarInput = false;
        this.listarPuntajeTotalPorParticipante();
      }
    }
  }

  editarNota = async (participante, indexSelec) => {
    this.participante = participante;
    this.indexSelec = indexSelec;
    if (!this.datosEditar) { this.datosEditar = participante; }
    if (this.activarInput && this.idInput != indexSelec) {
      await this.verificarGuardarPendiente();
      if (this.continuarGuardarPendiente) {
        // Hicieron click en "Sí, Guardar"
        this.guardarNota(this.datosEditar, indexSelec);
        this.idInput = indexSelec;
        this.activarInput = false;
        this.datosEditar = null;
      } else {
        this.activarInput = false;
        this.listarPuntajeTotalPorParticipante();
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
    this.listaResultado = null;
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

  async confirmarEnviarNotificacion() {
    this.enviarNotificacion = false;
    Swal
      .fire({
        title: "Continuar envío Whatsapp...",
        text: "¿Quiere enviar las notificaciones?'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "Sí, enviar",
        cancelButtonText: "No, cancelar",
      })
      .then(async resultado => {
        if (resultado.isConfirmed) {
          this.enviarNotificacion = true;
          //this.listarPuntajeACaducarse();
        } else if (resultado.isDismissed) {
          console.log("No envia notificaciones");
        }
      });
  }

  enviarCorreo() {
    this.reporteDTO = new ReporteDTO({
      cedula: "",
      apellidoNombre: "",
      fechaNacimiento: "",
      edad: "",
      from: "transparenciame@educacion.gob.ec",
      nombreArchivo: "lista_caducarse_" + ".pdf",
      subject: "Lista de servicios a caducarse - LISTACADUCARSE",
      text: "<b>Texto en html, se lo genera en el servicio</b>",
      //to: "javier.brito@educacion.gob.ec"      
      to: "vjbritoa@hotmail.com",
    });
    this.resultadoService.enviarCorreo(this.reporteDTO['data']).subscribe({
      next: (respuesta) => {
        if (respuesta['codigoRespuesta'] == "Ok") {
          this.mensajeService.mensajeCorrecto('Se a enviado el correo a ' + this.reporteDTO['data'].to);
        } else {
          this.mensajeService.mensajeError(respuesta['mensaje']);
        }
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  async enviarWhatsapp(ele: Puntaje) {
    this.seEnvioWhatsapp = true;
    //this.mensaje = "Estimad@: " + ele.nombreCliente + ", por recordarle que su licencia de " + ele.descripcionProducto + " finaliza el " + ele.fechaFin + " Por favor, haganos saber por éste medio de su renovación, gracias su atención.";
    //this.celularEnvioWhatsapp = this.codigoPostal + ele.celular.substring(1, 10);
    var api = "https://script.google.com/macros/s/AKfycbyoBhxuklU5D3LTguTcYAS85klwFINHxxd-FroauC4CmFVvS0ua/exec";
    var payload = {
      "op": "registermessage", "token_qr": this.token, "mensajes": [
        { "numero": this.celularEnvioWhatsapp, "mensaje": this.mensaje }
      ]
    };
    console.log(payload);
    console.log(api);
    ajax({
      url: api,
      jsonp: "callback",
      method: 'POST',
      data: JSON.stringify(payload),
      async: false,
      success: function (respuestaSolicitud) {
        this.respuestaEnvioWhatsapp = respuestaSolicitud.message;
        //alert(respuestaSolicitud.message);
        if (this.respuestaEnvioWhatsapp != 'Se notifico asincrono v3') {
          this.seEnvioWhatsapp = false;
        }
      }
    });
  }

  async enviarWhatsappApi(ele: Puntaje) {
    this.seEnvioWhatsapp = true;
    //this.mensaje = "Estimad@: " + ele.nombreCliente + ", por recordarle que su licencia de " + ele.descripcionProducto + " finaliza el " + ele.fechaFin + " Por favor, haganos saber por éste medio de su renovación, gracias su atención.";
    //this.celularEnvioWhatsapp = this.codigoPostal + ele.celular.substring(1, 10);

    this.resultadoService.enviarMensajeWhatsapp(this.celularEnvioWhatsapp, this.mensaje).subscribe({
      next: async (response) => {
        //console.log("response = ", response);
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
    return this.formResultadoParametro.get('codCategoria');
  }
  get codSubcategoriaField() {
    return this.formResultadoParametro.get('codSubcategoria');
  }
  get codInstanciaField() {
    return this.formResultadoParametro.get('codInstancia');
  }

}
