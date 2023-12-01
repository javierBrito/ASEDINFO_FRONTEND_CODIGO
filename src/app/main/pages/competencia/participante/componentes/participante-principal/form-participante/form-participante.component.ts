import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { MensajesIziToastService } from 'app/main/pages/compartidos/servicios/iziToast/mensajesIziToast.service';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { DetailComponent } from 'app/main/pages/competencia/participante/componentes/detail/detail.component';
import dayjs from "dayjs";
import { MyValidators } from 'app/utils/validators';
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { ParticipanteService } from '../../../servicios/participante.service';

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
  @Output() listaPersona: EventEmitter<any>;

  /*INPUT RECIBEN*/
  @Input() listaPersonaChild: any;
  @Input() personaEditar: Persona;
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
  public persona: Persona;
  public listaPersonaAux: Persona[];
  public listaParticipante: Participante[];
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
    this.listaPersona = new EventEmitter<any>();
    this.showDetail = true;
  }

  ngOnInit() {
    if (this.personaEditar) {
      this.formParticipante = this.formBuilder.group({
        identificacion: new FormControl({ value: this.personaEditar.identificacion, disabled: true }, Validators.compose([
          MyValidators.isCedulaValid,
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern("^[0-9]*$"),
        ])),
        nombres: new FormControl(this.personaEditar?.nombres, Validators.required),
        apellidos: new FormControl(this.personaEditar?.apellidos, Validators.required),
        fechaNacimiento: new FormControl(dayjs(this.personaEditar?.fechaNacimiento).format("YYYY-MM-DD")),
        direccion: new FormControl(this.personaEditar?.direccion),
        celular: new FormControl(this.personaEditar?.celular, Validators.required),
        correo: new FormControl(this.personaEditar?.correo, Validators.required),
        fechaInicio: new FormControl(dayjs(this.personaEditar?.participante?.fechaInicio).format("YYYY-MM-DD")),
        tipoParticipante: new FormControl(this.personaEditar?.participante?.tipoParticipante),
      })
      //AQUI TERMINA ACTUALIZAR
    } else {
      this.formParticipante = this.formBuilder.group({
        identificacion: new FormControl({ value: this.identificacionChild, disabled: false }, Validators.compose([
          MyValidators.isCedulaValid,
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern("^[0-9]*$"),
        ])),
        nombres: new FormControl('', Validators.required),
        apellidos: new FormControl('', Validators.required),
        fechaNacimiento: new FormControl(''),
        direccion: new FormControl(''),
        celular: new FormControl('', Validators.required),
        correo: new FormControl('', Validators.required),
        fechaInicio: new FormControl(dayjs(new Date()).format("YYYY-MM-DD")),
        tipoParticipante: new FormControl(''),
      })
    }
  }

  async listarParticipantePorIdentificacion() {
    this.personaService.listarPersonaPorIdentificacion(this.identificacionChild).subscribe(
      (respuesta) => {
        this.listaPersonaChild = respuesta['listado']
        for (const ele of this.listaPersonaChild) {
          ele.fechaNacimiento = dayjs(ele.fechaNacimiento).format("YYYY-MM-DD")
          if (ele.codigo != null) {
            this.participanteService.listarParticipantePorPersona(ele.codigo).subscribe(
              (respuesta) => {
                this.listaParticipante = respuesta['listado'];
                ele.participante = this.listaParticipante[0];
                ele.participante.fechaInicio = dayjs(ele.participante.fechaInicio).format("YYYY-MM-DD")
              }
            )
          }
        }
        this.listaPersona.emit(this.listaPersonaChild);
      }
    );
  }

  verificarPersona() {
    // Receptar la identificación de formInscripcionCedula.value
    let participanteIdentificacionTemp = this.formParticipante.value;
    this.identificacionChild = participanteIdentificacionTemp.identificacion;
    this.personaService.listarPersonaPorIdentificacion(this.identificacionChild).subscribe({
      next: (response) => {
        this.listaPersonaAux = response['listado'];
        this.persona = this.listaPersonaAux['0'];
        if (this.persona?.codigo != null) {
          this.formParticipante.controls.fechaNacimiento.setValue(dayjs(this.persona?.fechaNacimiento).format("YYYY-MM-DD"));
          this.formParticipante.controls.nombres.setValue(this.persona?.nombres);
          this.formParticipante.controls.apellidos.setValue(this.persona?.apellidos);
          this.formParticipante.controls.direccion.setValue(this.persona?.direccion);
          this.formParticipante.controls.correo.setValue(this.persona?.correo);
          this.formParticipante.controls.celular.setValue(this.persona?.celular);

          this.participanteService.listarParticipantePorPersona(this.persona?.codigo).subscribe(
            (respuesta) => {
              this.listaParticipante = respuesta['listado'];
              this.persona.participante = this.listaParticipante[0];
              if (this.persona.participante != undefined) {
                this.persona.participante.fechaInicio = dayjs(this.persona.participante.fechaInicio).format("YYYY-MM-DD");
                this.formParticipante.controls.fechaInicio.setValue(dayjs(this.persona.participante?.fechaInicio).format("YYYY-MM-DD"));
                this.formParticipante.controls.tipoParticipante.setValue(this.persona.participante?.tipoParticipante);
                }
            }
          )
        }
        this.personaEditar = this.persona;
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
    if (this.personaEditar) {
      this.persona['data'].codigo = this.personaEditar?.codigo;
      this.persona['data'].identificacion = this.identificacionChild;
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
      this.participante = new Participante({
        codigo: 0,
        codPersona: this.persona?.codigo,
        tipoParticipante: participanteTemp.tipoParticipante,
        fechaInicio: dayjs(participanteTemp.fechaInicio).format("YYYY-MM-DD HH:mm:ss.SSS"),
        estado: 'A',
      });
    }
    if (this.personaEditar) {
      this.participante['data'].codigo = this.personaEditar?.participante?.codigo;
      this.participanteService.guardarParticipante(this.participante['data']).subscribe({
        next: (response) => {
          this.listarParticipantePorIdentificacion();
          this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
          this.parentDetail.closeDetail();
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    } else {
      this.participanteService.guardarParticipante(this.participante['data']).subscribe({
        next: async (response) => {
          this.listarParticipantePorIdentificacion();
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

  // Contar los caracteres de la cedula para activar boton <Buscar>
  onKey(event) {
    if (event.target.value.length != 10) {
      this.resetTheForm();
    } else {
      this.verificarPersona();    }
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
  get dateRegisteredField() {
    return this.formParticipante.get('dateRegistered');
  }
}
