import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Sede } from 'app/auth/models/sede';
import { Transaccion } from 'app/main/pages/compartidos/modelos/Transaccion';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { DetailComponent } from 'app/main/pages/venta/transaccion/componentes/detail/detail.component';
import { TransaccionService } from '../../../servicios/transaccion.service';
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

@Component({
  selector: 'app-form-transaccion',
  templateUrl: './form-transaccion.component.html',
  styleUrls: ['./form-transaccion.component.scss']
})
export class FormTransaccionComponent implements OnInit {
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

  /*MODALES*/
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;
  @ViewChild(DetailComponent, { static: false }) parentDetail: DetailComponent;

  /*VARIABLES */
  public showDetail: boolean;
  private amieRegex: string;
  private currentUser: any;
  private numMes: number = 0;
  private precio: number = 0;
  private numProducto: number = 0;
  private monto: number;
  private numExistenciaActual: number = 0;
  public codProducto: number;
  public nemonicoModulo: string = 'VEN';
  public nemonicoOperacion: string = 'CRE';
  public fechaHoy: string = dayjs(new Date).format("YYYY-MM-DD");

  /*FORMULARIOS*/
  public formTransaccion: FormGroup;

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

  /*CONSTRUCTOR*/
  constructor(
    private transaccionService: TransaccionService,
    private sedeService: SedeService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private personaService: PersonaService,
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
    if (this.transaccionEditar) {
      this.codProducto = this.transaccionEditar?.codProducto;
      this.numMes = this.transaccionEditar?.numMes;
      this.precio = this.transaccionEditar?.precio;
      this.numProducto = this.transaccionEditar?.numProducto;
      this.numExistenciaActual = this.transaccionEditar?.numExistenciaActual;
      this.formTransaccion = this.formBuilder.group({
        codCliente: new FormControl(this.transaccionEditar.codCliente, Validators.required),
        codProducto: new FormControl(this.transaccionEditar.codProducto, Validators.required),
        descripcion: new FormControl(this.transaccionEditar.descripcion, Validators.required),
        claveCuenta: new FormControl(this.transaccionEditar.claveCuenta),
        precio: new FormControl(this.transaccionEditar.precio, Validators.required),
        fechaInicio: new FormControl(dayjs(this.transaccionEditar.fechaInicio).format("YYYY-MM-DD"), Validators.compose([Validators.required, ,])),
        fechaFin: new FormControl(dayjs(this.transaccionEditar.fechaFin).format("YYYY-MM-DD"), Validators.compose([Validators.required, ,])),
        fechaCambia: new FormControl(dayjs(this.transaccionEditar.fechaCambia).format("YYYY-MM-DD")),
        numProducto: new FormControl(this.transaccionEditar.numProducto, Validators.required),
        numExistenciaActual: new FormControl(this.transaccionEditar.numExistenciaActual),
        numMes: new FormControl(this.transaccionEditar.numMes),
        precioMayoreo: new FormControl(this.transaccionEditar.precioMayoreo, Validators.required),
        monto: new FormControl(this.transaccionEditar.monto),
      })
      //AQUI TERMINA ACTUALIZAR
    } else {
      this.formTransaccion = this.formBuilder.group({
        codCliente: new FormControl('', Validators.required),
        codProducto: new FormControl('', Validators.required),
        descripcion: new FormControl('', Validators.required),
        claveCuenta: new FormControl(''),
        precio: new FormControl('', Validators.required),
        fechaInicio: new FormControl(dayjs(new Date).format("YYYY-MM-DD"), Validators.required),
        fechaFin: new FormControl(dayjs(new Date).format("YYYY-MM-DD"), Validators.required),
        fechaCambia: new FormControl(),
        numProducto: new FormControl('', Validators.required),
        numExistenciaActual: new FormControl(''),
        numMes: new FormControl(''),
        precioMayoreo: new FormControl(''),
        monto: new FormControl(''),
      })
    }
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
    // Receptar el codProducto de formTransaccion.value
    let formTransaccionTemp = this.formTransaccion.value;
    this.codProducto = formTransaccionTemp?.codProducto;
    this.productoService.buscarProductoPorCodigo(this.codProducto).subscribe(
      (respuesta) => {
        this.producto = respuesta['objeto'];
        this.formTransaccion.controls.precio.setValue(this.producto?.precioCosto);
        this.formTransaccion.controls.precioMayoreo.setValue(this.producto?.precioMayoreo);
        this.formTransaccion.controls.numExistenciaActual.setValue(this.producto?.numExistenciaActual);
        this.numExistenciaActual = this.producto?.numExistenciaActual;
        this.precio = this.producto?.precioCosto;
      }
    );
  }

  async listarTransaccionPorDescripcion() {
    if (this.descripcionChild?.length != 0) {
      this.transaccionService.listarTransaccionPorDescripcion(this.descripcionChild).subscribe(
        (respuesta) => {
          this.listaTransaccionChild = respuesta['listado'];
          if (this.listaTransaccionChild?.length > 0) {
            this.mostrarListaTransaccion();
          }
        }
      )
    } else {
      this.transaccionService.listarTransaccionActivo(this.modulo?.nemonico).subscribe(
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

        if (numDias1 == 0) {
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
    if (this.formTransaccion?.valid) {
      let transaccionTemp = this.formTransaccion.value;
      let fechaFinDate = new Date(dayjs(transaccionTemp?.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS"));
      let fechaFinString = dayjs(transaccionTemp?.fechaFin).format("YYYY-MM-DD HH:mm:ss.SSS");
      if (transaccionTemp?.numMes != "" && transaccionTemp?.numMes != 0) {
        this.numMes = transaccionTemp?.numMes;
        fechaFinDate.setMonth(fechaFinDate.getMonth() + this.numMes)
        fechaFinString = fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate();
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
        precio: transaccionTemp?.precio,
        monto: transaccionTemp?.monto,
        numProducto: transaccionTemp?.numProducto,
        numMes: this.numMes,
        fechaInicio: dayjs(transaccionTemp?.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS"),
        fechaCambia: fechaCambia,
        fechaFin: dayjs(fechaFinString).format("YYYY-MM-DD HH:mm:ss.SSS"),
        fechaRegistra: dayjs(new Date).format("YYYY-MM-DD HH:mm:ss.SSS"),
        estado: 'A',
      });
    }
    if (this.transaccionEditar) {
      this.transaccion['data'].codigo = this.transaccionEditar.codigo;
      this.transaccionService.guardarTransaccion(this.transaccion['data']).subscribe({
        next: (response) => {
          this.listarTransaccionPorDescripcion();
          this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
          this.parentDetail.closeDetail();
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    } else {
      this.transaccionService.guardarTransaccion(this.transaccion['data']).subscribe({
        next: async (response) => {
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

  // Tomar el valor de meses para obtener la fecha fin y el monto
  onKeyMes(event) {
    if (event.target.value.length != 0) {
      let transaccionTemp = this.formTransaccion.value;
      let fechaFinDate = new Date(dayjs(transaccionTemp?.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS"));
      var fechaFinString = "";
      this.numMes = Number(event.target.value);
      fechaFinDate.setMonth(fechaFinDate.getMonth() + this.numMes);
      fechaFinString = dayjs(fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate()).format("YYYY-MM-DD");
      this.formTransaccion.controls.fechaFin.setValue(fechaFinString);
      // Calcular monto de la transacción
      this.calcularMonto();
    }
  }

  // Tomar el valor de meses para obtener la fecha fin y el monto
  onKeyFechaInicio(event) {
    if (event.target.value.length != 0) {
      let transaccionTemp = this.formTransaccion.value;
      let fechaFinDate = new Date(dayjs(transaccionTemp?.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS"));
      var fechaFinString = "";
      //this.numMes = Number(event.target.value);
      this.numMes = transaccionTemp?.numMes;
      fechaFinDate.setMonth(fechaFinDate.getMonth() + this.numMes);
      fechaFinString = dayjs(fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate()).format("YYYY-MM-DD");
      this.formTransaccion.controls.fechaFin.setValue(fechaFinString);
      // Calcular monto de la transacción
      this.calcularMonto();
    }
  }

  changeFechaInicio(object) {
    let transaccionTemp = this.formTransaccion.value;
    let fechaFinDate = new Date(dayjs(transaccionTemp?.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS"));
    var fechaFinString = "";
    this.numMes = transaccionTemp?.numMes;
    fechaFinDate.setMonth(fechaFinDate.getMonth() + this.numMes);
    fechaFinString = dayjs(fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate()).format("YYYY-MM-DD");
    this.formTransaccion.controls.fechaFin.setValue(fechaFinString);
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
        this.formTransaccion.controls.numProducto.setValue(0);
      } else {
        // Calcular monto de la transacción
        this.calcularMonto();
      }
    }
  }

  calcularMonto() {
    this.monto = this.numMes * this.precio * this.numProducto;
    this.formTransaccion.controls.monto.setValue(this.monto);
  }

  get descripcionField() {
    return this.formTransaccion.get('descripcion');
  }
  get precioField() {
    return this.formTransaccion.get('precio');
  }
  get precioMayoreoField() {
    return this.formTransaccion.get('precioMayoreo');
  }
  get numProductoField() {
    return this.formTransaccion.get('numProducto');
  }
  get numExistenciaActualField() {
    return this.formTransaccion.get('numExistenciaActual');
  }
  get fechaRegistraField() {
    return this.formTransaccion.get('fechaRegistra');
  }
  get fechaInicioField() {
    return this.formTransaccion.get('fechaInicio');
  }
  get fechaFinField() {
    return this.formTransaccion.get('fechaFin');
  }
  get codClienteField() {
    return this.formTransaccion.get('codCliente');
  }
  get codProductoField() {
    return this.formTransaccion.get('codProducto');
  }
  get numMesField() {
    return this.formTransaccion.get('numMes');
  }
  get montoField() {
    return this.formTransaccion.get('monto');
  }
  get fechaCambiaField() {
    return this.formTransaccion.get('fechaCambia');
  }
  get claveCuentaField() {
    return this.formTransaccion.get('claveCuenta');
  }

}
