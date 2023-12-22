import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MensajesIziToastService } from 'app/main/pages/compartidos/servicios/iziToast/mensajesIziToast.service';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { DetailComponent } from 'app/main/pages/competencia/participante/componentes/detail/detail.component';
import dayjs from "dayjs";
import { MyValidators } from 'app/utils/validators';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { ParticipanteService } from '../../../servicios/participante.service';
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { EstadoCompetencia } from 'app/main/pages/compartidos/modelos/EstadoCompetencia';

@Component({
  selector: 'app-form-participante',
  templateUrl: './form-participante.component.html',
  styleUrls: ['./form-participante.component.scss']
})
export class FormParticipanteComponent implements OnInit {
  /*SPINNER*/
  public load_btn: boolean;

  /*OUTPUT ENVIAN*/
  @Output() close: EventEmitter<boolean>;
  @Output() listaParticipante: EventEmitter<any>;

  /*INPUT RECIBEN*/
  @Input() listaParticipanteChild: any;
  @Input() participanteEditar: Participante;
  @Input() codigoChild: number;
  @Input() identificacionChild: string;

  /*MODALES*/
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;
  @ViewChild(DetailComponent, { static: false }) parentDetail: DetailComponent;

  /*VARIABLES */
  public showDetail: boolean;
  private amieRegex: string;
  private currentUser: any;

  /*FORMULARIOS*/
  public formParticipante: FormGroup;

  /*OBJETOS*/
  public participante: Participante;
  public personaEditar: Persona;
  public listaParticipanteAux: Participante[];
  public listaEstadoCompetencia: EstadoCompetencia[];
  public listaRespuesta = [
    { valor: "SI" },
    { valor: "NO" },
  ];

  /*CONSTRUCTOR*/
  constructor(
    private participanteService: ParticipanteService,
    private personaService: PersonaService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private mensajeIzi: MensajesIziToastService,
  ) {
    this.load_btn = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.sede = this.currentUser.sede;
    //this.amieRegex = this.patternAmie(this.sede.nombre);
    this.close = new EventEmitter<boolean>();
    this.listaParticipante = new EventEmitter<any>();
    this.showDetail = true;
  }

  ngOnInit() {
    this.listarEstadoCompetenciaActivo();
    if (this.participanteEditar) {
      if (this.participanteEditar.codPersona != 0) {
        this.buscarPersonaPorCodigo(this.participanteEditar.codPersona);
      }
      this.formParticipante = this.formBuilder.group({
        /*
        identificacion: new FormControl({ value: this.participanteEditar.identificacion, disabled: true }, Validators.compose([
          MyValidators.isCedulaValid,
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern("^[0-9]*$"),
        ])),
        */
        identificacion: new FormControl(this.participanteEditar?.username, Validators.required),
        nombres: new FormControl(this.personaEditar?.nombres, Validators.required),
        apellidos: new FormControl(this.personaEditar?.apellidos, Validators.required),
        fechaNacimiento: new FormControl(dayjs(this.personaEditar?.fechaNacimiento).format("YYYY-MM-DD")),
        direccion: new FormControl(this.personaEditar?.direccion),
        celular: new FormControl(this.personaEditar?.celular, Validators.required),
        correo: new FormControl(this.personaEditar?.correo, Validators.required),
        dateLastActive: new FormControl(dayjs(this.participanteEditar?.dateLastActive).format("YYYY-MM-DD")),
        estadoCompetencia: new FormControl(this.participanteEditar?.estadoCompetencia),
      })
      //AQUI TERMINA ACTUALIZAR
    } else {
      this.formParticipante = this.formBuilder.group({
        /*
        identificacion: new FormControl({ value: this.identificacionChild, disabled: false }, Validators.compose([
          MyValidators.isCedulaValid,
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern("^[0-9]*$"),
        ])),
        */
        identificacion: new FormControl('', Validators.required),
        nombres: new FormControl('', Validators.required),
        apellidos: new FormControl('', Validators.required),
        fechaNacimiento: new FormControl(''),
        direccion: new FormControl(''),
        celular: new FormControl('', Validators.required),
        correo: new FormControl('', Validators.required),
        dateLastActive: new FormControl(dayjs(new Date()).format("YYYY-MM-DD")),
        username: new FormControl(''),
        estadoCompetencia: new FormControl(''),
      })
    }
  }

  
  listarEstadoCompetenciaActivo() {
    this.participanteService.listarEstadoCompetenciaActivo().subscribe(
      (respuesta) => {
        this.listaEstadoCompetencia = respuesta['listado'];
      }
    )
  }

  /*
  async listarParticipantePorIdentificacion() {
    this.participanteService.listarParticipantePorIdentificacion(this.identificacionChild).subscribe(
      (respuesta) => {
        this.listaParticipanteChild = respuesta['listado']
        for (const ele of this.listaParticipanteChild) {
          ele.fechaNacimiento = dayjs(ele.fechaNacimiento).format("YYYY-MM-DD")
          if (ele.codigo != null) {
            this.participanteService.listarParticipantePorParticipante(ele.codigo).subscribe(
              (respuesta) => {
                this.listaParticipante = respuesta['listado'];
                ele.participante = this.listaParticipante[0];
                ele.participante.dateLastActive = dayjs(ele.participante.dateLastActive).format("YYYY-MM-DD")
              }
            )
          }
        }
        this.listaParticipante.emit(this.listaParticipanteChild);
      }
    );
  }
  */
 
  listarParticipantePorSubcategoriaInstancia() {
    this.participanteService.listarParticipantePorSubcategoriaInstancia(this.participante?.codSubcategoria, this.participante?.codInstancia).subscribe(
      (respuesta) => {
        this.listaParticipanteAux = respuesta['listado'];
        for (const ele of this.listaParticipanteAux) {
          switch (ele.codEstadoCompetencia) {
            case 1: {
              ele.colorBoton = "blue";
              break;
            }
            case 2: {
              ele.colorBoton = "green";
              break;
            }
            case 3: {
              ele.colorBoton = "Brown";
              break;
            }
            case 4: {
              ele.colorBoton = "red";
              break;
            }
            default: {
              ele.colorBoton = "black";
              break;
            }
          }
          if (ele.codEstadoCompetencia != 0) {
            this.participanteService.buscarEstadoCompetenciaPorCodigo(ele.codEstadoCompetencia).subscribe(
              (respuesta) => {
                ele.estadoCompetencia = respuesta['objeto'];                                                            
              }
            )
          }
          //ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD")
        }
        this.listaParticipante.emit(this.listaParticipanteAux);
      }
    );
  }

  buscarPersonaPorCodigo(codPersona: number) {
    this.personaService.buscarPersonaPorCodigo(codPersona).subscribe({
      next: (response) => {
        this.personaEditar = response['objeto'];
        /*
        this.formParticipante.controls.fechaNacimiento.setValue(dayjs(this.participante?.fechaNacimiento).format("YYYY-MM-DD"));
        this.formParticipante.controls.nombres.setValue(this.participante?.nombres);
        this.formParticipante.controls.apellidos.setValue(this.participante?.apellidos);
        this.formParticipante.controls.direccion.setValue(this.participante?.direccion);
        this.formParticipante.controls.correo.setValue(this.participante?.correo);
        this.formParticipante.controls.celular.setValue(this.participante?.celular);
        */
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  patternAmie(amie: string) {
    const valorEncontrar = amie
    const regExp = new RegExp('([0-9])\\w+')
    const amieFiltrado = valorEncontrar.match(regExp)
    return amieFiltrado['0']
  }

  addRegistroPersona() {
    if (this.formParticipante?.valid) {
      let participanteTemp = this.formParticipante.value;
      this.participante = new Participante({
        codigo: 0,
        identificacion: participanteTemp?.identificacion,
        nombres: participanteTemp?.nombres,
        apellidos: participanteTemp?.apellidos,
        fechaNacimiento: dayjs(participanteTemp?.fechaNacimiento).format("YYYY-MM-DD HH:mm:ss.SSS"),
        direccion: participanteTemp?.direccion,
        celular: participanteTemp?.celular,
        correo: participanteTemp?.correo,
        estado: 'A',
      });
    }
    if (this.participanteEditar) {
      this.participante['data'].codigo = this.participanteEditar?.codigo;
      this.participante['data'].identificacion = this.identificacionChild;
      this.participanteService.guardarParticipante(this.participante['data']).subscribe({
        next: (response) => {
          // Actualizar Datos Participante
          this.addRegistroParticipante();
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    } else {
      this.participanteService.guardarParticipante(this.participante['data']).subscribe({
        next: async (response) => {
          this.participante = response['objeto'];
          // Actualizar Datos Participante
          this.addRegistroParticipante();
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    }
  }

  addRegistroParticipante() {
    if (this.formParticipante?.valid) {
      let participanteTemp = this.formParticipante.value;
      this.participante = new Participante({
        codigo: 0,
        codParticipante: this.participante?.codigo,
        username: participanteTemp.username,
        dateLastActive: dayjs(participanteTemp.dateLastActive).format("YYYY-MM-DD HH:mm:ss.SSS"),
        estado: 'A',
      });
    }
    if (this.participanteEditar) {
      this.participante['data'].codigo = this.participanteEditar?.codigo;
      this.participanteService.guardarParticipante(this.participante['data']).subscribe({
        next: (response) => {
          this.listarParticipantePorSubcategoriaInstancia();
          this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
          this.parentDetail.closeDetail();
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    } else {
      // Si es nuevo el participante, movemos datos de la participante
      this.participante['data'].customerId = 0;
      this.participante['data'].userId = 0;
      this.participante['data'].firstname = this.personaEditar?.nombres;
      this.participante['data'].lastname = this.personaEditar?.apellidos;
      this.participante['data'].email = this.personaEditar?.correo;
      this.participanteService.guardarParticipante(this.participante['data']).subscribe({
        next: async (response) => {
          this.listarParticipantePorSubcategoriaInstancia();
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

  compararEstadoCompetencia(o1, o2) {
    return o1 === undefined || o2 === undefined || o2 === null ? false : o1.codigo === o2.codigo;
  }

  // Contar los caracteres de la cedula para activar boton <Buscar>
  onKey(event) {
    if (event.target.value.length != 10) {
      this.resetTheForm();
    } else {
      this.buscarPersonaPorCodigo(1);
    }
  }

  resetTheForm(): void {
    this.formParticipante.reset = null;
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

  get identificacionField() {
    return this.formParticipante.get('identificacion');
  }
  get nombresField() {
    return this.formParticipante.get('nombres');
  }
  get apellidosField() {
    return this.formParticipante.get('apellidos');
  }
  get fechaNacimientoField() {
    return this.formParticipante.get('fechaNacimiento');
  }
  get direccionField() {
    return this.formParticipante.get('direccion');
  }
  get celularField() {
    return this.formParticipante.get('celular');
  }
  get correoField() {
    return this.formParticipante.get('correo');
  }
  get usernameField() {
    return this.formParticipante.get('username');
  }
  get dateLastActiveField() {
    return this.formParticipante.get('dateLastActive');
  }
  get estadoCompetenciaField() {
    return this.formParticipante.get('estadoCompetencia');
  }
}
