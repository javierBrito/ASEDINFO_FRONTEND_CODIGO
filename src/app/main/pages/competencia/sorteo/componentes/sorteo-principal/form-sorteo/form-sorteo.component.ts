import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MensajesIziToastService } from 'app/main/pages/compartidos/servicios/iziToast/mensajesIziToast.service';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { DetailComponent } from 'app/main/pages/competencia/sorteo/componentes/detail/detail.component';
import dayjs from "dayjs";
import { MyValidators } from 'app/utils/validators';
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { EstadoCompetencia } from 'app/main/pages/compartidos/modelos/EstadoCompetencia';
import { delay } from 'rxjs/operators';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { Subcategoria } from 'app/main/pages/compartidos/modelos/Subcategoria';
import { Instancia } from 'app/main/pages/compartidos/modelos/Instancia';
import { CargarArchivoModelo } from 'app/main/pages/compartidos/modelos/CargarArchivoModelo';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Integrante } from 'app/main/pages/compartidos/modelos/Integrante';
import { saveAs } from 'file-saver';
import { ParticipanteService } from 'app/main/pages/competencia/participante/servicios/participante.service';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';

@Component({
  selector: 'app-form-sorteo',
  templateUrl: './form-sorteo.component.html',
  styleUrls: ['./form-sorteo.component.scss']
})
export class FormSorteoComponent implements OnInit {
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
  @Input() customerIdChild: number;
  @Input() userIdChild: number;

  @ViewChild("myModalInfo", { static: false }) myModalInfo: TemplateRef<any>;
  @ViewChild("myModalConf", { static: false }) myModalConf: TemplateRef<any>;

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
  public displayNoneIntegranteGrupo: string = '';
  public codCategoria: number;
  public codSubcategoria: number;
  public codInstancia: number;
  public desSubcategoria: string;
  public nombreCancion: string;
  public nombreIntegrante: string;

  /*FORMULARIOS*/
  public formSorteo: FormGroup;

  // TRATAR ARCHIVOS
  // Lista de archivos seleccionados
  public selectedFiles: FileList;
  // Es el array que contiene los items para mostrar el progreso de subida de cada archivo
  public progressInfo = [];
  // Mensaje que almacena la respuesta de las Apis
  public message = '';
  // Nombre del archivo para usarlo posteriormente en la vista html
  public fileName = "";
  // Lista para obtener los archivos
  public fileInfos: CargarArchivoModelo[] = [];
  public pdfFileURL: any;
  public fileStatus = { status: '', requestType: '', percent: 0 };
  public filenames: string[] = [];
  public listaBase64: any;
  public nombreArchivoDescarga: string;
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
  public listaIntegrante: Integrante[] = [];
  public integrante: Integrante;

  /*CONSTRUCTOR*/
  constructor(
    private participanteService: ParticipanteService,
    private personaService: PersonaService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private mensajeIzi: MensajesIziToastService,
    private modalService: NgbModal
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
    this.listarEstadoActivo();
    if (this.participanteEditar) {
      this.codSubcategoriaChild = this.participanteEditar.codSubcategoria;
      this.codInstanciaChild = this.participanteEditar.codInstancia;
      this.formSorteo = this.formBuilder.group({
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
      this.formSorteo = this.formBuilder.group({
        identificacion: new FormControl('', Validators.required),
        nombres: new FormControl('', Validators.required),
        apellidos: new FormControl(''),
        fechaNacimiento: new FormControl(''),
        country: new FormControl(''),
        celular: new FormControl(''),
        //correo: new FormControl('', Validators.required),
        dateLastActive: new FormControl(dayjs(new Date()).format("YYYY-MM-DD HH:mm")),
        username: new FormControl(''),
        codEstado: new FormControl(1),
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
      this.displayNoneIntegranteGrupo = 'none';
      this.listarCategoriaActivo();
      //this.listarSubcategoriaPorCategoria();
      this.listarInstanciaActivo();
    }
    //this.verpdf();
  }

  adicionarIntegrante() {
    // Receptar la codSubcategoria y codInstancia de formSorteo.value
    let sorteoTemp = this.formSorteo.value;
    this.nombreIntegrante = sorteoTemp?.apellidos;
    let auxBusqueda: any;
    if (this.listaIntegrante.length > 0) {
      auxBusqueda = this.listaIntegrante.find(obj => obj.nombre == this.nombreIntegrante)
    }
    if (this.nombreIntegrante.length > 0 && !auxBusqueda) {
      this.integrante = new Integrante();
      this.integrante = {
        codigo: 0,
        nombre: this.nombreIntegrante,
        codParticipante: 0,
        estado: "A",
      }
      this.listaIntegrante.push(this.integrante);
      this.formSorteo.controls.apellidos.setValue("");
    } else {
      this.mensajeService.mensajeError('Ingrese nombre integrante, no repita...');
    }
  }

  mostrarModalInfo() {
    this.modalService.open(this.myModalInfo);
  }

  mostrarModalConf() {
    this.modalService.open(this.myModalConf).result.then(r => {
    }, error => {
    });
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
    this.displayNoneIntegrante2 = "none";
    this.displayNoneIntegranteGrupo = "none";
    // Receptar la descripción de formSorteo.value
    let sorteoTemp = this.formSorteo.value;
    this.codCategoria = sorteoTemp?.codCategoria;
    this.participanteService.listarSubcategoriaPorCategoria(this.codCategoria).subscribe(
      (respuesta) => {
        this.listaSubcategoria = respuesta['listado'];
      }
    )
  }

  listarEstadoActivo() {
    this.participanteService.listarEstadoCompetenciaActivo().subscribe(
      (respuesta) => {
        this.listaEstadoCompetencia = respuesta['listado'];
      }
    )
  }

  obtenerCodInstancia() {
    this.displayNoneIntegrante2 = "none";
    this.displayNoneIntegranteGrupo = "none";
    // Receptar la codSubcategoria y codInstancia de formSorteo.value
    let sorteoTemp = this.formSorteo.value;
    this.codSubcategoria = sorteoTemp?.codSubcategoria;
    // obtener la subcategoria por codigo
    this.buscarSubcategoriaPorCodigo();
    this.codSubcategoriaChild = this.codSubcategoria;
    //this.codInstancia = sorteoTemp?.codInstancia;
    this.codInstancia = 1;
    this.codInstanciaChild = this.codInstancia;
  }

  buscarSubcategoriaPorCodigo() {
    this.participanteService.buscarSubcategoriaPorCodigo(this.codSubcategoria).subscribe(
      (respuesta) => {
        this.desSubcategoria = respuesta['objeto']?.denominacion;
        this.codCategoria = respuesta['objeto']?.codCategoria;
        if (this.desSubcategoria.includes("PAREJA") || this.desSubcategoria.includes("DUO")) {
          this.displayNoneIntegrante2 = "";
        }
        if (this.desSubcategoria.includes("GRUPOS") || this.desSubcategoria.includes("CREW") ||
          this.desSubcategoria.includes("SHOW DANCE")) {
          this.displayNoneIntegrante2 = "";
          this.displayNoneIntegranteGrupo = "";
        }
      }
    )
  }

  listarInstanciaActivo() {
    // Receptar codCategoria de formSorteoParametro.value
    let sorteoTemp = this.formSorteo.value;
    this.codSubcategoria = sorteoTemp?.codSubcategoria;
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
        if (this.listaParticipanteChild.length > 0) {
          for (const ele of this.listaParticipanteChild) {
            if (ele.identificacion == this.currentUser.identificacion) {
              ele.desCategoria = "DIRECTOR";
              ele.desSubcategoria = "ACADEMIA";
            }
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          }
          this.listaParticipante.emit(this.listaParticipanteChild);
        }
      }
    );
  }

  buscarPersonaPorCodigo(codPersona: number) {
    this.personaService.buscarPersonaPorCodigo(codPersona).subscribe({
      next: (response) => {
        this.personaEditar = response['objeto'];
        /*
        this.formSorteo.controls.fechaNacimiento.setValue(dayjs(this.participante?.fechaNacimiento).format("YYYY-MM-DD"));
        this.formSorteo.controls.nombres.setValue(this.participante?.nombres);
        this.formSorteo.controls.apellidos.setValue(this.participante?.apellidos);
        this.formSorteo.controls.country.setValue(this.participante?.country);
        this.formSorteo.controls.correo.setValue(this.participante?.correo);
        this.formSorteo.controls.celular.setValue(this.participante?.celular);
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
    if (this.formSorteo?.valid) {
      let sorteoTemp = this.formSorteo.value;
      /*
      if (this.currentUser.cedula == "Suscriptor") {
        if (this.currentUser.identificacion != sorteoTemp?.identificacion) {
        }
      }
      */
      if (sorteoTemp?.fechaNacimiento != "") {
        sorteoTemp.fechaNacimiento = dayjs(sorteoTemp?.fechaNacimiento).format("YYYY-MM-DD HH:mm:ss.SSS");
      }
      this.persona = new Persona({
        codigo: 0,
        identificacion: sorteoTemp?.identificacion,
        nombres: sorteoTemp?.nombres,
        apellidos: sorteoTemp?.apellidos,
        //fechaNacimiento: dayjs(sorteoTemp?.fechaNacimiento).format("YYYY-MM-DD HH:mm:ss.SSS"),
        fechaNacimiento: sorteoTemp?.fechaNacimiento,
        celular: sorteoTemp?.celular,
        correo: sorteoTemp?.identificacion,
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
    if (this.formSorteo?.valid) {
      let sorteoTemp = this.formSorteo.value;
      this.participanteAux = new Participante({
        codigo: 0,
        firstName: sorteoTemp?.nombres,
        lastName: sorteoTemp?.apellidos,
        username: sorteoTemp.username,
        customerId: this.customerIdChild,
        userId: this.userIdChild,
        //email: sorteoTemp.identificacion,
        email: this.currentUser.identificacion,
        codSubcategoria: this.codSubcategoriaChild,
        codInstancia: this.codInstanciaChild,
        country: sorteoTemp?.country,
        dateLastActive: dayjs(sorteoTemp.dateLastActive).format("YYYY-MM-DD HH:mm:ss.SSS"),
        codEstado: sorteoTemp?.codEstado,
        nombreCancion: this.nombreCancion,
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
      this.participanteAux['data'].codPersona = this.persona.codigo;
      this.participanteService.guardarParticipante(this.participanteAux['data']).subscribe({
        next: async (response) => {
          this.participante = response['objeto'];
          if (this.listaIntegrante.length > 0) {
            for (const ele of this.listaIntegrante) {
              ele.codParticipante = this.participante.codigo;
            }
            this.participanteService.guardarListaIntegrante(this.listaIntegrante).subscribe({
              next: async (response) => {
                this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
                this.parentDetail.closeDetail();
              },
              error: (error) => {
                this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
                this.parentDetail.closeDetail();
              }
            });
          } else {
            this.listarParticipantePorSubcategoriaInstancia();
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

  compararParticipante(o1, o2) {
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

  // Tomar el valor nombres y convertirlo en identificacion
  blurIdentificacion(event) {
    if (event.target.value.length != 0) {
      let sorteoTemp = this.formSorteo.value;
      if (sorteoTemp?.identificacion == "") {
        this.formSorteo.controls.identificacion.setValue((event.target.value.replace(" ", ".")).toLowerCase());
      }
    }
  }

  resetTheForm(): void {
    this.formSorteo.reset = null;
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

  // Tratar Archivos
  selectFiles(event) {
    this.progressInfo = [];
    event.target.files.length == 1 ? this.fileName = event.target.files[0].name : this.fileName = event.target.files.length + " archivos";
    this.selectedFiles = event.target.files;
  }

  cargarArchivos() {
    this.message = '';
    for (let i = 0; i < this.selectedFiles.length; i++) {
      this.cargarArchivo(i, this.selectedFiles[i]);
      this.previsualizarArchivo(i, this.selectedFiles[i]);
    }
  }

  previsualizarArchivo(index, file) {
    //Previsualizar archivo
    this.pdfFileURL = URL.createObjectURL(file);
    document.getElementById('vistaPreviaDJ1').setAttribute('src', this.pdfFileURL);
  }

  cargarArchivo(index, file) {
    // Receptar identificacion de formSorteo.value
    let sorteoTemp = this.formSorteo.value;
    this.nombreCancion = sorteoTemp?.identificacion + "_" + file?.name;
    this.participanteService.cargarArchivo(file, sorteoTemp?.identificacion).subscribe(
      async (respuesta) => {
        //console.log("respuesta = ", respuesta);
      }, err => {
        console.log("err = ", err);
        if (err == "OK") {
          this.mensajeService.mensajeCorrecto('Se cargo el archivo a la carpeta');
        } else {
          this.message = 'No se puede subir el archivo ' + file.name;
        }
      }
    );
  }

  deleteFile(filename: string) {
    this.participanteService.deleteFile(filename).subscribe(res => {
      this.message = res['message'];
      this.listarArchivos();
    });
  }

  // Descargar archivos PDF desde una carpeta y los muestra en una lista
  listarArchivos() {
    this.participanteService.descargarArchivos().subscribe(
      (respuesta) => {
        this.fileInfos = respuesta;
      }
    );
  }

  // Descargar archivo PDF desde una carpeta
  descargarArchivo(filename: string): void {
    this.nombreArchivoDescarga = filename;
    this.participanteService.descargarArchivo(filename, '1').subscribe(
      event => {
        console.log(event);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }

  //métod temporal para vizualizar un pdf a partir de un código en base64
  //nombreArchivoDescarga = "";
  async verpdf() {
    // this.nombreArchivoDescarga = this.amieRegex + ".pdf";
    this.participanteService.vizualizarArchivo("solista_salsa.mp3").subscribe(
      event => {
        this.resportProgress(event);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.mensajeService.mensajeError("Error: No se pudo descargar el documento")
      }
    );
  }

  //filenames: string[] = [];
  private resportProgress(httpEvent: HttpEvent<string[] | Blob>): void {
    switch (httpEvent.type) {
      case HttpEventType.UploadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Uploading... ');
        break;
      case HttpEventType.DownloadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Downloading... ');
        break;
      case HttpEventType.ResponseHeader:
        // console.log('Header returned', httpEvent);
        break;
      case HttpEventType.Response:
        if (httpEvent.body instanceof Array) {
          this.fileStatus.status = 'done';
          for (const filename of httpEvent.body) {
            this.filenames.unshift(filename);
          }
        } else {
          saveAs(new Blob([httpEvent.body!],
            { type: `${httpEvent.headers.get('Content-Type')};charset=utf-8` }),
            "solista_salsa.mp3");
        }
        this.fileStatus.status = 'done';
        break;
      default:
        break;
    }
  }

  //fileStatus = { status: '', requestType: '', percent: 0 };
  private updateStatus(loaded: number, total: number, requestType: string): void {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round(100 * loaded / total);

  }

  get identificacionField() {
    return this.formSorteo.get('identificacion');
  }
  get nombresField() {
    return this.formSorteo.get('nombres');
  }
  get apellidosField() {
    return this.formSorteo.get('apellidos');
  }
  get fechaNacimientoField() {
    return this.formSorteo.get('fechaNacimiento');
  }
  get countryField() {
    return this.formSorteo.get('country');
  }
  get celularField() {
    return this.formSorteo.get('celular');
  }
  get correoField() {
    return this.formSorteo.get('correo');
  }
  get usernameField() {
    return this.formSorteo.get('username');
  }
  get dateLastActiveField() {
    return this.formSorteo.get('dateLastActive');
  }
  get codEstadoField() {
    return this.formSorteo.get('codEstado');
  }
  get numPuntajeJuezField() {
    return this.formSorteo.get('numPuntajeJuez');
  }
  get codCategoriaField() {
    return this.formSorteo.get('codCategoria');
  }
  get codSubcategoriaField() {
    return this.formSorteo.get('codSubcategoria');
  }
  get codInstanciaField() {
    return this.formSorteo.get('codInstancia');
  }

}
