import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Sede } from 'app/auth/models/sede';
import { Puntaje } from 'app/main/pages/compartidos/modelos/Puntaje';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { DetailComponent } from 'app/main/pages/competencia/resultado/componentes/detail/detail.component';
import { ResultadoService } from '../../../servicios/resultado.service';
import { SedeService } from 'app/main/pages/seguridad/sede/servicios/sede.service';
import dayjs from "dayjs";
import { ParticipanteService } from 'app/main/pages/competencia/participante/servicios/participante.service';
import { ProductoService } from 'app/main/pages/catalogo/producto/servicios/producto.service';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { Producto } from 'app/main/pages/compartidos/modelos/Producto';
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { Modulo } from 'app/main/pages/compartidos/modelos/Modulo';
import { Operacion } from 'app/main/pages/compartidos/modelos/Operacion';

@Component({
  selector: 'app-form-resultado',
  templateUrl: './form-resultado.component.html',
  styleUrls: ['./form-resultado.component.scss']
})
export class FormResultadoComponent implements OnInit {
  /*SPINNER*/
  public load_btn: boolean;

  /*OUTPUT ENVIAN*/
  @Output() close: EventEmitter<boolean>;
  @Output() listaPuntaje: EventEmitter<any>;

  /*INPUT RECIBEN*/
  @Input() listaPuntajeChild: any;
  @Input() resultadoEditar: Puntaje;
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
  private numMes: number;
  public codProducto: number;
  public nemonicoModulo: string = 'VEN';
  public nemonicoOperacion: string = 'CRE';
  public fechaHoy: string = dayjs(new Date).format("YYYY-MM-DD");

  /*FORMULARIOS*/
  public formResultado: FormGroup;

  /*OBJETOS*/
  public resultado: Puntaje;
  public persona: Persona;
  public producto: Producto;
  public modulo: Modulo;
  public operacion: Operacion;
  public participante: Participante;
  public listaSede: Sede[];
  public listaParticipante: Participante[];
  public listaProducto: Producto[];
  public listaRespuesta = [
    { valor: "SI" },
    { valor: "NO" },
  ];

  /*CONSTRUCTOR*/
  constructor(
    private resultadoService: ResultadoService,
    private sedeService: SedeService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private participanteService: ParticipanteService,
    private productoService: ProductoService,
    private personaService: PersonaService,
  ) {
    this.load_btn = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.sede = this.currentUser.sede;
    //this.amieRegex = this.patternAmie(this.sede.nombre);
    this.close = new EventEmitter<boolean>();
    this.listaPuntaje = new EventEmitter<any>();
    this.showDetail = true;
    /*LISTAS*/
    this.listarParticipante();
    this.listarProducto();
  }

  ngOnInit() {
    this.listarSedeActivo();
    this.buscarModuloPorNemonico();
    this.buscarOperacionPorNemonico();
    if (this.resultadoEditar) {
      //this.codProducto = this.resultadoEditar?.producto?.codigo;
      this.formResultado = this.formBuilder.group({
        codParticipante: new FormControl(this.resultadoEditar.codParticipante, Validators.required),
        /*
        producto: new FormControl(this.resultadoEditar.producto, Validators.required),
        descripcion: new FormControl(this.resultadoEditar.descripcion, Validators.required),
        precio: new FormControl(this.resultadoEditar.precio, Validators.required),
        fechaInicio: new FormControl(dayjs(this.resultadoEditar.fechaInicio).format("YYYY-MM-DD"), Validators.compose([Validators.required, ,])),
        fechaFin: new FormControl(dayjs(this.resultadoEditar.fechaFin).format("YYYY-MM-DD"), Validators.compose([Validators.required, ,])),
        numProducto: new FormControl(this.resultadoEditar.numProducto, Validators.required),
        numExistenciaActual: new FormControl(this.resultadoEditar.numExistenciaActual),
        numMes: new FormControl(this.resultadoEditar.numMes),
        */
      })
      //AQUI TERMINA ACTUALIZAR
    } else {
      this.formResultado = this.formBuilder.group({
        codParticipante: new FormControl('', Validators.required),
        producto: new FormControl('', Validators.required),
        descripcion: new FormControl('', Validators.required),
        precio: new FormControl('', Validators.required),
        fechaInicio: new FormControl(dayjs(new Date).format("YYYY-MM-DD"), Validators.required),
        fechaFin: new FormControl(dayjs(new Date).format("YYYY-MM-DD"), Validators.required),
        numProducto: new FormControl('', Validators.required),
        numExistenciaActual: new FormControl(''),
        numMes: new FormControl(''),
      })
    }
  }

  buscarModuloPorNemonico() {
    this.resultadoService.buscarModuloPorNemonico(this.nemonicoModulo).subscribe(
      (respuesta) => {
        this.modulo = respuesta['objeto'];
      }
    )
  }

  buscarOperacionPorNemonico() {
    this.resultadoService.buscarOperacionPorNemonico(this.nemonicoOperacion).subscribe(
      (respuesta) => {
        this.operacion = respuesta['objeto'];
      }
    )
  }

  listarParticipante() {
    this.participanteService.listarParticipantePorEstado("A").subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        for (const ele of this.listaParticipante) {
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

  listarSedeActivo() {
    this.sedeService.listarSedeActivo().subscribe({
      next: (response) => {
        this.listaSede = response['listado'];
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  async listarPuntajePorDescripcion() {
    if (this.descripcionChild?.length != 0) {
      this.resultadoService.listarPuntajePorDescripcion(this.descripcionChild).subscribe(
        (respuesta) => {
          this.listaPuntajeChild = respuesta['listado'];
          if (this.listaPuntajeChild?.length > 0) {
            this.mostrarListaPuntaje();
          }
        }
      )
    } else {
      this.resultadoService.listarPuntajeActivo(this.modulo?.nemonico).subscribe(
        (respuesta) => {
          this.listaPuntajeChild = respuesta['listado'];
          if (this.listaPuntajeChild?.length > 0) {
            this.mostrarListaPuntaje();
          }
        }
      )
    };
    this.listaPuntaje.emit(this.listaPuntajeChild);
  }

  mostrarListaPuntaje() {
    for (const ele of this.listaPuntajeChild) {
      ele.colorFila = "green";
      ele.fechaInicio = dayjs(ele.fechaInicio).format("YYYY-MM-DD");
      ele.fechaFin = dayjs(ele.fechaFin).format("YYYY-MM-DD");
      if (ele.fechaFin <= this.fechaHoy) {
        ele.colorFila = "red";
      }
      // Obtener participante
      this.participanteService.buscarParticipantePorCodigo(ele.codParticipante).subscribe(
        (respuesta) => {
          this.participante = respuesta['objeto'];
          ele.participante = this.participante;
          // Obtener persona
          this.personaService.buscarPersonaPorCodigo(ele.participante.codPersona).subscribe(
            (respuesta) => {
              this.persona = respuesta['objeto'];
              ele.participante.persona = this.persona;
            }
          )
        }
      )
      // Obtener producto
      this.productoService.buscarProductoPorCodigo(ele.codProducto).subscribe(
        (respuesta) => {
          this.producto = respuesta['objeto'];
          ele.producto = this.producto;
        }
      )
    }
  }

  obtenerProducto() {
    // Receptar el codAplicacion de formResultado.value
    let formResultadoTemp = this.formResultado.value;
    this.codProducto = formResultadoTemp?.producto?.codigo;
    this.formResultado.controls.precio.setValue(formResultadoTemp?.producto?.precioCosto);
    this.formResultado.controls.numExistenciaActual.setValue(formResultadoTemp?.producto?.numExistenciaActual);
  }

  patternAmie(amie: string) {
    const valorEncontrar = amie
    const regExp = new RegExp('([0-9])\\w+')
    const amieFiltrado = valorEncontrar.match(regExp)
    return amieFiltrado['0']
  }

  addRegistro() {
    if (this.formResultado?.valid) {
      let resultadoTemp = this.formResultado.value;
      let fechaFinDate = new Date();
      let fechaFinString = dayjs(resultadoTemp?.fechaFin).format("YYYY-MM-DD HH:mm:ss.SSS");
      if (resultadoTemp?.numMes != "" && resultadoTemp?.numMes != 0) {
        this.numMes = resultadoTemp?.numMes;
        fechaFinDate.setMonth(fechaFinDate.getMonth() + this.numMes)
        fechaFinString = fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate();
      }
    }
    if (this.resultadoEditar) {
      this.resultado['data'].codigo = this.resultadoEditar.codigo;
      //this.resultado['data'].descripcion = this.descripcionChild;
      //this.descripcionChild = this.resultado['data'].descripcion;
      this.resultadoService.guardarPuntaje(this.resultado['data']).subscribe({
        next: (response) => {
          this.listarPuntajePorDescripcion();
          this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
          this.parentDetail.closeDetail();
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    } else {
      this.resultadoService.guardarPuntaje(this.resultado['data']).subscribe({
        next: async (response) => {
          this.listarPuntajePorDescripcion();
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

  compararSede(o1, o2) {
    return o1 === undefined || o2 === undefined || o2 === null ? false : o1.codigo === o2.codigo;
  }

  compararProducto(o1, o2) {
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

  // Contar los caracteres de la cedula para activar boton <Buscar>
  onKey(event) {
    if (event.target.value.length != 0) {
      var fechaFinDate = new Date();
      var fechaFinString = "";
      this.numMes = Number(event.target.value);
      fechaFinDate.setMonth(fechaFinDate.getMonth() + this.numMes);
      fechaFinString = dayjs(fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate()).format("YYYY-MM-DD");
      this.formResultado.controls.fechaFin.setValue(fechaFinString);
    }
  }

  get descripcionField() {
    return this.formResultado.get('descripcion');
  }
  get precioField() {
    return this.formResultado.get('precio');
  }
  get numProductoField() {
    return this.formResultado.get('numProducto');
  }
  get numExistenciaActualField() {
    return this.formResultado.get('numExistenciaActual');
  }
  get fechaRegistraField() {
    return this.formResultado.get('fechaRegistra');
  }
  get fechaInicioField() {
    return this.formResultado.get('fechaInicio');
  }
  get fechaFinField() {
    return this.formResultado.get('fechaFin');
  }
  get codParticipanteField() {
    return this.formResultado.get('codParticipante');
  }
  get productoField() {
    return this.formResultado.get('producto');
  }
  get numMesField() {
    return this.formResultado.get('numMes');
  }

}
