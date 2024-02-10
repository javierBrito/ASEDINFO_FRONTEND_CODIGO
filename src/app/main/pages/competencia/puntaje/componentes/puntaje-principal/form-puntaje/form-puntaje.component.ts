import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Sede } from 'app/auth/models/sede';
import { Puntaje } from 'app/main/pages/compartidos/modelos/Puntaje';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { DetailComponent } from 'app/main/pages/competencia/puntaje/componentes/detail/detail.component';
import { PuntajeService } from '../../../servicios/puntaje.service';
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
  selector: 'app-form-puntaje',
  templateUrl: './form-puntaje.component.html',
  styleUrls: ['./form-puntaje.component.scss']
})
export class FormPuntajeComponent implements OnInit {
  /*SPINNER*/
  public load_btn: boolean;

  /*OUTPUT ENVIAN*/
  @Output() close: EventEmitter<boolean>;
  @Output() listaPuntaje: EventEmitter<any>;

  /*INPUT RECIBEN*/
  @Input() listaPuntajeChild: any;
  @Input() puntajeEditar: Puntaje;
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
  public formPuntaje: FormGroup;

  /*OBJETOS*/
  public puntaje: Puntaje;
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
    private puntajeService: PuntajeService,
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
    if (this.puntajeEditar) {
      //this.codProducto = this.puntajeEditar?.producto?.codigo;
      this.formPuntaje = this.formBuilder.group({
        codParticipante: new FormControl(this.puntajeEditar.codParticipante, Validators.required),
        /*
        producto: new FormControl(this.puntajeEditar.producto, Validators.required),
        descripcion: new FormControl(this.puntajeEditar.descripcion, Validators.required),
        precio: new FormControl(this.puntajeEditar.precio, Validators.required),
        fechaInicio: new FormControl(dayjs(this.puntajeEditar.fechaInicio).format("YYYY-MM-DD"), Validators.compose([Validators.required, ,])),
        fechaFin: new FormControl(dayjs(this.puntajeEditar.fechaFin).format("YYYY-MM-DD"), Validators.compose([Validators.required, ,])),
        numProducto: new FormControl(this.puntajeEditar.numProducto, Validators.required),
        numExistenciaActual: new FormControl(this.puntajeEditar.numExistenciaActual),
        numMes: new FormControl(this.puntajeEditar.numMes),
        */
      })
      //AQUI TERMINA ACTUALIZAR
    } else {
      this.formPuntaje = this.formBuilder.group({
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
    this.puntajeService.buscarModuloPorNemonico(this.nemonicoModulo).subscribe(
      (respuesta) => {
        this.modulo = respuesta['objeto'];
      }
    )
  }

  buscarOperacionPorNemonico() {
    this.puntajeService.buscarOperacionPorNemonico(this.nemonicoOperacion).subscribe(
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
      this.puntajeService.listarPuntajePorDescripcion(this.descripcionChild).subscribe(
        (respuesta) => {
          this.listaPuntajeChild = respuesta['listado'];
          if (this.listaPuntajeChild?.length > 0) {
            this.mostrarListaPuntaje();
          }
        }
      )
    } else {
      this.puntajeService.listarPuntajeActivo(this.modulo?.nemonico).subscribe(
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
    // Receptar el codAplicacion de formPuntaje.value
    let formPuntajeTemp = this.formPuntaje.value;
    this.codProducto = formPuntajeTemp?.producto?.codigo;
    this.formPuntaje.controls.precio.setValue(formPuntajeTemp?.producto?.precioCosto);
    this.formPuntaje.controls.numExistenciaActual.setValue(formPuntajeTemp?.producto?.numExistenciaActual);
  }

  patternAmie(amie: string) {
    const valorEncontrar = amie
    const regExp = new RegExp('([0-9])\\w+')
    const amieFiltrado = valorEncontrar.match(regExp)
    return amieFiltrado['0']
  }

  addRegistro() {
    if (this.formPuntaje?.valid) {
      let puntajeTemp = this.formPuntaje.value;
      let fechaFinDate = new Date();
      let fechaFinString = dayjs(puntajeTemp?.fechaFin).format("YYYY-MM-DD HH:mm:ss.SSS");
      if (puntajeTemp?.numMes != "" && puntajeTemp?.numMes != 0) {
        this.numMes = puntajeTemp?.numMes;
        fechaFinDate.setMonth(fechaFinDate.getMonth() + this.numMes)
        fechaFinString = fechaFinDate.getFullYear() + "-" + (fechaFinDate.getMonth() + 1) + "-" + fechaFinDate.getDate();
      }
    }
    if (this.puntajeEditar) {
      this.puntaje['data'].codigo = this.puntajeEditar.codigo;
      //this.puntaje['data'].descripcion = this.descripcionChild;
      //this.descripcionChild = this.puntaje['data'].descripcion;
      this.puntajeService.guardarPuntaje(this.puntaje['data']).subscribe({
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
      this.puntajeService.guardarPuntaje(this.puntaje['data']).subscribe({
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
      this.formPuntaje.controls.fechaFin.setValue(fechaFinString);
    }
  }

  get descripcionField() {
    return this.formPuntaje.get('descripcion');
  }
  get precioField() {
    return this.formPuntaje.get('precio');
  }
  get numProductoField() {
    return this.formPuntaje.get('numProducto');
  }
  get numExistenciaActualField() {
    return this.formPuntaje.get('numExistenciaActual');
  }
  get fechaRegistraField() {
    return this.formPuntaje.get('fechaRegistra');
  }
  get fechaInicioField() {
    return this.formPuntaje.get('fechaInicio');
  }
  get fechaFinField() {
    return this.formPuntaje.get('fechaFin');
  }
  get codParticipanteField() {
    return this.formPuntaje.get('codParticipante');
  }
  get productoField() {
    return this.formPuntaje.get('producto');
  }
  get numMesField() {
    return this.formPuntaje.get('numMes');
  }

}
