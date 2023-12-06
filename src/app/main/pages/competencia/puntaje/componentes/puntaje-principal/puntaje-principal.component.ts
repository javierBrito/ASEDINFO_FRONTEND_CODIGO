import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { PuntajeService } from '../../servicios/puntaje.service';
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
import { Puntaje } from 'app/main/pages/compartidos/modelos/Puntaje';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';

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

  /*LISTAS*/
  public listaPuntaje: Puntaje[] = [];
  public listaPuntajeAux: Puntaje[] = [];
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
    this.sede = this.currentUser.sede;
  }

  ngOnInit() {
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
    this.listarInstanciaActivo();
  }

  listarModeloPuntajeActivo() {
    this.puntajeService.listarModeloPuntajeActivo().subscribe(
      (respuesta) => {
        this.listaModeloPuntaje = respuesta['listado'];
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
    // Receptar la descripción de formPuntajeParametro.value
    let puntajeParametroTemp = this.formPuntajeParametro.value;
    this.codCategoria = puntajeParametroTemp?.codCategoria;
    this.puntajeService.listarSubcategoriaPorCategoria(this.codCategoria).subscribe(
      (respuesta) => {
        this.listaSubcategoria = respuesta['listado'];
      }
    )
  }

  listarInstanciaActivo() {
    this.listaParticipantePresentacion = [];
    this.puntajeService.listarInstanciaActivo().subscribe(
      (respuesta) => {
        this.listaInstancia = respuesta['listado'];
      }
    )
  }
  
  listaPuntajeActualizada(event) {
    this.listaPuntaje = event;
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
        puntajeAux.puntaje < 10 &&
        puntajeAux.puntaje != 0) {
        puntajeTotal = puntajeTotal + (puntajeAux.proPorcentaje / 100) * Number(puntajeAux ? puntajeAux.proValor : 0);
        await new Promise((resolve, rejects) => {
          let puntaje = new Puntaje;
          puntaje = this.moverDatosPuntaje(puntajeAux);
          this.puntajeService.guardarPuntaje(puntaje).subscribe({
            next: (respuesta) => {
              puntaje.codigo = respuesta['objeto'].codigo;
              notaGuardada = notaGuardada + 1;
              //this.mensajeService.mensajeCorrecto('Se ha guardado el registro correctamente...');
              resolve("OK");
            }, error: (error) => {
              this.mensajeService.mensajeError('Ha habido un problema al guardar el registro...' + error);
              rejects("Error");
            }
          });
        });
      } else {
        errorGuardar = errorGuardar + 1;
        //this.controlarRangoNotas(puntajeAux);
      }
    }
    if (errorGuardar == 0) {
      this.mensajeService.mensajeCorrecto('Se ha guardado las notas correctamente...');
    }
    participante.puntaje = puntajeTotal;
  }

  moverDatosPuntaje(puntajeAux: Puntaje): Puntaje {
    let puntaje = new Puntaje();
    puntaje = {
      codigo: puntajeAux?.codigo,
      estado: puntajeAux?.estado,
      puntaje: puntajeAux?.puntaje,
      codParticipante: puntajeAux?.codParticipante,
      codModeloPuntaje: puntajeAux?.codModeloPuntaje,
      codSubcategoria: puntajeAux?.codSubcategoria,
      codInstancia: puntajeAux?.codInstancia,
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
        this.listarPuntajePorParticipante();
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

  capturarInputs(datosParticipante) {
    this.datosEditar = datosParticipante;
  }

  async listarPuntajePorParticipante() {
    this.listaParticipantePresentacion = [];
    // Receptar la descripción de formPuntajeParametro.value
    let puntajeParametroTemp = this.formPuntajeParametro.value;
    this.codSubcategoria = puntajeParametroTemp?.codSubcategoria;
    this.codInstancia = puntajeParametroTemp?.codInstancia;
    if (this.activarInput) {
      this.editarNota(this.participante, " ");
      return;
    }

    this.idInput = '';
    this.activarInput = false;

    await new Promise((resolve, rejects) => {
      this.puntajeService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia).subscribe({
        next: async (respuesta) => {
          this.listaParticipantePresentacion = respuesta['listado'];
          for (const est of this.listaParticipantePresentacion) {
            await new Promise((resolve, rejects) => {
              this.puntajeService.listarPuntajePorParticipante(est.codigo, this.codInstancia).subscribe({
                next: (respuesta) => {
                  let listNotas: Puntaje[] = [];
                  let listNotasConsulta: Puntaje[] = respuesta['listado'];
                  for (const modelo of this.listaModeloPuntaje) {
                    let auxBusqueda = listNotasConsulta.find(obj => obj.codModeloPuntaje == modelo.codigo)
                    if (auxBusqueda) {
                      //auxBusqueda.mprDesde = modelo.mprDesde;
                      //auxBusqueda.mprHasta = modelo.mprHasta;
                      listNotas.push(auxBusqueda)
                      console.log("auxBusqueda= ", auxBusqueda);
                    } else {
                      let nuevoPuntajeAux = new Puntaje();
                      nuevoPuntajeAux = {
                        codigo: 0,
                        estado: 'A',
                        puntaje: 0,
                        codParticipante: est.codigo,
                        codInstancia: this.codInstancia,
                        codSubcategoria: this.codSubcategoria,
                        codModeloPuntaje: modelo.codigo,
                      }
                      console.log("nuevoPuntajeAux= ", nuevoPuntajeAux);
                      listNotas.push(nuevoPuntajeAux)
                    }
                  }
                  est.listaNotas = listNotas;
                  console.log("est.listaNotas = ", est.listaNotas);
                  /*
                  let puntajeTotal = 0;
                  for (const nota of est.listaNotas) {
                    puntajeTotal = puntajeTotal + (nota.proPorcentaje / 100) * Number(nota ? nota.proValor : 0);
                  }
                  est.puntaje = puntajeTotal;
                  */
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
    this.puntajeService.enviarCorreo(this.reporteDTO['data']).subscribe({
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
    console.log("celular = ", this.celularEnvioWhatsapp);

    this.puntajeService.enviarMensajeWhatsapp(this.celularEnvioWhatsapp, this.mensaje).subscribe({
      next: async (response) => {
        console.log("response = ", response);
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
