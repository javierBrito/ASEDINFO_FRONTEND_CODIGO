import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Sede } from 'app/auth/models/sede';
import { Usuario } from 'app/main/pages/compartidos/modelos/Usuario';
import { MensajesIziToastService } from 'app/main/pages/compartidos/servicios/iziToast/mensajesIziToast.service';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { DetailComponent } from 'app/main/pages/seguridad/usuario/componentes/detail/detail.component';
import { UsuarioService } from '../../../servicios/usuario.service';
import { SedeService } from 'app/main/pages/seguridad/sede/servicios/sede.service';
import dayjs from "dayjs";
import { MyValidators } from 'app/utils/validators';
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { PrefijoTelefonico } from 'app/main/pages/compartidos/modelos/PrefijoTelefonico';
import { ModeloPuntaje } from 'app/main/pages/compartidos/modelos/ModeloPuntaje';
import { PuntajeService } from 'app/main/pages/competencia/puntaje/servicios/puntaje.service';
import { UsuarioModeloPuntaje } from 'app/main/pages/compartidos/modelos/UsuarioModeloPuntaje';
import { UsuarioModeloPuntajeOp } from 'app/main/pages/compartidos/modelos/UsuarioModeloPuntajeOp';
import { ModeloPuntajeOp } from 'app/main/pages/compartidos/modelos/ModeloPuntajeOp';

@Component({
  selector: 'app-form-usuario',
  templateUrl: './form-usuario.component.html',
  styleUrls: ['./form-usuario.component.scss']
})
export class FormUsuarioComponent implements OnInit {
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
  public formUsuario: FormGroup;

  /*OBJETOS*/
  public usuario: Usuario;
  public persona: Persona;
  public usuarioModeloPuntaje: UsuarioModeloPuntaje;
  public listaUsuarioModeloPuntaje: UsuarioModeloPuntaje[] = [];
  public usuarioModeloPuntajeOp: UsuarioModeloPuntaje;
  public listaUsuarioModeloPuntajeOp: UsuarioModeloPuntaje[] = [];
  public listaSede: Sede[];
  public listaPersonaAux: Persona[];
  public listaUsuario: Usuario[];
  public listaRespuesta = [
    { valor: "SI" },
    { valor: "NO" },
  ];
  public listaPrefijoTelefonico: PrefijoTelefonico[];
  public listaModeloPuntaje: ModeloPuntaje[];
  public listaModeloPuntajeOp: ModeloPuntajeOp[];

  /*CONSTRUCTOR*/
  constructor(
    private usuarioService: UsuarioService,
    private personaService: PersonaService,
    private sedeService: SedeService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private mensajeIzi: MensajesIziToastService,
    private puntajeService: PuntajeService,
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
    this.listarSedeActivo();
    if (this.personaEditar) {
      this.formUsuario = this.formBuilder.group({
        identificacion: new FormControl({ value: this.personaEditar?.identificacion, disabled: true }, Validators.required),
        /*
        identificacion: new FormControl({ value: this.personaEditar.identificacion, disabled: true }, Validators.compose([
          MyValidators.isCedulaValid,
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern("^[0-9]*$"),
        ])),
        */
        nombres: new FormControl(this.personaEditar?.nombres, Validators.required),
        apellidos: new FormControl(this.personaEditar?.apellidos),
        fechaNacimiento: new FormControl(dayjs(this.personaEditar?.fechaNacimiento).format("YYYY-MM-DD")),
        direccion: new FormControl(this.personaEditar?.direccion),
        celular: new FormControl(this.personaEditar?.celular),
        correo: new FormControl(this.personaEditar?.correo),
        cambioClave: new FormControl(this.personaEditar?.usuario?.cambioClave),
        actualizacionDatos: new FormControl(this.personaEditar?.usuario?.actualizacionDatos),
        codigo: new FormControl(this.personaEditar?.prefijoTelefonico),
        cedula: new FormControl(this.personaEditar?.cedula),
      })
      //AQUI TERMINA ACTUALIZAR
    } else {
      this.formUsuario = this.formBuilder.group({
        identificacion: new FormControl({ value: this.identificacionChild, disabled: false }, Validators.required),
        /*
        identificacion: new FormControl({ value: this.identificacionChild, disabled: false }, Validators.compose([
          MyValidators.isCedulaValid,
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern("^[0-9]*$"),
        ])),
        */
        sede: new FormControl(''),
        nombres: new FormControl('', Validators.required),
        apellidos: new FormControl(''),
        fechaNacimiento: new FormControl(''),
        direccion: new FormControl(''),
        celular: new FormControl(''),
        correo: new FormControl(''),
        cambioClave: new FormControl(''),
        actualizacionDatos: new FormControl(''),
        codigo: new FormControl('593'),
        cedula: new FormControl(''),
      })
      this.verificarPersona();
    }
    this.listarPrefijoTelefonico();
    this.listarModeloPuntajeActivo();
    this.listarModeloPuntajeOpActivo();
  }

  blurIdentificacion(event) {
    this.verificarPersona();
  }

  async listarPrefijoTelefonico() {
    this.personaService.listarPrefijoTelefonico().subscribe(
      (respuesta) => {
        this.listaPrefijoTelefonico = respuesta['listado'];
      }
    );
  }

  async listarModeloPuntajeActivo() {
    this.puntajeService.listarModeloPuntajeActivo().subscribe(
      (respuesta) => {
        this.listaModeloPuntaje = respuesta['listado'];
        if (this.codigoChild != null && this.codigoChild != 0) {
          this.puntajeService.listarUsuarioModeloPuntajePorUsuario(this.codigoChild).subscribe(
            (respuesta) => {
              this.listaUsuarioModeloPuntaje = respuesta['listado'];
              if (this.listaUsuarioModeloPuntaje == null) {
                this.listaUsuarioModeloPuntaje = [];
              }
              if (this.listaUsuarioModeloPuntaje.length > 0) {
                for (const ele of this.listaModeloPuntaje) {
                  ele.asignado = false;
                  for (const ele1 of this.listaUsuarioModeloPuntaje) {
                    if (ele?.codigo == ele1?.codModeloPuntaje) {
                      ele.asignado = true;
                    }
                  }
                }
              }
            }
          );
        }
      }
    );
  }

  async listarModeloPuntajeOpActivo() {
    this.puntajeService.listarModeloPuntajeOpActivo().subscribe(
      (respuesta) => {
        this.listaModeloPuntajeOp = respuesta['listado'];
        if (this.codigoChild != null && this.codigoChild != 0) {
          this.puntajeService.listarUsuarioModeloPuntajeOpPorUsuario(this.codigoChild).subscribe(
            (respuesta) => {
              this.listaUsuarioModeloPuntajeOp = respuesta['listado'];
              if (this.listaUsuarioModeloPuntajeOp == null) {
                this.listaUsuarioModeloPuntajeOp = [];
              }
              if (this.listaUsuarioModeloPuntajeOp.length > 0) {
                for (const ele of this.listaModeloPuntajeOp) {
                  ele.asignado = false;
                  for (const ele1 of this.listaUsuarioModeloPuntajeOp) {
                    if (ele?.codigo == ele1?.codModeloPuntaje) {
                      ele.asignado = true;
                    }
                  }
                }
              }
            }
          );
        }
      }
    );
  }

  buscarPrefijoTelefonico() {
    // Receptar el codigo de formCliente.value
    let formUsuarioTemp = this.formUsuario.value;
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

  async listarUsuarioPorIdentificacion() {
    this.personaService.listarPersonaPorIdentificacion(this.identificacionChild).subscribe(
      (respuesta) => {
        this.listaPersonaChild = respuesta['listado']
        for (const ele of this.listaPersonaChild) {
          ele.fechaNacimiento = dayjs(ele.fechaNacimiento).format("YYYY-MM-DD")
          if (ele.codigoSede != null) {
            this.sedeService.buscarSedePorCodigo(ele.codigoSede).subscribe(
              (respuesta) => {
                ele.sede = respuesta['objeto'];
              }
            )
          }
          if (ele.codigo != null) {
            this.usuarioService.listarUsuarioPorPersona(ele.codigo).subscribe(
              (respuesta) => {
                this.listaUsuario = respuesta['listado'];
                ele.usuario = this.listaUsuario[0];
                ele.usuario.fechaInicio = dayjs(ele.usuario.fechaInicio).format("YYYY-MM-DD")
              }
            )
          }
        }
        this.listaPersona.emit(this.listaPersonaChild);
      }
    );
  }

  verificarPersona() {
    // Receptar la identificación de formUsuario.value
    let formUsuarioTemp = this.formUsuario.value;
    this.identificacionChild = formUsuarioTemp.identificacion;
    this.personaService.listarPersonaPorIdentificacion(this.identificacionChild).subscribe({
      next: (response) => {
        this.listaPersonaAux = response['listado'];
        this.persona = this.listaPersonaAux['0'];
        if (this.persona?.codigo != null) {
          this.formUsuario.controls.fechaNacimiento.setValue(dayjs(this.persona?.fechaNacimiento).format("YYYY-MM-DD"));
          this.formUsuario.controls.nombres.setValue(this.persona?.nombres);
          this.formUsuario.controls.apellidos.setValue(this.persona?.apellidos);
          this.formUsuario.controls.direccion.setValue(this.persona?.direccion);
          this.formUsuario.controls.correo.setValue(this.persona?.correo);
          this.formUsuario.controls.celular.setValue(this.persona?.celular);

          this.usuarioService.listarUsuarioPorPersona(this.persona?.codigo).subscribe(
            (respuesta) => {
              this.listaUsuario = respuesta['listado'];
              this.persona.usuario = this.listaUsuario[0];
              if (this.persona.usuario != undefined) {
                this.persona.usuario.fechaInicio = dayjs(this.persona.usuario.fechaInicio).format("YYYY-MM-DD");
                this.formUsuario.controls.fechaInicio.setValue(dayjs(this.persona.usuario?.fechaInicio).format("YYYY-MM-DD"));
                this.formUsuario.controls.tipoUsuario.setValue(this.persona.usuario?.tipoUsuario);
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

  guardarUsuarioModeloPuntaje(modeloPuntaje: ModeloPuntaje, event: any, indice: number) {
    if (event.target.checked) {
      this.usuarioModeloPuntaje = new UsuarioModeloPuntaje();
      this.usuarioModeloPuntaje = {
        codigo: 0,
        codUsuario: 0,
        codModeloPuntaje: modeloPuntaje?.codigo,
        estado: 'A',
      };
      this.listaUsuarioModeloPuntaje.push(this.usuarioModeloPuntaje);
    } else {
      let indice1 = 0;
      if (this.listaUsuarioModeloPuntaje.length > 0) {
        for (const ele1 of this.listaUsuarioModeloPuntaje) {
          if (modeloPuntaje.codigo == ele1?.codModeloPuntaje) {
            break;
          }
          indice1 = indice1 + 1;
        }
      }
      this.listaUsuarioModeloPuntaje.splice(indice1, 1);
    }
  }

  guardarUsuarioModeloPuntajeOp(modeloPuntajeOp: ModeloPuntajeOp, event: any, indice: number) {
    if (event.target.checked) {
      this.usuarioModeloPuntajeOp = new UsuarioModeloPuntajeOp();
      this.usuarioModeloPuntajeOp = {
        codigo: 0,
        codUsuario: 0,
        codModeloPuntaje: modeloPuntajeOp?.codigo,
        estado: 'A',
      };
      this.listaUsuarioModeloPuntajeOp.push(this.usuarioModeloPuntajeOp);
    } else {
      let indice1 = 0;
      if (this.listaUsuarioModeloPuntajeOp.length > 0) {
        for (const ele1 of this.listaUsuarioModeloPuntajeOp) {
          if (modeloPuntajeOp?.codigo == ele1?.codModeloPuntaje) {
            break;
          }
          indice1 = indice1 + 1;
        }
      }
      this.listaUsuarioModeloPuntajeOp.splice(indice1, 1);
    }
  }

  addRegistroPersona() {
    let fechaNacimiento = "";
    if (this.formUsuario?.valid) {
      let usuarioTemp = this.formUsuario.value;
      if (usuarioTemp?.fechaNacimiento.length != 0 && usuarioTemp?.fechaNacimiento.length != 12) {
        fechaNacimiento = dayjs(usuarioTemp?.fechaNacimiento).format("YYYY-MM-DD HH:mm:ss.SSS");
      }
      this.persona = new Persona({
        codigo: 0,
        identificacion: usuarioTemp?.identificacion,
        nombres: usuarioTemp?.nombres,
        apellidos: usuarioTemp?.apellidos,
        fechaNacimiento: fechaNacimiento,
        direccion: usuarioTemp?.direccion,
        celular: usuarioTemp?.celular,
        correo: usuarioTemp?.correo,
        estado: 'A',
        prefijoTelefonico: usuarioTemp?.codigo,
        cedula: usuarioTemp?.cedula,
      });
    }
    if (this.personaEditar) {
      this.persona['data'].codigo = this.personaEditar?.codigo;
      this.persona['data'].identificacion = this.identificacionChild;
      this.personaService.guardarPersona(this.persona['data']).subscribe({
        next: (response) => {
          // Actualizar Datos Usuario
          this.addRegistroUsuario();
          // Actualiza la lista
          //this.listarUsuarioPorIdentificacion();
          //this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
          //this.parentDetail.closeDetail();
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
          // Actualizar Datos Usuario
          this.addRegistroUsuario();
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    }
  }

  addRegistroUsuario() {
    if (this.formUsuario?.valid) {
      let usuarioTemp = this.formUsuario.value;
      let codSede = 0;
      if (usuarioTemp?.sede != undefined) {
        codSede = usuarioTemp.sede?.codigo;
      }
      this.usuario = new Usuario({
        codigo: 0,
        codPersona: this.persona?.codigo,
        cambioClave: usuarioTemp.cambioClave,
        actualizacionDatos: usuarioTemp.actualizacionDatos,
        estado: 'A',
        codSede: codSede,
      });
    }
    if (this.personaEditar) {
      this.usuario['data'].codigo = this.personaEditar?.usuario?.codigo;
      this.usuarioService.guardarUsuario(this.usuario['data']).subscribe({
        next: (response) => {
          this.usuario = response['objeto'];
          for (let ele of this.listaUsuarioModeloPuntaje) {
            ele.codUsuario = this.usuario.codigo;
          }
          if (this.listaUsuarioModeloPuntaje.length > 0) {
            this.puntajeService.guardarListaUsuarioModeloPuntaje(this.listaUsuarioModeloPuntaje).subscribe({
              next: async (response) => {
                this.listarUsuarioPorIdentificacion();
                this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
                this.parentDetail.closeDetail();
              },
              error: (error) => {
                this.listarUsuarioPorIdentificacion();
                this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
                this.parentDetail.closeDetail();
              }
            });
          } else {
            this.listarUsuarioPorIdentificacion();
            this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
            this.parentDetail.closeDetail();
          }
          for (let ele of this.listaUsuarioModeloPuntajeOp) {
            ele.codUsuario = this.usuario.codigo;
          }
          if (this.listaUsuarioModeloPuntajeOp.length > 0) {
            this.puntajeService.guardarListaUsuarioModeloPuntajeOp(this.listaUsuarioModeloPuntajeOp).subscribe({
              next: async (response) => {
                this.listarUsuarioPorIdentificacion();
                this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
                this.parentDetail.closeDetail();
              },
              error: (error) => {
                this.listarUsuarioPorIdentificacion();
                this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
                this.parentDetail.closeDetail();
              }
            });
          } else {
            this.listarUsuarioPorIdentificacion();
            this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
            this.parentDetail.closeDetail();
          }
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    } else {
      this.usuarioService.guardarUsuario(this.usuario['data']).subscribe({
        next: async (response) => {
          this.usuario = response['objeto'];
          if (this.listaUsuarioModeloPuntaje.length > 0) {
            for (let ele of this.listaUsuarioModeloPuntaje) {
              ele.codUsuario = this.usuario.codigo;
            }
            this.puntajeService.guardarListaUsuarioModeloPuntaje(this.listaUsuarioModeloPuntaje).subscribe({
              next: async (response) => {
                this.listarUsuarioPorIdentificacion();
                this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
                this.parentDetail.closeDetail();
              },
              error: (error) => {
                this.listarUsuarioPorIdentificacion();
                this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
                this.parentDetail.closeDetail();
              }
            });
          } else {
            this.listarUsuarioPorIdentificacion();
            this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
            this.parentDetail.closeDetail();
          }
          if (this.listaUsuarioModeloPuntajeOp.length > 0) {
            for (let ele of this.listaUsuarioModeloPuntajeOp) {
              ele.codUsuario = this.usuario.codigo;
            }
            this.puntajeService.guardarListaUsuarioModeloPuntajeOp(this.listaUsuarioModeloPuntajeOp).subscribe({
              next: async (response) => {
                this.listarUsuarioPorIdentificacion();
                this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
                this.parentDetail.closeDetail();
              },
              error: (error) => {
                this.listarUsuarioPorIdentificacion();
                this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
                this.parentDetail.closeDetail();
              }
            });
          } else {
            this.listarUsuarioPorIdentificacion();
            this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
            this.parentDetail.closeDetail();
          }
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

  compararPrefijoTelefonico(o1, o2) {
    return o1 === undefined || o2 === undefined || o2 === null ? false : o1.codigo === o2.codigo;
  }

  // Contar los caracteres de la cedula para activar boton <Buscar>
  onKey(event) {
    if (event.target.value.length != 10) {
      this.resetTheForm();
    } else {
      this.verificarPersona();
    }
  }

  resetTheForm(): void {
    this.formUsuario.reset = null;
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
    return this.formUsuario.get('identificacion');
  }
  get nombresField() {
    return this.formUsuario.get('nombres');
  }
  get apellidosField() {
    return this.formUsuario.get('apellidos');
  }
  get fechaNacimientoField() {
    return this.formUsuario.get('fechaNacimiento');
  }
  get direccionField() {
    return this.formUsuario.get('direccion');
  }
  get celularField() {
    return this.formUsuario.get('celular');
  }
  get correoField() {
    return this.formUsuario.get('correo');
  }
  get tipoUsuarioField() {
    return this.formUsuario.get('tipoUsuario');
  }
  get fechaInicioField() {
    return this.formUsuario.get('fechaInicio');
  }
  get cedulaField() {
    return this.formUsuario.get('cedula');
  }
  get codigoField() {
    return this.formUsuario.get('codigo');
  }
}
