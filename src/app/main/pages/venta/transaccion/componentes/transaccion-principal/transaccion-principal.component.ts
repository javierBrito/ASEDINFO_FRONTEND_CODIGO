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
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { Cliente } from 'app/main/pages/compartidos/modelos/Cliente';
import { ClienteService } from '../../../cliente/servicios/cliente.service';
import { Modulo } from 'app/main/pages/compartidos/modelos/Modulo';
import { Operacion } from 'app/main/pages/compartidos/modelos/Operacion';
import { ReporteDTO } from 'app/main/pages/compartidos/modelos/ReporteDTO.model';
import { Parametro } from 'app/main/pages/compartidos/modelos/Parametro';
import moment from 'moment';
import { HttpParameterCodec, HttpUrlEncodingCodec } from "@angular/common/http";
import { CuentaClave } from 'app/main/pages/compartidos/modelos/CuentaClave';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  @ViewChild("modalCuentaClave", { static: false }) modalCuentaClave: TemplateRef<any>;

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
  public enviarNotificacionIndividual: boolean;
  public seEnvioWhatsapp: boolean;
  public respuestaEnvioWhatsapp: string;
  public token: string;
  public celular: string;
  public claveCuenta: string;
  public codCliente: number;
  public nombreProceso: string;
  public procesoListarPor: string;
  public displayNoneAcciones: string;

  /*LISTAS*/
  public listaTransaccion: Transaccion[] = [];
  public listaTransaccionAux: Transaccion[] = [];
  public listaAplicacion: Aplicacion[] = [];
  public listaPeriodoRegAniLec: any[];
  public listaCliente: Cliente[];
  public listaCuentaClave: CuentaClave[];

  /*TABS*/
  public selectedTab: number;

  /*OBJETOS*/
  private currentUser: LoginAplicacion;
  private sede: Sede;
  private persona: Persona;
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
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal
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
    moment.locale("es");
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
      itemsRegistrosNF: new FormControl(this.itemsRegistros),
    });
    this.obtenerParametros();
    //this.obtenerTransaccionACaducarse();
    this.listarTransaccionACaducarse();
    this.enviarNotificacionIndividual = false;
  }

  verListaCuentaClave = async (codParticipante: number) => {
    //this.listaCuentaClave = [];
    await this.listarCuentaClavePorTransaccion(codParticipante);
    await this.verModalCuentaClave();
  }

  listarCuentaClavePorTransaccion(codParticipante: number) {
    return new Promise((resolve, rejects) => {
      this.transaccionService.listarCuentaClavePorTransaccion(codParticipante).subscribe({
        next: (respuesta) => {
          this.listaCuentaClave = respuesta['listado'];
          resolve(respuesta);
        }, error: (error) => {
          rejects("Error");
          console.log("Error =", error);
        }
      })
    })
  }

  async verModalCuentaClave() {
    this.modalService.open(this.modalCuentaClave).result.then(r => {
      console.log("Tu respuesta ha sido: " + r);
    }, error => {
      console.log(error);
    });
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
    await this.confirmarEnviarNotificacion(null);
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
    this.descripcion = transaccionDescripcionTemp?.descripcion;
    this.fechaInicio = transaccionDescripcionTemp?.fechaInicio;
    this.fechaFin = transaccionDescripcionTemp?.fechaFin;
    if (this.claveCuenta?.length != 0) {
      this.procesoListarPor = "ClaveCuenta";
      this.listarTransaccionPorClaveCuenta();
      return;
    }
    if (this.codCliente != 0 && Number(this.codCliente) + "" != "NaN") {
      this.procesoListarPor = "Cliente";
      this.listarTransaccionPorCliente();
      return;
    }
    if (this.descripcion?.length != 0) {
      this.procesoListarPor = "Descripcion";
      this.listarTransaccionPorDescripcion();
      return;
    }
    /*
    if (this.fechaInicio?.length != 0 && this.fechaFin?.length != 0) {
      this.procesoListarPor = "Fechas";
      this.listarTransaccionPorRangoFechas();
      return;
    }
    */
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
    this.transaccionService.listarTransaccionPorRangoFechas(this.fechaInicio, this.fechaFin).subscribe(
      (respuesta) => {
        this.listaTransaccion = respuesta['listado'];
        if (this.listaTransaccion?.length > 0) {
          this.displayNoneAcciones = 'none';
          this.mostrarListaTransaccion();
        }
      }
    )
  }

  mostrarListaTransaccion = async () => {
    this.page = 1;
    let montoTotal = 0;
    for (const ele of this.listaTransaccion) {
      ele.colorFila = "green";
      ele.visibleBoton = "none";
      ele.colorColumna = "white";
      ele.fechaInicio = dayjs(ele.fechaInicio).format("YYYY-MM-DD");
      ele.fechaFin = dayjs(ele.fechaFin).format("YYYY-MM-DD");
      if (ele?.fechaCambia != null) {
        ele.fechaCambia = dayjs(ele.fechaCambia).format("YYYY-MM-DD");
        // Calcular la diferencia en días de la fecha actual y final de la transacción
        var diff1 = new Date(ele.fechaCambia).getTime() - new Date(this.fechaHoy).getTime();
        var numDias1 = diff1 / (1000 * 60 * 60 * 24);

        if (numDias1 <= 0) {
          ele.colorColumna = "yellow";
        }
      }
      this.fechaFinMensaje = dayjs(ele.fechaFin).format("YYYY-MM-DD");

      // Calcular la diferencia en días de la fecha actual y final de la transacción
      var diff = new Date(ele.fechaFin).getTime() - new Date(this.fechaHoy).getTime();
      var numDias = diff / (1000 * 60 * 60 * 24);

      // ele.fechaFin <= this.fechaHoy
      ele.numDiasRenovar = numDias;
      if (!(numDias > 0 && numDias > 5)) {
        ele.colorFila = "red";
        ele.visibleBoton = ""
      }

      if (ele?.prefijoTelefonico == null || ele?.prefijoTelefonico == "") {
        ele.prefijoTelefonico = '593';
      }

      // Si transaccion tiene estado='A' sumar
      if (ele?.estado == "A") {
        montoTotal = montoTotal + ele?.monto;
      }

      // Confirmar si se envia o no las Notificaciones
      if (this.enviarNotificacion) {
        this.enviarWhatsappApi(ele);
      }
    }
    if (this.displayNoneAcciones == 'none' && montoTotal > 0) {
      this.transaccion = new Transaccion({
        nombreCliente: "Totales",
        desProducto: "",
        claveCuenta: "",
        clave: "",
        monto: montoTotal.toFixed(2),
        numProducto: "",
        numDiasRenovar: "",
        displayNoneListaCuentaClave: "none",
      });
      this.listaTransaccion.push(this.transaccion);
      this.displayNoneAcciones = '';
    }
    if (this.enviarNotificacion) {
      if (this.seEnvioWhatsapp) {
        this.mensajeService.mensajeCorrecto('Las notificaciones se enviaron con éxito...');
      } else {
        this.mensajeService.mensajeError('Error... ' + this.respuestaEnvioWhatsapp + ' ingrese nuevo token');
      }
    }
  }
  
  obtenerTotalesPorFecha() {
    this.listaTransaccion = [];
    this.displayNoneAcciones = '';
    // Receptar datos de formTransaccion.value
    let transaccionDescripcionTemp = this.formTransaccion.value;
    this.fechaInicio = transaccionDescripcionTemp?.fechaInicio;
    this.fechaFin = transaccionDescripcionTemp?.fechaFin;
    if (this.fechaInicio?.length != 0 && this.fechaFin?.length != 0) {
      this.procesoListarPor = "Fechas";
      this.listarTransaccionPorRangoFechas();
    }
  }

  listaTransaccionActualizada(event) {
    this.listaTransaccion = event;
  }

  openDetail(codjornada) {
    this.showDetail = true;
  }

  openEditarDetail(transaccion: Transaccion) {
    this.nombreProceso = "EDITAR";
    this.transaccionSeleccionado = transaccion;
    this.showDetail = true;
  }

  openRenovarDetail(transaccion: Transaccion) {
    this.nombreProceso = "RENOVAR";
    this.transaccionSeleccionado = transaccion;
    this.transaccionSeleccionado.numMes = 0;
    this.transaccionSeleccionado.numProducto = 0;
    this.transaccionSeleccionado.fechaInicio = this.transaccionSeleccionado.fechaFin;
    this.transaccionSeleccionado.estado = "R";
    this.showDetail = true;
  }

  openClonarDetail(transaccion: Transaccion) {
    this.nombreProceso = "CLONAR";
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

  openNotificarDetail = async (transaccion: Transaccion) => {
    this.enviarNotificacion = false;
    this.enviarNotificacionIndividual = true;
    await this.confirmarEnviarNotificacion(transaccion);
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

  async confirmarEnviarNotificacion(transaccion: Transaccion) {
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
          if (this.enviarNotificacionIndividual) {
            this.seEnvioWhatsapp = false;
            this.enviarWhatsappApi(transaccion);
            if (this.seEnvioWhatsapp) {
              this.mensajeService.mensajeCorrecto('Las notificación se enviaron con éxito...');
            } else {
              this.mensajeService.mensajeError('Error... ' + this.respuestaEnvioWhatsapp + ' ingrese nuevo token');
            }
          } else {
            this.enviarNotificacion = true;
            this.listarTransaccionACaducarse();
          }
        } else if (resultado.isDismissed) {
          console.log("No envia notificaciones");
        }
      });
  }

  // Tomar el valor de numero de filas y reiniciar proceso
  blurNumeroFilas(event) {
    if (event.target.value.length != 0) {
      this.itemsRegistros = event.target.value;
    }
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

  async getBase64ImageFromUrl(imageUrl) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();

    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.addEventListener("load", function () {
        resolve(reader.result);
      }, false);

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }

  toDataURL = async (url) => {
    console.log("Downloading image...");
    var res = await fetch(url);
    var blob = await res.blob();

    const result = await new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.addEventListener("load", function () {
        resolve(reader.result);
      }, false);

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })

    return result
  };

  async enviarWhatsappApi(transaccion: Transaccion) {
    let imageSrcString = this.toDataURL('./assets/images/trofeo/trofeo1.png/')

    //let fechaFin = dayjs(transaccion.fechaFin).format("DD-MM-YYYY");
    let dia = moment(transaccion?.fechaFin).format("D");
    let mes = moment(transaccion?.fechaFin).format("MMMM");
    let año = moment(transaccion?.fechaFin).format("YYYY");
    //transaccion.numDiasRenovar = transaccion?.numDiasRenovar == 0 ? 1 :transaccion?.numDiasRenovar; 
    //this.mensajeCaduca = "*Mensaje Automático* Estimado(a) " + transaccion.nombreCliente + " el servicio de " + transaccion.descripcion + " que tiene contratado con nosotros está por caducar el " + fechaFin + ", favor su ayuda confirmando si desea renovarlo, caso contrario el día de corte procederemos con la suspención del mismo... Un excelente dia, tarde o noche....";
    this.mensajeCaduca = "*Notificación Automática*%0aEstimado(a) " + transaccion.nombreCliente
      + " el servicio de " + transaccion.descripcion
      + " que tiene contratado con nosotros está por caducar en "
      + transaccion?.numDiasRenovar + " día(s) el " + dia + " de " + mes + " de " + año
      + ", favor su ayuda confirmando la renovación con el pago correspondiente para poder registrarlo, caso contrario el día de corte procederemos con la suspención del servicio... Un excelente dia, tarde o noche....";

    // Codificar el mensaje para asegurar que los caracteres especiales se manejen correctamente
    const codec = new HttpUrlEncodingCodec();
    //const encodedValue = codec.encodeValue(mensajeNotificacion); // Encodes the value as 'Hello%20World%21'
    const decodedValue = codec.decodeValue(this.mensajeCaduca); // Decodes the value as 'Hello World!'

    // Validar prefijo telefonico
    if (transaccion?.prefijoTelefonico == "" || transaccion?.prefijoTelefonico == null) {
      transaccion.prefijoTelefonico = "593";
    }
    this.celularEnvioWhatsapp = transaccion?.prefijoTelefonico + transaccion?.celular.substring(1, 15).trim();
    // Enviar mensaje
    this.transaccionService.enviarMensajeWhatsappAI(this.celularEnvioWhatsapp, decodedValue).subscribe({
      next: async (response) => {
        this.seEnvioWhatsapp = true;
        this.mensajeService.mensajeCorrecto('Las notificaciones se enviaron con éxito...');
      },
      error: (error) => {
        this.mensajeService.mensajeError('Ha habido un problema al enviar las notificaciones ' + error);
      }
    });
    // Enviar imagen
    /*
    this.transaccionService.enviarImagenWhatsappAI(this.celularEnvioWhatsapp, decodedValue, imageSrcString).subscribe({
      next: async (response) => {
        this.seEnvioWhatsapp = true;
        this.mensajeService.mensajeCorrecto('Las notificaciones se enviaron con éxito...');
      },
      error: (error) => {
        this.mensajeService.mensajeError('Ha habido un problema al enviar las notificaciones ' + error);
      }
    });
    */
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
  get itemsRegistrosNFField() {
    return this.formTransaccion.get('itemsRegistrosNF');
  }
}
