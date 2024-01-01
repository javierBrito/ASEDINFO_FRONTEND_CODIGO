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
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { Subcategoria } from 'app/main/pages/compartidos/modelos/Subcategoria';
import { Instancia } from 'app/main/pages/compartidos/modelos/Instancia';

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
  @Input() codSubcategoriaChild: number;
  @Input() codInstanciaChild: number;

  /*MODALES*/
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;
  @ViewChild(DetailComponent, { static: false }) parentDetail: DetailComponent;

  /*VARIABLES */
  public showDetail: boolean;
  private amieRegex: string;
  private currentUser: any;
  public displayNone: string = '';
  public displayNoneInstancia: string = '';
  public displayNoneIntegrante2: string = '';
  public codCategoria: number;
  public codSubcategoria: number;
  public codInstancia: number;
  public desSubcategoria: string;

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
  public listaCategoria: Categoria[] = [];
  public listaSubcategoria: Subcategoria[] = [];
  public listaInstancia: Instancia[] = [];

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
      this.codSubcategoriaChild = this.participanteEditar.codSubcategoria;
      this.codInstanciaChild = this.participanteEditar.codInstancia;
      this.formParticipante = this.formBuilder.group({
        identificacion: new FormControl(this.participanteEditar?.email, Validators.required),
        nombres: new FormControl(this.participanteEditar?.nombres, Validators.required),
        apellidos: new FormControl(this.participanteEditar?.apellidos),
        fechaNacimiento: new FormControl(dayjs(this.personaEditar?.fechaNacimiento).format("YYYY-MM-DD")),
        country: new FormControl(this.participanteEditar?.country),
        celular: new FormControl(this.participanteEditar?.celular),
        //correo: new FormControl(this.participanteEditar?.correo, Validators.required),
        dateLastActive: new FormControl(dayjs(this.participanteEditar?.dateLastActive).format("YYYY-MM-DD HH:mm")),
        username: new FormControl(this.participanteEditar?.username),
        codEstadoCompetencia: new FormControl(this.participanteEditar?.codEstadoCompetencia),
        numPuntajeJuez: new FormControl(this.participanteEditar?.numPuntajeJuez),
        codCategoria: new FormControl(this.participanteEditar?.codCategoria),
        codSubcategoria: new FormControl(this.participanteEditar?.codSubcategoria),
        codInstancia: new FormControl(this.participanteEditar?.codInstancia),
      })
      //AQUI TERMINA ACTUALIZAR
    } else {
      this.formParticipante = this.formBuilder.group({
        identificacion: new FormControl('', Validators.required),
        nombres: new FormControl('', Validators.required),
        apellidos: new FormControl(''),
        fechaNacimiento: new FormControl(''),
        country: new FormControl(''),
        celular: new FormControl(''),
        //correo: new FormControl('', Validators.required),
        dateLastActive: new FormControl(dayjs(new Date()).format("YYYY-MM-DD HH:mm")),
        username: new FormControl(''),
        codEstadoCompetencia: new FormControl(1),
        numPuntajeJuez: new FormControl(''),
        codCategoria: new FormControl('', Validators.required),
        codSubcategoria: new FormControl('', Validators.required),
        codInstancia: new FormControl(''),
      })
    }
    this.displayNoneInstancia = 'none';
    if (this.currentUser.cedula == "Suscriptor") {
      this.displayNone = 'none';
      this.displayNoneIntegrante2 = 'none';
      this.listarCategoriaActivo();
      //this.listarSubcategoriaPorCategoria();
      this.listarInstanciaActivo();
    }
  }

  listarCategoriaActivo() {
    this.participanteService.listarCategoriaActivo().subscribe(
      (respuesta) => {
        this.listaCategoria = respuesta['listado'];
      }
    )
  }

  listarSubcategoriaActivo() {
    this.participanteService.listarSubcategoriaActivo().subscribe(
      (respuesta) => {
        this.listaSubcategoria = respuesta['listado'];
      }
    )
  }

  listarSubcategoriaPorCategoria() {
    // Receptar la descripción de formParticipanteParametro.value
    let participanteTemp = this.formParticipante.value;
    this.codCategoria = participanteTemp?.codCategoria;
    this.participanteService.listarSubcategoriaPorCategoria(this.codCategoria).subscribe(
      (respuesta) => {
        this.listaSubcategoria = respuesta['listado'];
      }
    )
  }

  listarEstadoCompetenciaActivo() {
    this.participanteService.listarEstadoCompetenciaActivo().subscribe(
      (respuesta) => {
        this.listaEstadoCompetencia = respuesta['listado'];
      }
    )
  }

  obtenerCodInstancia() {
    // Receptar la codSubcategoria y codInstancia de formParticipanteParametro.value
    let participanteTemp = this.formParticipante.value;
    this.codSubcategoria = participanteTemp?.codSubcategoria;
    // obtener la subcategoria por codigo
    this.buscarSubcategoriaPorCodigo();
    this.codSubcategoriaChild = this.codSubcategoria;
    //this.codInstancia = participanteTemp?.codInstancia;
    this.codInstancia = 1;
    this.codInstanciaChild = this.codInstancia;
  }

  buscarSubcategoriaPorCodigo() {
    this.participanteService.buscarSubcategoriaPorCodigo(this.codSubcategoria).subscribe(
      (respuesta) => {
        this.desSubcategoria = respuesta['objeto']?.denominacion;
        this.codCategoria = respuesta['objeto']?.codCategoria;
        console.log("this.desSubcategoria = ", this.desSubcategoria)
        if (this.desSubcategoria.includes("PAREJA")) {
          console.log("PAREJA");
          this.displayNoneIntegrante2 = "";
        }
      }
    )
  }

  listarInstanciaActivo() {
    // Receptar codCategoria de formParticipanteParametro.value
    let participanteTemp = this.formParticipante.value;
    this.codSubcategoria = participanteTemp?.codSubcategoria;
    this.participanteService.listarInstanciaActivo().subscribe(
      (respuesta) => {
        this.listaInstancia = respuesta['listado'];
      }
    )
  }

  listarParticipantePorSubcategoriaInstancia = async () => {
    if (this.currentUser.cedula == "Suscriptor") {
      this.listarParticipantePorEmail();
    } else {
      await this.obtenerListaParticipante();
    }
  }

  // consultar participantes por codSubcategoria y codInstancia
  obtenerListaParticipante() {
    return new Promise((resolve, rejects) => {
      this.participanteService.listarParticipantePorSubcategoriaInstancia(this.participanteEditar?.codSubcategoria, this.participanteEditar?.codInstancia, 0).subscribe({
        next: (respuesta) => {
          this.listaParticipanteChild = respuesta['listado'];
          for (const ele of this.listaParticipanteChild) {
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          }
          this.listaParticipante.emit(this.listaParticipanteChild);
          resolve(respuesta);
        }, error: (error) => {
          rejects("Error");
        }
      })
    });
  }

  listarParticipantePorEmail() {
    this.participanteService.listarParticipantePorEmail(this.currentUser.identificacion).subscribe(
      (respuesta) => {
        this.listaParticipanteChild = respuesta['listado'];
        if (this.listaParticipante.length > 0) {
          for (const ele of this.listaParticipanteChild) {
            if (ele.identificacion == this.currentUser.identificacion) {
              ele.desCategoria = "DIRECTOR";
              ele.desSubcategoria = "ACADEMIA";
            }
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          }
          this.listaParticipante.emit(this.listaParticipanteChild);
        }
        console.log("", this.listaParticipante)
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
        this.formParticipante.controls.country.setValue(this.participante?.country);
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
      if (participanteTemp?.fechaNacimiento != "") {
        participanteTemp.fechaNacimiento = dayjs(participanteTemp?.fechaNacimiento).format("YYYY-MM-DD HH:mm:ss.SSS");
      }
      this.persona = new Persona({
        codigo: 0,
        identificacion: participanteTemp?.identificacion,
        nombres: participanteTemp?.nombres,
        apellidos: participanteTemp?.apellidos,
        //fechaNacimiento: dayjs(participanteTemp?.fechaNacimiento).format("YYYY-MM-DD HH:mm:ss.SSS"),
        fechaNacimiento: participanteTemp?.fechaNacimiento,
        celular: participanteTemp?.celular,
        correo: participanteTemp?.identificacion,
        cedula: this.currentUser.cedula,
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
          console.log("this.persona = ", this.persona)
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
        //email: participanteTemp.identificacion,
        email: this.currentUser.identificacion,
        codSubcategoria: this.codSubcategoriaChild,
        codInstancia: this.codInstanciaChild,
        country: participanteTemp?.country,
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
      this.participante.codSubcategoria = this.codSubcategoriaChild,
        this.participante.codInstancia = this.codInstanciaChild,
        this.participante.country = this.participanteAux['data'].country;
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
      this.participanteAux['data'].customerId = 0;
      this.participanteAux['data'].userId = 0;
      //this.participanteAux['data'].codSubcategoria = this.codSubcategoriaChild;
      //this.participanteAux['data'].codInstancia = this.codInstanciaChild;
      this.participanteAux['data'].codPersona = this.persona.codigo;
      this.participanteService.guardarParticipante(this.participanteAux['data']).subscribe({
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

  compararCategoria(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }

  compararSubcategoria(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }

  compararInstancia(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
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
  get countryField() {
    return this.formParticipante.get('country');
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
  get codCategoriaField() {
    return this.formParticipante.get('codCategoria');
  }
  get codSubcategoriaField() {
    return this.formParticipante.get('codSubcategoria');
  }
  get codInstanciaField() {
    return this.formParticipante.get('codInstancia');
  }

}
