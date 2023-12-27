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
import { delay } from 'rxjs/operators';

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
  public participanteAux: Participante;
  public personaEditar: Persona;
  public persona: Persona;
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
      this.formParticipante = this.formBuilder.group({
        identificacion: new FormControl(this.participanteEditar?.email, Validators.required),
        nombres: new FormControl(this.participanteEditar?.nombres, Validators.required),
        apellidos: new FormControl(this.participanteEditar?.apellidos, Validators.required),
        fechaNacimiento: new FormControl(dayjs(this.personaEditar?.fechaNacimiento).format("YYYY-MM-DD")),
        direccion: new FormControl(this.personaEditar?.direccion),
        celular: new FormControl(this.participanteEditar?.celular),
        correo: new FormControl(this.participanteEditar?.correo, Validators.required),
        dateLastActive: new FormControl(dayjs(this.participanteEditar?.dateLastActive).format("YYYY-MM-DD HH:mm")),
        username: new FormControl(this.participanteEditar?.username),
        codEstadoCompetencia: new FormControl(this.participanteEditar?.codEstadoCompetencia),
        numPuntajeJuez: new FormControl(this.participanteEditar?.numPuntajeJuez),
      })
      //AQUI TERMINA ACTUALIZAR
    } else {
      this.formParticipante = this.formBuilder.group({
        identificacion: new FormControl('', Validators.required),
        nombres: new FormControl('', Validators.required),
        apellidos: new FormControl('', Validators.required),
        fechaNacimiento: new FormControl(''),
        direccion: new FormControl(''),
        celular: new FormControl(''),
        correo: new FormControl('', Validators.required),
        dateLastActive: new FormControl(dayjs(new Date()).format("YYYY-MM-DD HH:mm")),
        username: new FormControl(''),
        codEstadoCompetencia: new FormControl(''),
        numPuntajeJuez: new FormControl(''),
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

  listarParticipantePorSubcategoriaInstancia = async () => {
    await this.obtenerListaParticipante();
    await this.listaParticipante.emit(this.listaParticipanteChild);
  }

  // consultar establecimientos por codigo de institución
  obtenerListaParticipante() {
    return new Promise((resolve, rejects) => {
      this.participanteService.listarParticipantePorSubcategoriaInstancia(this.participanteEditar?.codSubcategoria, this.participanteEditar?.codInstancia, 0).subscribe({
        next: (respuesta) => {
          this.listaParticipanteChild = respuesta['listado'];
          for (const ele of this.listaParticipanteChild) {
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          }
          resolve(respuesta);
        }, error: (error) => {
          rejects("Error");
        }
      })
    });
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
      this.persona = new Persona({
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
      this.persona['data'].codigo = this.participanteEditar?.codPersona;
      this.personaService.guardarPersona(this.persona['data']).subscribe({
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
      this.personaService.guardarPersona(this.persona['data']).subscribe({
        next: async (response) => {
          this.persona = response['objeto'];
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
      this.participanteAux = new Participante({
        codigo: 0,
        firstName: participanteTemp?.nombres,
        lastName: participanteTemp?.apellidos,
        username: participanteTemp.username,
        email: participanteTemp.correo,
        dateLastActive: dayjs(participanteTemp.dateLastActive).format("YYYY-MM-DD HH:mm:ss.SSS"),
        codEstadoCompetencia: participanteTemp?.codEstadoCompetencia,
      });
    }
    if (this.participanteEditar) {
      this.participante = this.participanteEditar;
      this.participante.firstName = this.participanteAux['data'].firstName;
      this.participante.lastName = this.participanteAux['data'].lastName;
      this.participante.username = this.participanteAux['data'].username;
      this.participante.email = this.participanteAux['data'].email;
      this.participante.dateLastActive = this.participanteAux['data'].dateLastActive;
      this.participante.codEstadoCompetencia = this.participanteAux['data'].codEstadoCompetencia;
      this.participanteService.guardarParticipante(this.participante).subscribe({
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
      // Si es nuevo el participante
      this.participante['data'].customerId = 0;
      this.participante['data'].userId = 0;
      this.participante['data'].firstname = this.personaEditar?.nombres;
      this.participante['data'].lastname = this.personaEditar?.apellidos;
      this.participante['data'].email = this.personaEditar?.correo;
      this.participanteService.guardarParticipante(this.participante['data']).subscribe({
        next: async (response) => {
          this.listarParticipantePorSubcategoriaInstancia();
          this.listarParticipantePorSubcategoriaInstancia();
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
  get codEstadoCompetenciaField() {
    return this.formParticipante.get('codEstadoCompetencia');
  }
  get numPuntajeJuezField() {
    return this.formParticipante.get('numPuntajeJuez');
  }
}
