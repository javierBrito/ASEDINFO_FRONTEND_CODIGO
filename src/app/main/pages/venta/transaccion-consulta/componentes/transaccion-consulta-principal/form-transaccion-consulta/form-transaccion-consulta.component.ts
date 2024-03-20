import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Sede } from 'app/auth/models/sede';
import { Transaccion } from 'app/main/pages/compartidos/modelos/Transaccion';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { DetailComponent } from 'app/main/pages/venta/transaccion/componentes/detail/detail.component';
import { TransaccionConsultaService } from '../../../servicios/transaccion-consulta.service';
import { SedeService } from 'app/main/pages/seguridad/sede/servicios/sede.service';
import dayjs from "dayjs";
import { ClienteService } from 'app/main/pages/venta/cliente/servicios/cliente.service';
import { ProductoService } from 'app/main/pages/catalogo/producto/servicios/producto.service';
import { Cliente } from 'app/main/pages/compartidos/modelos/Cliente';
import { Producto } from 'app/main/pages/compartidos/modelos/Producto';
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { Modulo } from 'app/main/pages/compartidos/modelos/Modulo';
import { Operacion } from 'app/main/pages/compartidos/modelos/Operacion';
import moment from 'moment';
import { HttpUrlEncodingCodec } from '@angular/common/http';
import { CuentaClave } from 'app/main/pages/compartidos/modelos/CuentaClave';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-form-transaccion-consulta',
  templateUrl: './form-transaccion-consulta.component.html',
  styleUrls: ['./form-transaccion-consulta.component.scss']
})
export class FormTransaccionConsultaComponent implements OnInit {
  /*SPINNER*/
  public load_btn: boolean;

  /*OUTPUT ENVIAN*/
  @Output() close: EventEmitter<boolean>;
  @Output() listaTransaccion: EventEmitter<any>;

  /*INPUT RECIBEN*/
  @Input() listaTransaccionChild: any;
  @Input() transaccionEditar: Transaccion;
  @Input() codigoChild: number;
  @Input() descripcionChild: string;
  @Input() nombreProcesoChild: string;

  /*MODALES*/
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;
  @ViewChild(DetailComponent, { static: false }) parentDetail: DetailComponent;
  @ViewChild("modalCuentaClave", { static: false }) modalCuentaClave: TemplateRef<any>;

  /*VARIABLES */
  public showDetail: boolean;
  private amieRegex: string;
  private currentUser: any;
  private numMes: number = 0;
  private numDiasExtra: number = 0;
  private precio: number = 0;
  private numProducto: number = 0;
  private monto: number;
  private numExistenciaActual: number = 0;
  public codProducto: number;
  public nemonicoModulo: string = 'VEN';
  public nemonicoOperacion: string = 'CRE';
  public fechaHoy: string = dayjs(new Date).format("YYYY-MM-DD");
  public nombreProceso: string;
  public prefijoTelefonico: string;
  public celular: string;
  public nombreCliente: string;
  public siActualizaCuentaClave: boolean;
  public codTransaccion: number = 0;

  /*FORMULARIOS*/
  public formTransaccionConsulta: FormGroup;

  /*OBJETOS*/
  public transaccion: Transaccion;
  public persona: Persona;
  public producto: Producto;
  public modulo: Modulo;
  public operacion: Operacion;
  public cliente: Cliente;
  public listaSede: Sede[];
  public listaCliente: Cliente[];
  public listaProducto: Producto[];
  public listaRespuesta = [
    { valor: "SI" },
    { valor: "NO" },
  ];
  public transaccionEditarAux: Transaccion;
  public listaCuentaClave: CuentaClave[] = [];
  public listaCuentaClaveAux: CuentaClave[] = [];
  public listaCuentaClaveTemp: CuentaClave[] = [];
  public cuentaClave: CuentaClave;


  /*CONSTRUCTOR*/
  constructor(
    private transaccionConsultaService: TransaccionConsultaService,
    private sedeService: SedeService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private personaService: PersonaService,
    private modalService: NgbModal
  ) {
    this.load_btn = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.sede = this.currentUser.sede;
    //this.amieRegex = this.patternAmie(this.sede.nombre);
    this.close = new EventEmitter<boolean>();
    this.listaTransaccion = new EventEmitter<any>();
    this.showDetail = true;
    /*LISTAS*/
    this.listarClienteActivoOrdenNombre();
    this.listarProducto();
  }

  ngOnInit() {
    this.buscarModuloPorNemonico();
    this.buscarOperacionPorNemonico();
    this.nombreProceso = this.nombreProcesoChild;
    if (this.transaccionEditar) {
      this.codTransaccion = this.transaccionEditar?.codigo;
      this.listarCuentaClavePorTransaccionActivo(this.codTransaccion);
      // Datos para envio de notificaciones
      this.prefijoTelefonico = this.transaccionEditar?.prefijoTelefonico,
      this.celular = this.transaccionEditar?.celular,
      this.nombreCliente = this.transaccionEditar?.nombreCliente,
      this.transaccionEditarAux = this.transaccionEditar;
      this.codProducto = this.transaccionEditar?.codProducto;
      this.numMes = this.transaccionEditar?.numMes;
      this.numDiasExtra = this.transaccionEditar?.numDiasExtra;
      this.precio = this.transaccionEditar?.precio;
      this.numProducto = this.transaccionEditar?.numProducto;
      this.numExistenciaActual = this.transaccionEditar?.numExistenciaActual;
      this.formTransaccionConsulta = this.formBuilder.group({
        codCliente: new FormControl(this.transaccionEditar?.codCliente, Validators.required),
        codProducto: new FormControl(this.transaccionEditar?.codProducto, Validators.required),
        descripcion: new FormControl(this.transaccionEditar?.descripcion, Validators.required),
        claveCuenta: new FormControl(this.transaccionEditar?.claveCuenta),
        clave: new FormControl(this.transaccionEditar?.clave),
        precio: new FormControl(this.transaccionEditar?.precio, Validators.required),
        fechaInicio: new FormControl(dayjs(this.transaccionEditar?.fechaInicio).format("YYYY-MM-DD"), Validators.compose([Validators.required, ,])),
        fechaFin: new FormControl(dayjs(this.transaccionEditar?.fechaFin).format("YYYY-MM-DD"), Validators.compose([Validators.required, ,])),
        fechaCambia: new FormControl(dayjs(this.transaccionEditar?.fechaCambia).format("YYYY-MM-DD")),
        numProducto: new FormControl(this.transaccionEditar?.numProducto, Validators.required),
        numExistenciaActual: new FormControl(this.transaccionEditar?.numExistenciaActual),
        numMes: new FormControl(this.transaccionEditar?.numMes),
        numDiasExtra: new FormControl(this.transaccionEditar?.numDiasExtra),
        precioMayoreo: new FormControl(this.transaccionEditar?.precioMayoreo, Validators.required),
        monto: new FormControl(this.transaccionEditar?.monto),
        prefijoTelefonico: new FormControl(this.transaccionEditar?.prefijoTelefonico),
        celular: new FormControl(this.transaccionEditar?.celular),
      })
      //AQUI TERMINA ACTUALIZAR
    } else {
      this.formTransaccionConsulta = this.formBuilder.group({
        codCliente: new FormControl('', Validators.required),
        codProducto: new FormControl('', Validators.required),
        descripcion: new FormControl('', Validators.required),
        claveCuenta: new FormControl(''),
        clave: new FormControl(''),
        precio: new FormControl('', Validators.required),
        fechaInicio: new FormControl(dayjs(new Date).format("YYYY-MM-DD"), Validators.required),
        fechaFin: new FormControl(dayjs(new Date).format("YYYY-MM-DD"), Validators.required),
        fechaCambia: new FormControl(),
        numProducto: new FormControl('', Validators.required),
        numExistenciaActual: new FormControl(''),
        numMes: new FormControl(''),
        numDiasExtra: new FormControl(''),
        precioMayoreo: new FormControl(''),
        monto: new FormControl(''),
        prefijoTelefonico: new FormControl(""),
        celular: new FormControl(""),
      })
    }
  }

  buscarModuloPorNemonico() {
    this.transaccionConsultaService.buscarModuloPorNemonico(this.nemonicoModulo).subscribe(
      (respuesta) => {
        this.modulo = respuesta['objeto'];
      }
    )
  }

  buscarOperacionPorNemonico() {
    this.transaccionConsultaService.buscarOperacionPorNemonico(this.nemonicoOperacion).subscribe(
      (respuesta) => {
        this.operacion = respuesta['objeto'];
      }
    )
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

  listarProducto() {
    this.productoService.listarProductoActivo(this.nemonicoModulo).subscribe(
      (respuesta) => {
        this.listaProducto = respuesta['listado'];
      }
    );
  }

  buscarProductoPorCodigo() {
    // Receptar el codProducto de formTransaccionConsulta.value
    let formTransaccionConsultaTemp = this.formTransaccionConsulta.value;
    this.codProducto = formTransaccionConsultaTemp?.codProducto;
    this.productoService.buscarProductoPorCodigo(this.codProducto).subscribe(
      (respuesta) => {
        this.producto = respuesta['objeto'];
        this.formTransaccionConsulta.controls.precio.setValue(this.producto?.precioCosto);
        this.formTransaccionConsulta.controls.precioMayoreo.setValue(this.producto?.precioMayoreo);
        this.formTransaccionConsulta.controls.numExistenciaActual.setValue(this.producto?.numExistenciaActual);
        this.numExistenciaActual = this.producto?.numExistenciaActual;
        this.precio = this.producto?.precioCosto;
      }
    );
  }

  buscarClientePorCodigo() {
    // Receptar el codCliente de formTransaccionConsulta.value
    let formTransaccionConsultaTemp = this.formTransaccionConsulta.value;
    this.clienteService.buscarClientePorCodigo(formTransaccionConsultaTemp?.codCliente).subscribe(
      (respuesta) => {
        this.cliente = respuesta['objeto'];
        this.prefijoTelefonico = this.cliente?.prefijoTelefonico;
        this.celular = this.cliente?.celular;
        this.nombreCliente = this.cliente?.nombrePersona;
        this.formTransaccionConsulta.controls.prefijoTelefonico.setValue(this.cliente?.prefijoTelefonico);
        this.formTransaccionConsulta.controls.celular.setValue(this.cliente?.celular);
      }
    );
  }

  async listarTransaccionPorDescripcion() {
    if (this.descripcionChild?.length != 0) {
      this.transaccionConsultaService.listarTransaccionPorDescripcion(this.descripcionChild).subscribe(
        (respuesta) => {
          this.listaTransaccionChild = respuesta['listado'];
          if (this.listaTransaccionChild?.length > 0) {
            this.mostrarListaTransaccion();
          }
        }
      )
    } else {
      this.transaccionConsultaService.listarTransaccionActivo(this.modulo?.nemonico).subscribe(
        (respuesta) => {
          this.listaTransaccionChild = respuesta['listado'];
          if (this.listaTransaccionChild?.length > 0) {
            this.mostrarListaTransaccion();
          }
        }
      )
    };
    this.listaTransaccion.emit(this.listaTransaccionChild);
  }

  mostrarListaTransaccion() {
    for (const ele of this.listaTransaccionChild) {
      ele.colorFila = "green";
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
      // Calcular la diferencia en días de la fecha actual y final de la transacción
      var diff = new Date(ele.fechaFin).getTime() - new Date(this.fechaHoy).getTime();
      var numDias = diff / (1000 * 60 * 60 * 24);

      // ele.fechaFin <= this.fechaHoy
      if (!(numDias > 0 && numDias > 5)) {
        ele.colorFila = "red";
      }

      // Obtener cliente
      this.clienteService.buscarClientePorCodigo(ele.codCliente).subscribe(
        (respuesta) => {
          this.cliente = respuesta['objeto'];
          ele.cliente = this.cliente;
          // Obtener persona
          this.personaService.buscarPersonaPorCodigo(ele.cliente.codPersona).subscribe(
            (respuesta) => {
              this.persona = respuesta['objeto'];
              ele.cliente.persona = this.persona;
              this.listaTransaccion.emit(this.listaTransaccionChild);
            }
          )
        }
      )
      // Obtener producto
      this.productoService.buscarProductoPorCodigo(ele.codProducto).subscribe(
        (respuesta) => {
          this.producto = respuesta['objeto'];
          ele.producto = this.producto;
          this.listaTransaccion.emit(this.listaTransaccionChild);
        }
      )
    }
  }

  patternAmie(amie: string) {
    const valorEncontrar = amie
    const regExp = new RegExp('([0-9])\\w+')
    const amieFiltrado = valorEncontrar.match(regExp)
    return amieFiltrado['0']
  }

  addRegistro() {
    if (this.formTransaccionConsulta?.valid) {
      let transaccionTemp = this.formTransaccionConsulta.value;

      let fechaFinDate = new Date(dayjs(transaccionTemp?.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS"));
      let fechaFinString = dayjs(transaccionTemp?.fechaFin).format("YYYY-MM-DD HH:mm:ss.SSS");
      if (transaccionTemp?.numMes != "" && transaccionTemp?.numMes != 0) {
        this.numMes = transaccionTemp?.numMes;
        fechaFinDate.setMonth(fechaFinDate.getMonth() + this.numMes)
        fechaFinString = fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate();
      }
      if (transaccionTemp?.numDiasExtra != "" && transaccionTemp?.numDiasExtra != 0) {
        this.numDiasExtra = transaccionTemp?.numDiasExtra;
        // Sumar los días a la fecha final
        fechaFinDate.setDate(fechaFinDate.getDate() + this.numDiasExtra);
        fechaFinString = dayjs(fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate()).format("YYYY-MM-DD");
      }
      let fechaCambia = "";
      if (transaccionTemp?.fechaCambia != null && transaccionTemp?.fechaCambia != "" && transaccionTemp?.fechaCambia != 'Invalid Date') {
        fechaCambia = dayjs(transaccionTemp?.fechaCambia).format("YYYY-MM-DD HH:mm:ss.SSS");
      }
      this.transaccion = new Transaccion({
        codigo: 0,
        codCliente: transaccionTemp?.codCliente,
        codProducto: this.codProducto,
        codModulo: this.modulo?.codigo,
        codOperacion: this.operacion?.codigo,
        descripcion: transaccionTemp?.descripcion,
        claveCuenta: transaccionTemp?.claveCuenta,
        clave: transaccionTemp?.clave,
        precio: transaccionTemp?.precio,
        monto: transaccionTemp?.monto,
        numProducto: transaccionTemp?.numProducto,
        numMes: this.numMes,
        numDiasExtra: this.numDiasExtra,
        fechaInicio: dayjs(transaccionTemp?.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS"),
        fechaCambia: fechaCambia,
        fechaFin: dayjs(fechaFinString).format("YYYY-MM-DD HH:mm:ss.SSS"),
        fechaRegistra: dayjs(new Date).format("YYYY-MM-DD HH:mm:ss.SSS"),
        numDiasRenovar: 0,
        estado: 'A',
        prefijoTelefonico: this.prefijoTelefonico,
        celular: this.celular,
        nombreCliente: this.nombreCliente,
      });
    }
    if (this.transaccionEditar) {
      this.transaccion['data'].codigo = this.transaccionEditar.codigo;
      // Guardamos registro nuevo con estado A al realizar (renovacion=R) o C (Clonar=C)
      if (this.transaccionEditar?.estado == "R" || this.transaccionEditar?.estado == "C") {
        this.transaccion['data'].codigo = 0;
      }
      this.transaccionConsultaService.guardarTransaccion(this.transaccion['data']).subscribe({
        next: async (response) => {
          this.transaccion = response['objeto'];
          // Tratar listaCuentaClave
          if (this.listaCuentaClave.length > 0 && this.siActualizaCuentaClave) {
            for (let ele of this.listaCuentaClave) {
              ele.codigo = 0;
              ele.codTransaccion = this.transaccion?.codigo;
            }
            this.transaccionConsultaService.guardarListaCuentaClave(this.listaCuentaClave).subscribe({
              next: async (response) => {
                //this.mensajeService.mensajeCorrecto('Se ha agregado la lista correctamente...');
              },
              error: (error) => {
                this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
              }
            });
          };
          // Enviar notificaciones respectivas cuando es R o C
          if (this.nombreProceso == "RENOVAR" || this.nombreProceso == "CLONAR") {
            // Enviar Notificaciones
            this.enviarWhatsappApi(this.transaccion);
          }
          // Actualizamos registro existente con R de renovacion 
          if (this.transaccionEditar?.estado == "R") {
            this.transaccionEditarAux.fechaInicio = dayjs(this.transaccionEditarAux.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS")
            this.transaccionEditarAux.fechaFin = dayjs(this.transaccionEditarAux.fechaFin).format("YYYY-MM-DD HH:mm:ss.SSS")
            if (this.transaccionEditarAux?.fechaCambia != null && this.transaccionEditarAux?.fechaCambia != "" && this.transaccionEditarAux?.fechaCambia != 'Invalid Date') {
              this.transaccionEditarAux.fechaCambia = dayjs(this.transaccionEditarAux.fechaCambia).format("YYYY-MM-DD HH:mm:ss.SSS")
            } else {
              this.transaccionEditarAux.fechaCambia = "";
            }
            this.transaccionConsultaService.guardarTransaccion(this.transaccionEditarAux).subscribe({
              next: async (response) => {
                this.transaccion = response['objeto'];
                this.listarTransaccionPorDescripcion();
                this.mensajeService.mensajeCorrecto('Se ha renovado el registro correctamente...');
                this.parentDetail.closeDetail();
              },
              error: (error) => {
                this.mensajeService.mensajeError('Ha habido un problema al renovar el registro...');
                this.parentDetail.closeDetail();
              }
            });
          }
          // Recargamos la lista
          this.listarTransaccionPorDescripcion();
          this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
          this.parentDetail.closeDetail();
          //}
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    } else {
      this.transaccionConsultaService.guardarTransaccion(this.transaccion['data']).subscribe({
        next: async (response) => {
          this.transaccion = response['objeto'];
          // Tratar listaCuentaClave
          if (this.listaCuentaClave.length > 0 && this.siActualizaCuentaClave) {
            for (let ele of this.listaCuentaClave) {
              ele.codTransaccion = this.transaccion?.codigo;
            }
            this.transaccionConsultaService.guardarListaCuentaClave(this.listaCuentaClave).subscribe({
              next: async (response) => {
                //this.mensajeService.mensajeCorrecto('Se ha agregado la lista correctamente...');
              },
              error: (error) => {
                this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
              }
            });
          };
          // Enviar Notificaciones
          this.enviarWhatsappApi(this.transaccion);

          this.listarTransaccionPorDescripcion();
          this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
          this.parentDetail.closeDetail();
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    }
  }

  closeDetail($event) {
    this.close.emit($event);
  }

  compararProducto(o1, o2) {
    return o1 === undefined || o2 === undefined || o2 === null ? false : o1.codigo === o2.codigo;
  }

  compararCliente(o1, o2) {
    return o1 === undefined || o2 === undefined || o2 === null ? false : o1.codigo === o2.codigo;
  }

  // Tomar el valor de meses para obtener la fecha fin y el monto
  onKeyMes(event) {
    if (event.target.value.length != 0) {
      let transaccionTemp = this.formTransaccionConsulta.value;
      let fechaFinDate = new Date(dayjs(transaccionTemp?.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS"));
      var fechaFinString = "";
      this.numMes = Number(event.target.value);
      fechaFinDate.setMonth(fechaFinDate.getMonth() + this.numMes);
      fechaFinString = dayjs(fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate()).format("YYYY-MM-DD");
      this.formTransaccionConsulta.controls.fechaFin.setValue(fechaFinString);

      // Calcular monto de la transacción
      this.calcularMonto();
    }
  }

  // Tomar el valor de meses para obtener la fecha fin y el monto
  onKeyDiasExtra(event) {
    if (event.target.value.length != 0) {
      let transaccionTemp = this.formTransaccionConsulta.value;
      let fechaFinDate = new Date(dayjs(transaccionTemp?.fechaFin).format("YYYY-MM-DD HH:mm:ss.SSS"));
      var fechaFinString = "";
      this.numDiasExtra = Number(event.target.value);
      // Sumar los días a la fecha final
      fechaFinDate.setDate(fechaFinDate.getDate() + this.numDiasExtra);
      fechaFinString = dayjs(fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate()).format("YYYY-MM-DD");
      this.formTransaccionConsulta.controls.fechaFin.setValue(fechaFinString);

      // Calcular monto de la transacción
      this.calcularMonto();
    }
  }
  // Tomar el valor de meses para obtener la fecha fin y el monto
  onKeyFechaInicio(event) {
    if (event.target.value.length != 0) {
      let transaccionTemp = this.formTransaccionConsulta.value;
      let fechaFinDate = new Date(dayjs(transaccionTemp?.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS"));
      var fechaFinString = "";
      this.numMes = transaccionTemp?.numMes;
      fechaFinDate.setMonth(fechaFinDate.getMonth() + this.numMes);
      fechaFinString = dayjs(fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate()).format("YYYY-MM-DD");
      this.formTransaccionConsulta.controls.fechaFin.setValue(fechaFinString);

      // Calcular monto de la transacción
      this.calcularMonto();
    }
  }

  changeFechaInicio(object) {
    let transaccionTemp = this.formTransaccionConsulta.value;
    let fechaFinDate = new Date(dayjs(transaccionTemp?.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS"));
    var fechaFinString = "";
    this.numMes = transaccionTemp?.numMes;
    fechaFinDate.setMonth(fechaFinDate.getMonth() + this.numMes);
    fechaFinString = dayjs(fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate()).format("YYYY-MM-DD");
    this.formTransaccionConsulta.controls.fechaFin.setValue(fechaFinString);

    // Calcular monto de la transacción
    this.calcularMonto();
  }

  // Tomar el valor de precio para obtener el monto
  onKeyPrecio(event) {
    if (event.target.value.length != 0) {
      this.precio = Number(event.target.value);

      // Calcular monto de la transacción
      this.calcularMonto();
    }
  }

  // Tomar el valor de precio para obtener el monto
  onKeyCantidad(event) {
    if (event.target.value.length != 0) {
      this.numProducto = Number(event.target.value);
      if (this.numProducto > this.numExistenciaActual) {
        this.mensajeService.mensajeError('La cantidad excede la esxistencia del producto...');
        this.formTransaccionConsulta.controls.numProducto.setValue(0);
      } else {
        // Calcular monto de la transacción
        this.calcularMonto();
      }
    }
  }

  calcularMonto() {
    this.monto = this.numMes * this.precio * this.numProducto;
    this.formTransaccionConsulta.controls.monto.setValue(this.monto);
  }

  async enviarWhatsappApi(transaccion: Transaccion) {
    // Obtener las n cuentas con su clave de la lista si los ahy
    let cuentaClaveNotifica = "";
    if (this.listaCuentaClave?.length > 0) {
      for (let cuentaClave of this.listaCuentaClave) {
        cuentaClaveNotifica += "%0a" + ((cuentaClave?.cuenta == null) || (cuentaClave?.cuenta == "") ? "" : "*" + cuentaClave?.cuenta + "*") + "  " + ((cuentaClave?.clave == null) || (cuentaClave?.clave == "") ? "" : "*" + cuentaClave?.clave + "*")
      }
    }

    let dia = moment(transaccion?.fechaFin).format("D");
    let mes = moment(transaccion?.fechaFin).format("MMMM");
    let año = moment(transaccion?.fechaFin).format("YYYY");
    let mensajeRenovaCaduca = "";
    let mensajeClaveCuenta = "";
    if (this.nombreProceso == "RENOVAR") {
      mensajeRenovaCaduca = " se ha renovado exitosamente hasta el ";
    } else {
      mensajeRenovaCaduca = " se ha registrado exitosamente hasta el ";
      mensajeClaveCuenta = "%0aRecuerde que su licencia/código o credenciales son las siguientes: "
        + "%0a" + ((transaccion?.claveCuenta == null) || (transaccion?.claveCuenta == "") ? " " : "*" + transaccion?.claveCuenta + "*") + "  " + ((transaccion?.clave == null) || (transaccion?.clave == "") ? " " : "*" + transaccion?.clave + "*") + cuentaClaveNotifica;
    }
    let mensajeNotificacion = "*Notificación Automática*%0aEstimado(a) " + transaccion?.nombreCliente
      + " el servicio de " + transaccion?.descripcion
      + mensajeRenovaCaduca
      + dia + " de " + mes + " de " + año
      + ", favor su ayuda en el caso de presentar inconvenientes notificarlos oportunamente por este medio... Un excelente dia, tarde o noche...."
      + mensajeClaveCuenta;

    // Codificar el mensaje para asegurar que los caracteres especiales se manejen correctamente
    const codec = new HttpUrlEncodingCodec();
    //const encodedValue = codec.encodeValue(mensajeNotificacion); // Encodes the value as 'Hello%20World%21'
    const decodedValue = codec.decodeValue(mensajeNotificacion); // Decodes the value as 'Hello World!'
    // Validar prefijo telefonico
    if (transaccion?.prefijoTelefonico == "" || transaccion?.prefijoTelefonico == null) {
      transaccion.prefijoTelefonico = "593";
    }
    let celularEnvioWhatsapp = transaccion?.prefijoTelefonico + transaccion?.celular.substring(1, 15).trim();
    // Enviar mensaje
    this.transaccionConsultaService.enviarMensajeWhatsappAI(celularEnvioWhatsapp, decodedValue).subscribe({
      next: async (response) => {
        this.mensajeService.mensajeCorrecto('Las notificación se envió con éxito...');
      },
      error: (error) => {
        this.mensajeService.mensajeError('Ha habido un problema al enviar la notificación ' + error);
      }
    });
  }

  listarCuentaClavePorTransaccionActivo(codParticipante: number) {
    return new Promise((resolve, rejects) => {
      this.transaccionConsultaService.listarCuentaClavePorTransaccion(codParticipante).subscribe({
        next: (respuesta) => {
          this.listaCuentaClave = respuesta['listado'];
          this.siActualizaCuentaClave = true;
          resolve(respuesta);
        }, error: (error) => {
          rejects("Error");
          console.log("Error =", error);
        }
      })
    })
  }

  procesarListaCuentaClave = async () => {
    //this.listaCuentaClave = [];
    await this.listarCuentaClavePorTransaccion(this.codTransaccion);
    await this.verModalCuentaClave();
  }

  listarCuentaClavePorTransaccion(codTransaccion: number) {
    return new Promise((resolve, rejects) => {
      if (this.listaCuentaClave.length > 0) {
        this.listaCuentaClaveTemp = this.listaCuentaClave;
      }
      this.transaccionConsultaService.listarCuentaClavePorTransaccion(codTransaccion).subscribe({
        next: (respuesta) => {
          this.listaCuentaClave = respuesta['listado'];
          if (this.listaCuentaClaveTemp.length > this.listaCuentaClave.length) {
            this.listaCuentaClave = this.listaCuentaClaveTemp;
          }
          let index = 0;
          if (this.listaCuentaClave.length > 0) {
            index = this.listaCuentaClave.length;
          }
          for (index; index < 20; index++) {
            this.cuentaClave = new CuentaClave();
            this.cuentaClave = {
              codigo: 0,
              cuenta: "",
              clave: "",
              codTransaccion: 0,
              estado: "A",
            }
            this.listaCuentaClave.push(this.cuentaClave);
          }
          resolve(respuesta);
        }, error: (error) => {
          rejects("Error");
          console.log("Error =", error);
        }
      })
    })
  }

  async verModalCuentaClave() {
    this.siActualizaCuentaClave = false;
    this.listaCuentaClaveAux = [];
    this.modalService.open(this.modalCuentaClave).result.then(proceso => {
      if (proceso == "Si") {
        this.siActualizaCuentaClave = true;
        for (let cuentaClaveAux of this.listaCuentaClave) {
          if (cuentaClaveAux?.clave != "") {
            this.cuentaClave = new CuentaClave();
            this.cuentaClave = {
              codigo: cuentaClaveAux?.codigo,
              cuenta: cuentaClaveAux?.cuenta,
              clave: cuentaClaveAux?.clave,
              codTransaccion: cuentaClaveAux?.codTransaccion,
              estado: cuentaClaveAux?.estado,
            }
            this.listaCuentaClaveAux.push(this.cuentaClave);
          }
        }
        this.listaCuentaClave = this.listaCuentaClaveAux;
      }
    }, error => {
      console.log(error);
    });
  }

  get descripcionField() {
    return this.formTransaccionConsulta.get('descripcion');
  }
  get precioField() {
    return this.formTransaccionConsulta.get('precio');
  }
  get precioMayoreoField() {
    return this.formTransaccionConsulta.get('precioMayoreo');
  }
  get numProductoField() {
    return this.formTransaccionConsulta.get('numProducto');
  }
  get numExistenciaActualField() {
    return this.formTransaccionConsulta.get('numExistenciaActual');
  }
  get fechaRegistraField() {
    return this.formTransaccionConsulta.get('fechaRegistra');
  }
  get fechaInicioField() {
    return this.formTransaccionConsulta.get('fechaInicio');
  }
  get fechaFinField() {
    return this.formTransaccionConsulta.get('fechaFin');
  }
  get codClienteField() {
    return this.formTransaccionConsulta.get('codCliente');
  }
  get codProductoField() {
    return this.formTransaccionConsulta.get('codProducto');
  }
  get numMesField() {
    return this.formTransaccionConsulta.get('numMes');
  }
  get montoField() {
    return this.formTransaccionConsulta.get('monto');
  }
  get fechaCambiaField() {
    return this.formTransaccionConsulta.get('fechaCambia');
  }
  get claveCuentaField() {
    return this.formTransaccionConsulta.get('claveCuenta');
  }
  get claveField() {
    return this.formTransaccionConsulta.get('clave');
  }
  get numDiasExtraField() {
    return this.formTransaccionConsulta.get('numDiasExtra');
  }
  get prefijoTelefonicoField() {
    return this.formTransaccionConsulta.get('prefijoTelefonico');
  }
  get celularField() {
    return this.formTransaccionConsulta.get('celular');
  }

}
