import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { Transaccion } from 'app/main/pages/compartidos/modelos/Transaccion';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { TransaccionService } from '../../servicios/transaccion.service';
import { Aplicacion } from 'app/main/pages/compartidos/modelos/Aplicacion';
import dayjs from "dayjs";
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { ProductoService } from 'app/main/pages/catalogo/producto/servicios/producto.service';
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { Cliente } from 'app/main/pages/compartidos/modelos/Cliente';
import { Producto } from 'app/main/pages/compartidos/modelos/Producto';
import { ClienteService } from '../../../cliente/servicios/cliente.service';
import { Modulo } from 'app/main/pages/compartidos/modelos/Modulo';
import { Operacion } from 'app/main/pages/compartidos/modelos/Operacion';
import { ReporteDTO } from 'app/main/pages/compartidos/modelos/ReporteDTO.model';
import { ajax } from 'jquery';
import { Parametro } from 'app/main/pages/compartidos/modelos/Parametro';

@Component({
  selector: 'app-transaccion-principal',
  templateUrl: './transaccion-principal.component.html',
  styleUrls: ['./transaccion-principal.component.scss']
})
export class TransaccionPrincipalComponent implements OnInit {
  /*INPUT RECIBEN*/
  @Input() listaTransaccionChild: any;

  /*MODALES*/
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;

  /*VARIABLES*/
  public codigo: number;
  public institucion: any;
  public descripcion: string;
  public colorFila: string;
  public colorColumna: string;
  public nemonicoModulo: string = 'VEN';
  public nemonicoOperacion: string = 'CRE';
  public fechaHoy = dayjs(new Date).format("YYYY-MM-DD");
  public fechaInicio: string;
  public fechaFin: string;
  public celularEnvioWhatsapp: string;
  public codigoPostal: string = '593';
  public descripcionProducto: string;
  public mensajeCaduca: string;
  public fechaFinMensaje: string;
  public nombreCliente: string;
  public enviarNotificacion: boolean;
  public seEnvioWhatsapp: boolean;
  public respuestaEnvioWhatsapp: string;
  public token: string;
  public celular: string;
  public claveCuenta: string;
  public codCliente: number;

  /*LISTAS*/
  public listaTransaccion: Transaccion[] = [];
  public listaTransaccionAux: Transaccion[] = [];
  public listaAplicacion: Aplicacion[] = [];
  public listaPeriodoRegAniLec: any[];
  public listaCliente: Cliente[];

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
  public transaccion: Transaccion;

  /*DETAIL*/
  public showDetail: boolean;

  /*PAGINACION*/
  public page: number;
  public itemsRegistros: number;

  /*OBJETOS*/
  public transaccionSeleccionado: Transaccion;

  /*FORMULARIOS*/
  public formTransaccion: FormGroup;

  /*CONSTRUCTOR */
  constructor(
    /*Servicios*/
    private readonly transaccionService: TransaccionService,
    private readonly clienteService: ClienteService,
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
    /*LISTAS*/
    this.listarClienteActivoOrdenNombre();
  }

  ngOnInit() {
    this.buscarModuloPorNemonico();
    this.buscarOperacionPorNemonico();
    if (this.listaTransaccionChild != null) {
      this.listaTransaccion = this.listaTransaccionChild;
    }
    this.formTransaccion = this.formBuilder.group({
      descripcion: new FormControl('', Validators.required),
      codCliente: new FormControl('', Validators.required),
      claveCuenta: new FormControl('', Validators.required),
      fechaInicio: new FormControl(dayjs(new Date).format("YYYY-MM-DD"), Validators.required),
      fechaFin: new FormControl(dayjs(new Date).format("YYYY-MM-DD"), Validators.required),
    });
    this.obtenerParametros();
    //this.obtenerTransaccionACaducarse();
    this.listarTransaccionACaducarse();
  }

  listarClienteActivoOrdenNombre() {
    this.clienteService.listarClienteActivoOrdenNombre().subscribe(
      (respuesta) => {
        this.listaCliente = respuesta['listado'];
        for (const ele of this.listaCliente) {
          // Obtener persona
          this.personaService.buscarPersonaPorCodigo(ele.codPersona).subscribe(
            (respuesta) => {
              this.persona = respuesta['objeto'];
              ele.persona = this.persona;
            }
          )
        };
      }
    );
  }

  obtenerParametros() {
    // Obtener el token para envio whatsapp
    this.transaccionService.buscarParametroPorNemonico('token').subscribe(
      (respuesta) => {
        this.parametro = respuesta['objeto'];
        this.token = this.parametro?.valorCadena;
      }
    )
    // Obtener el celular para envio whatsapp
    this.transaccionService.buscarParametroPorNemonico('celular').subscribe(
      (respuesta) => {
        this.parametro = respuesta['objeto'];
        this.celular = this.parametro?.valorCadena;
      }
    )
  }

  buscarModuloPorNemonico() {
    this.transaccionService.buscarModuloPorNemonico(this.nemonicoModulo).subscribe(
      (respuesta) => {
        this.modulo = respuesta['objeto'];
      }
    )
  }

  buscarOperacionPorNemonico() {
    this.transaccionService.buscarOperacionPorNemonico(this.nemonicoOperacion).subscribe(
      (respuesta) => {
        this.operacion = respuesta['objeto'];
      }
    )
  }

  obtenerTransaccionACaducarse = async () => {
    this.enviarNotificacion = false;
    await this.confirmarEnviarNotificacion();
  }

  listarTransaccionACaducarse() {
    return new Promise((resolve, rejects) => {
      this.transaccionService.listarTransaccionACaducarse(5).subscribe({
        next: (respuesta) => {
          this.listaTransaccion = respuesta['listado'];
          if (this.listaTransaccion?.length > 0) {
            this.mostrarListaTransaccion();
          }
          resolve(respuesta);
        }, error: (error) => {
          rejects("Error");
          console.log("Error =", error);
        }
      })
    })
  }

  listarTransaccion() {
    this.codCliente = 0;
    this.enviarNotificacion = false;
    this.listaTransaccion = [];
    // Receptar datos de formTransaccion.value
    let transaccionDescripcionTemp = this.formTransaccion.value;
    this.claveCuenta = transaccionDescripcionTemp?.claveCuenta;
    this.codCliente = transaccionDescripcionTemp?.codCliente;
    this.fechaInicio = transaccionDescripcionTemp?.fechaInicio;
    this.fechaFin = transaccionDescripcionTemp?.fechaFin;
    this.descripcion = transaccionDescripcionTemp?.descripcion;
    if (this.claveCuenta?.length != 0) {
      this.listarTransaccionPorClaveCuenta();
      return;
    }
    if (this.codCliente != 0 && Number(this.codCliente)+"" != "NaN") {
      this.listarTransaccionPorCliente();
      return;
    }
    if (this.descripcion?.length != 0) {
      this.listarTransaccionPorDescripcion();
      return;
    }
    if (this.fechaInicio?.length != 0 && this.fechaFin?.length != 0) {
      this.listarTransaccionPorRangoFechas();
      return;
    }

    this.transaccionService.listarTransaccionActivo(this.modulo?.nemonico).subscribe(
      (respuesta) => {
        this.listaTransaccion = respuesta['listado'];
        if (this.listaTransaccion?.length > 0) {
          this.mostrarListaTransaccion();
        }
      }
    )
  }

  listarTransaccionPorClaveCuenta() {
    this.transaccionService.listarTransaccionPorClaveCuenta(this.claveCuenta).subscribe(
      (respuesta) => {
        this.listaTransaccion = respuesta['listado'];
        if (this.listaTransaccion?.length > 0) {
          this.mostrarListaTransaccion();
        }
      }
    )
  }

  listarTransaccionPorCliente() {
    this.transaccionService.listarTransaccionPorCliente(this.codCliente).subscribe(
      (respuesta) => {
        this.listaTransaccion = respuesta['listado'];
        if (this.listaTransaccion?.length > 0) {
          this.mostrarListaTransaccion();
        }
      }
    )
  }

  listarTransaccionPorDescripcion() {
    this.transaccionService.listarTransaccionPorDescripcion(this.descripcion).subscribe(
      (respuesta) => {
        this.listaTransaccion = respuesta['listado'];
        if (this.listaTransaccion?.length > 0) {
          this.mostrarListaTransaccion();
        }
      }
    )
  }

  listarTransaccionPorRangoFechas() {
    this.transaccionService.listarTransaccionPorRangoFechas('2023-09-21', this.fechaFin).subscribe(
      (respuesta) => {
        this.listaTransaccion = respuesta['listado'];
        if (this.listaTransaccion?.length > 0) {
          this.mostrarListaTransaccion();
        }
      }
    )
  }

  mostrarListaTransaccion = async () => {
    console.log("this.listaTransaccion = ", this.listaTransaccion)
    for (const ele of this.listaTransaccion) {
      ele.colorFila = "green";
      ele.colorColumna = "white";
      ele.fechaInicio = dayjs(ele.fechaInicio).format("YYYY-MM-DD");
      ele.fechaFin = dayjs(ele.fechaFin).format("YYYY-MM-DD");
      if (ele?.fechaCambia != null) {
        ele.fechaCambia = dayjs(ele.fechaCambia).format("YYYY-MM-DD");
        // Calcular la diferencia en días de la fecha actual y final de la transacción
        var diff1 = new Date(ele.fechaCambia).getTime() - new Date(this.fechaHoy).getTime();
        var numDias1 = diff1 / (1000 * 60 * 60 * 24);

        if (numDias1 == 0) {
          ele.colorColumna = "yellow";
        }
      }
      this.fechaFinMensaje = dayjs(ele.fechaFin).format("YYYY-MM-DD");

      // Calcular la diferencia en días de la fecha actual y final de la transacción
      var diff = new Date(ele.fechaFin).getTime() - new Date(this.fechaHoy).getTime();
      var numDias = diff / (1000 * 60 * 60 * 24);

      // ele.fechaFin <= this.fechaHoy
      if (!(numDias > 0 && numDias > 5)) {
        ele.colorFila = "red";
      }

      // Confirmar si se envia o no las Notificaciones
      if (this.enviarNotificacion) {
        this.enviarWhatsappApi(ele);
      }
    }

    if (this.enviarNotificacion) {
      if (this.seEnvioWhatsapp) {
        this.mensajeService.mensajeCorrecto('Las notificaciones se enviaron con éxito...');
      } else {
        this.mensajeService.mensajeError('Error... ' + this.respuestaEnvioWhatsapp + ' ingrese nuevo token');
      }
    }
  }

  listaTransaccionActualizada(event) {
    this.listaTransaccion = event;
  }

  openDetail(codjornada) {
    this.showDetail = true;
  }

  openEditarDetail(transaccion: Transaccion) {
    this.transaccionSeleccionado = transaccion;
    this.showDetail = true;
  }

  openRenovarDetail(transaccion: Transaccion) {
    this.transaccionSeleccionado = transaccion;
    this.transaccionSeleccionado.numMes = 0;
    this.transaccionSeleccionado.numProducto = 0;
    this.transaccionSeleccionado.fechaInicio = this.transaccionSeleccionado.fechaFin;
    this.transaccionSeleccionado.estado = "R";
    this.showDetail = true;
  }

  openClonarDetail(transaccion: Transaccion) {
    this.transaccionSeleccionado = transaccion;
    this.transaccionSeleccionado.estado = "C";
    this.showDetail = true;
  }

  openRemoverDetail(transaccion: Transaccion) {
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
          this.transaccionService.eliminarTransaccionPorId(transaccion.codigo).subscribe({
            next: (response) => {
              this.listarTransaccion();
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

  closeDetail($event) {
    this.showDetail = $event;
    this.transaccionSeleccionado = null;
  }

  // Contar los caracteres de la cedula para activar boton <Buscar>
  onKey(event) {
    if (event.target.value.length != 10) {
      this.resetTheForm();
    } else {
      this.listarTransaccion();
    }
  }

  resetTheForm(): void {
    this.listaTransaccion = null;
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
          this.listarTransaccionACaducarse();
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
    this.transaccionService.enviarCorreo(this.reporteDTO['data']).subscribe({
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

  async enviarWhatsapp(ele: Transaccion) {
    this.seEnvioWhatsapp = true;
    let nombreCliente = ele.nombreCliente;
    let descripcionProducto = ele.descripcionProducto;
    let fechaFin = ele.fechaFin;
    this.mensajeCaduca = "<b>*Mensaje Automático*</b> Estimado(a) " + nombreCliente + " el servicio de " + descripcionProducto + " que tiene contratado con nosotros está por caducar el " + fechaFin + ", favor su ayuda confirmando si desea renovarlo, caso contrario el día de corte procederemos con la suspención del mismo... Un excelente dia, tarde o noche....";
    this.celularEnvioWhatsapp = this.codigoPostal + ele.celular.substring(1, 10);
    var api = "https://script.google.com/macros/s/AKfycbyoBhxuklU5D3LTguTcYAS85klwFINHxxd-FroauC4CmFVvS0ua/exec";
    var payload = {
      "op": "registermessage", "token_qr": this.token, "mensajes": [
        { "numero": this.celularEnvioWhatsapp, "mensaje": this.mensajeCaduca }
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

  async enviarWhatsappApi(ele: Transaccion) {
    this.seEnvioWhatsapp = true;
    this.mensajeCaduca = "*Mensaje Automático* Estimado(a) " + ele.nombreCliente + " el servicio de " + ele.descripcion + " que tiene contratado con nosotros está por caducar el " + ele.fechaFin + ", favor su ayuda confirmando si desea renovarlo, caso contrario el día de corte procederemos con la suspención del mismo... Un excelente dia, tarde o noche....";
    this.celularEnvioWhatsapp = this.codigoPostal + ele.celular.substring(1, 10);

    this.transaccionService.enviarMensajeWhatsapp(this.celularEnvioWhatsapp, this.mensajeCaduca).subscribe({
      next: async (response) => {
        this.mensajeService.mensajeCorrecto('Las notificaciones se enviaron con éxito...');
      },
      error: (error) => {
        this.mensajeService.mensajeError('Ha habido un problema al enviar las notificaciones ' + error);
      }
    });
  }

  compararCliente(o1, o2) {
    return o1 === undefined || o2 === undefined || o2 === null ? false : o1.codigo === o2.codigo;
  }
  /* Variables del html, para receptar datos y validaciones*/
  get descripcionField() {
    return this.formTransaccion.get('descripcion');
  }
  get fechaInicioField() {
    return this.formTransaccion.get('fechaInicio');
  }
  get fechaFinField() {
    return this.formTransaccion.get('fechaFin');
  }
  get claveCuentaField() {
    return this.formTransaccion.get('claveCuenta');
  }
  get codClienteField() {
    return this.formTransaccion.get('codCliente');
  }
}
