import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import dayjs from "dayjs";
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { empty } from 'rxjs';
import { ParticipanteService } from '../../servicios/participante.service';
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { Instancia } from 'app/main/pages/compartidos/modelos/Instancia';
import { Subcategoria } from 'app/main/pages/compartidos/modelos/Subcategoria';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { EstadoCompetencia } from 'app/main/pages/compartidos/modelos/EstadoCompetencia';
import { CargarArchivoModelo } from 'app/main/pages/compartidos/modelos/CargarArchivoModelo';
import { HttpErrorResponse, HttpEvent, HttpEventType, HttpUrlEncodingCodec } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { AudioService } from 'app/main/pages/compartidos/servicios/audio.service';
import { DataService } from 'app/main/pages/compartidos/servicios/data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Integrante } from 'app/main/pages/compartidos/modelos/Integrante';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TransaccionService } from 'app/main/pages/venta/transaccion/servicios/transaccion.service';
import moment from 'moment';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-participante-principal',
  templateUrl: './participante-principal.component.html',
  styleUrls: ['./participante-principal.component.scss']
})
export class ParticipantePrincipalComponent implements OnInit {
  /*INPUT RECIBEN*/

  /*MODALES*/
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;

  @ViewChild("myModalInfo", { static: false }) myModalInfo: TemplateRef<any>;
  @ViewChild("modalIntegrante", { static: false }) modalIntegrante: TemplateRef<any>;

  /*VARIABLES*/
  public codigo: number;
  public institucion: any;
  public codigoSede = null;
  public codCategoria: number;
  public codSubcategoria: number;
  public codInstancia: number;
  public desCategoria: string;
  public desSubcategoria: string;
  public desInstancia: string;
  public habilitarAgregarParticipante: boolean;
  public habilitarSeleccionarArchivo: boolean;
  public displayNone: string = '';
  public displayNone1: string = 'none';
  public disabledEstado: boolean;
  public customerId: number;
  public userId: number;
  public pathCancion: string = "./assets/musica/";
  public tituloLista: string = "";
  public nombreArchivoDescarga: string;
  public crearPDF: boolean = false;
  public crearPDFCancion: boolean = false;
  public listarPorInstancia: boolean = false;
  public enviarNotificacion: boolean = false;
  public respuestaEnvioNotificacion: string = "";
  public numeroEnvioNotificacion: number = 0;

  /*LISTAS*/
  public listaParticipante: Participante[] = [];
  public listaParticipantePDF: Participante[] = [];
  public listaParticipanteUsuario: Participante[] = [];
  public listaPersona: Persona[] = [];
  public listaCategoria: Categoria[] = [];
  public listaSubcategoria: Subcategoria[] = [];
  public listaInstancia: Instancia[] = [];
  public listaEstadoCompetencia: EstadoCompetencia[] = [];
  public listaIntegrante: Integrante[] = [];

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

  /*TABS*/
  public selectedTab: number;

  /*OBJETOS*/
  private currentUser: LoginAplicacion;
  private sede: Sede;

  /*DETAIL*/
  public showDetail: boolean;

  /*PAGINACION*/
  public page: number;
  public itemsRegistros: number;

  /*OBJETOS*/
  public participanteSeleccionado: Participante;
  public participante: Participante;

  /*FORMULARIOS*/
  public formParticipante: FormGroup;
  public formParticipanteParametro: FormGroup;

  // Inicio - Audio
  state;
  currentFile = {
    index: 0
  };
  files = [];
  index = 0;
  // Fin - Audio

  /*CONSTRUCTOR */
  constructor(
    /*Servicios*/
    private readonly participanteService: ParticipanteService,
    private readonly personaService: PersonaService,
    private readonly transaccionService: TransaccionService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private audioService: AudioService,
    private dataService: DataService,
    private modalService: NgbModal
  ) {
    this.codigo = 0;
    this.codigoSede = 0;
    this.itemsRegistros = 10;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.sede = this.currentUser.sede;
    this.habilitarAgregarParticipante = true;
    this.habilitarSeleccionarArchivo = false;
    // Fechas en español
    moment.locale("es");
  }

  ngOnInit() {
    this.formParticipanteParametro = this.formBuilder.group({
      codCategoria: new FormControl('', Validators.required),
      codSubcategoria: new FormControl('', Validators.required),
      codInstancia: new FormControl('', Validators.required),
    })
    this.listarCategoriaActivo();
    this.listarEstadoCompetenciaActivo();
    if (this.currentUser.cedula == "Suscriptor") {
      this.tituloLista = "Lista Participantes del Suscriptor: " + this.currentUser.nombre;
      this.disabledEstado = true;
      this.displayNone = 'none';
      this.listarParticipantePorEmail();
    } else {
      this.disabledEstado = false;
      //this.displayNone1 = 'none';
    }
  }

  listarIntegranteActivo() {
    this.participanteService.listarIntegranteActivo().subscribe(
      (respuesta) => {
        this.listaIntegrante = respuesta['listado'];
      }
    )
  }

  cargarParticipantes() {
    this.confirmarCargarParticipantes();
  }

  listarEstadoCompetenciaActivo() {
    this.participanteService.listarEstadoCompetenciaActivo().subscribe(
      (respuesta) => {
        this.listaEstadoCompetencia = respuesta['listado'];
      }
    )
  }

  listarCategoriaActivo() {
    this.disabledEstado = false;
    this.participanteService.listarCategoriaActivo().subscribe(
      (respuesta) => {
        this.listaCategoria = respuesta['listado'];
      }
    )
  }

  listarSubcategoriaPorCategoria() {
    this.page = 1;
    this.disabledEstado = false;
    this.habilitarAgregarParticipante = true;
    this.listaParticipante = [];
    // Receptar la descripción de formParticipanteParametro.value
    let participanteParametroTemp = this.formParticipanteParametro.value;
    this.codCategoria = participanteParametroTemp?.codCategoria;
    this.buscarCategoriaPorCodigo();
    this.participanteService.listarSubcategoriaPorCategoria(this.codCategoria).subscribe(
      (respuesta) => {
        this.listaSubcategoria = respuesta['listado'];
      }
    )
  }

  buscarCategoriaPorCodigo() {
    this.participanteService.buscarCategoriaPorCodigo(this.codCategoria).subscribe(
      (respuesta) => {
        this.desCategoria = respuesta['objeto']?.denominacion;
      }
    )
  }

  listarInstanciaActivo() {
    this.page = 1;
    this.disabledEstado = false;
    this.habilitarAgregarParticipante = true;
    this.listaParticipante = [];
    // Receptar codCategoria de formParticipanteParametro.value
    let participanteParametroTemp = this.formParticipanteParametro.value;
    this.codSubcategoria = participanteParametroTemp?.codSubcategoria;
    this.buscarSubcategoriaPorCodigo();
    this.participanteService.listarInstanciaActivo().subscribe(
      (respuesta) => {
        this.listaInstancia = respuesta['listado'];
      }
    )
  }

  buscarInstanciaPorCodigo() {
    this.participanteService.buscarInstanciaPorCodigo(this.codInstancia).subscribe(
      (respuesta) => {
        this.desInstancia = respuesta['objeto']?.denominacion;
        this.tituloLista = "Lista Participantes de: " + this.desCategoria + " - " + this.desSubcategoria + " - " + this.desInstancia;
      }
    )
  }

  buscarSubcategoriaPorCodigo() {
    this.participanteService.buscarSubcategoriaPorCodigo(this.codSubcategoria).subscribe(
      (respuesta) => {
        this.desSubcategoria = respuesta['objeto']?.denominacion;
        this.codCategoria = respuesta['objeto']?.codCategoria;
        this.buscarCategoriaPorCodigo();
      }
    )
  }

  recargarParticipante() {
    if (this.currentUser.cedula == "Suscriptor") {
      this.listarParticipantePorEmailAux();
    } else {
      this.disabledEstado = false;
      this.page = 1;
      this.listarParticipantePorSubcategoriaInstanciaAux();
    }
  }

  listarParticipanteGeneral() {
    if (this.currentUser.cedula == "Suscriptor") {
      this.listarParticipantePorEmail();
    } else {
      this.listarParticipantePorSubcategoriaInstancia();
    }
  }

  listarParticipantePorEmail() {
    this.displayNone1 = "";
    this.listaParticipante = [];
    // Receptar la codSubcategoria y codInstancia de formParticipanteParametro.value
    let participanteParametroTemp = this.formParticipanteParametro.value;
    this.codSubcategoria = participanteParametroTemp?.codSubcategoria;
    this.codInstancia = participanteParametroTemp?.codInstancia;
    //this.habilitarAgregarParticipante = true;
    this.habilitarAgregarParticipante = false;
    // Trabajar con el correo del Participante migrado
    this.participanteService.listarParticipantePorEmail(this.currentUser.correo).subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        if (this.listaParticipante.length < this.itemsRegistros) {
          this.page = 1;
        }
        if (this.listaParticipante.length > 0) {
          for (const ele of this.listaParticipante) {
            // Tratar nombre de Pariicipante
            if (ele?.nombrePareja != "" && ele?.nombrePareja != null) {
              ele.nombrePersona = ele?.nombrePersona + " - " + ele?.nombrePareja;
            }
            ele.displayNoneGrupo = "none";
            this.customerId = ele.customerId;
            this.userId = ele.userId;
            if (ele?.username != "" && ele.desCategoria == "PRE INFANTIL") {
              ele.desCategoria = "DIRECTOR";
              ele.desSubcategoria = "ACADEMIA";
            }
            if (ele.desSubcategoria.includes("GRUPOS") || ele.desSubcategoria.includes("CREW") ||
              ele.desSubcategoria.includes("SHOW DANCE")) {
              ele.displayNoneGrupo = "";
            }
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          }
          this.listaParticipantePDF = this.listaParticipante;
          if (this.crearPDF) {
            this.generarPDF();
            this.crearPDF = false;
          } else {
            if (this.crearPDFCancion) {
              this.generarPDFCancion();
              this.crearPDFCancion = false;
            }
          }
        }
      }
    );
  }

  listarParticipantePorSubcategoriaInstancia() {
    this.displayNone1 = "";
    this.listarPorInstancia = false;
    // Receptar la descripción de formParticipanteParametro.value
    let participanteParametroTemp = this.formParticipanteParametro.value;
    this.codSubcategoria = participanteParametroTemp?.codSubcategoria;
    this.codInstancia = participanteParametroTemp?.codInstancia;
    this.buscarInstanciaPorCodigo();
    this.habilitarAgregarParticipante = false;
    this.participanteService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, 0).subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        this.listarPorInstancia = true;
        if (this.listaParticipante.length < this.itemsRegistros) {
          this.page = 1;
        }
        for (const ele of this.listaParticipante) {
          // Tratar nombre de Pariicipante
          if (ele?.nombrePareja != "" && ele?.nombrePareja != null) {
            ele.nombrePersona = ele?.nombrePersona + " - " + ele?.nombrePareja;
          }
          ele.displayNoneGrupo = "none";
          ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          if (ele.desSubcategoria.includes("GRUPOS") || ele.desSubcategoria.includes("CREW") ||
            ele.desSubcategoria.includes("SHOW DANCE")) {
            ele.displayNoneGrupo = "";
          }
        }
        // Ordenar lista por numParticipante
        this.listaParticipante.sort((firstItem, secondItem) => firstItem.numParticipante - secondItem.numParticipante);
      }
    );
  }

  cambiarEstado(participante: Participante) {
    switch (participante?.codEstadoCompetencia) {
      case 1: {
        participante.codEstadoCompetencia = 2;
        this.participante = participante;
        this.actualizarParticipanteEstadoCompetencia();
        break;
      }
      case 2: {
        participante.codEstadoCompetencia = 3;
        this.participante = participante;
        this.actualizarParticipanteEstadoCompetencia();
        break;
      }
      case 3: {
        let listaParticipante: Participante[];
        this.participanteService.listarParticipanteEnEscenario().subscribe(
          (respuesta) => {
            listaParticipante = respuesta['listado'];
            if (listaParticipante?.length > 0) {
              this.mensajeService.mensajeError('ERROR: Existe(n) participante(s) en escenario, que no tienen puntuación...');
            } else {
              participante.codEstadoCompetencia = 4;
              this.participante = participante;
              this.actualizarParticipanteEstadoCompetencia();
            }
          }
        )
        break;
      }
      case 4: {
        participante.codEstadoCompetencia = 5;
        this.participante = participante;
        this.actualizarParticipanteEstadoCompetencia();
        break;
      }
      case 5: {
        this.mensajeService.mensajeError('Su participación ha sido completada...');
        break;
      }
      default: {
        this.mensajeService.mensajeError('Defina un estado para el participante...');
        break;
      }
    }
  }

  actualizarParticipanteEstadoCompetencia() {
    this.participante.dateLastActive = dayjs(this.participante?.dateLastActive).format("YYYY-MM-DD HH:mm:ss.SSS")
    this.participanteService.guardarParticipante(this.participante).subscribe({
      next: (response) => {
        this.listarParticipantePorSubcategoriaInstancia();
        this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
      },
      error: (error) => {
        this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
      }
    });
  }

  listarParticipantePorSubcategoriaInstanciaAux() {
    this.displayNone1 = "";
    this.listaParticipante = [];
    this.buscarInstanciaPorCodigo();
    this.habilitarAgregarParticipante = false;
    this.participanteService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, 0).subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        if (this.listaParticipante.length < this.itemsRegistros) {
          this.page = 1;
        }
        for (const ele of this.listaParticipante) {
          // Tratar nombre de Pariicipante
          if (ele?.nombrePareja != "" && ele?.nombrePareja != null) {
            ele.nombrePersona = ele?.nombrePersona + " - " + ele?.nombrePareja;
          }
          ele.displayNoneGrupo = "none";
          ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          if (ele.desSubcategoria.includes("GRUPOS") || ele.desSubcategoria.includes("CREW") ||
            ele.desSubcategoria.includes("SHOW DANCE")) {
            ele.displayNoneGrupo = "";
          }
        }
        // Ordenar lista por numParticipante
        this.listaParticipante.sort((firstItem, secondItem) => firstItem.numParticipante - secondItem.numParticipante);
      }
    );
  }

  listarParticipantePorEmailAux() {
    this.displayNone1 = "";
    this.habilitarAgregarParticipante = false;
    // Trabajar con el correo del Participante migrado
    this.participanteService.listarParticipantePorEmail(this.currentUser.correo).subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        if (this.listaParticipante.length < this.itemsRegistros) {
          this.page = 1;
        }
        if (this.listaParticipante.length > 0) {
          for (const ele of this.listaParticipante) {
            // Tratar nombre de Pariicipante
            if (ele?.nombrePareja != "" && ele?.nombrePareja != null) {
              ele.nombrePersona = ele?.nombrePersona + " - " + ele?.nombrePareja;
            }
            ele.displayNoneGrupo = "none";
            this.customerId = ele.customerId;
            this.userId = ele.userId;
            if (ele?.username != "" && ele.desCategoria == "PRE INFANTIL") {
              ele.desCategoria = "DIRECTOR";
              ele.desSubcategoria = "ACADEMIA";
            }
            if (ele.desSubcategoria.includes("GRUPOS") || ele.desSubcategoria.includes("CREW") ||
              ele.desSubcategoria.includes("SHOW DANCE")) {
              ele.displayNoneGrupo = "";
            }
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          }
        }
      }
    );
  }

  listarParticipanteActivoActualizada(event) {
    this.listaParticipante = event;
    if (this.currentUser.cedula == "Suscriptor") {
      this.listarParticipantePorEmailAux();
    } else {
      this.codSubcategoria = this.listaParticipante['0']?.codSubcategoria;
      this.codInstancia = this.listaParticipante['0']?.codInstancia;
      this.listarParticipantePorSubcategoriaInstanciaAux();
    }
    //window.location.reload();
  }

  openDetail() {
    this.showDetail = true;
  }

  openEditarDetail(participante: Participante) {
    this.participanteSeleccionado = participante;
    this.showDetail = true;
  }

  openRemoverDetail(participante: Participante) {
    Swal
      .fire({
        title: "Eliminar Registro",
        text: "¿Quieres borrar el registro?'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })
      .then(resultado => {
        if (resultado.value) {
          // Hicieron click en "Sí, eliminar"
          //this.personaService.eliminarPersonaPorId(participante?.codPersona).subscribe({
          this.participanteService.eliminarParticipantePorId(participante?.codigo).subscribe({
            next: (response) => {
              if (this.currentUser?.cedula == "Suscriptor") {
                this.listarParticipantePorEmail();
              } else {
                this.listarParticipantePorSubcategoriaInstanciaAux();
              }
              this.mensajeService.mensajeCorrecto('El registro ha sido borrada con éxito...');
            },
            error: (error) => {
              this.mensajeService.mensajeError('Ha habido un problema al borrar el registro...');
            }
          });
        } else {
          // Hicieron click en "Cancelar"
          console.log("*Se cancela el proceso...*");
        }
      });
  }

  confirmarCargarParticipantes() {
    Swal
      .fire({
        title: "Cargar Participantes",
        text: "¿Quieres cargar los participantes?'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "Sí, cargar",
        cancelButtonText: "Cancelar",
      })
      .then(resultado => {
        if (resultado.value) {
          // Hicieron click en "Sí, cargar"
          this.participanteService.migrarUsuarioWP().subscribe({
            next: (response) => {
              this.mensajeService.mensajeCorrecto('Se ha cargado los participantes...');
            },
            error: (error) => {
              this.mensajeService.mensajeError('Ha habido un problema al cargar los participantes...');
            }
          });
        } else {
          // Hicieron click en "Cancelar"
          console.log("*Se cancela el proceso...*");
        }
      });
  }

  confirmarEnviarNotificaciones() {
    Swal
      .fire({
        title: "Enviar Notificaciones",
        text: "¿Quieres enviar las notificaciones?'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "Sí, enviar",
        cancelButtonText: "Cancelar",
      })
      .then(resultado => {
        if (resultado.value) {
          // Hicieron click en "Sí, cargar"
          this.enviarNotificacion = true;
          this.listarParticipantePorEstado();
        } else {
          // Hicieron click en "Cancelar"
          this.enviarNotificacion = false;
          console.log("*Se cancela el proceso...*");
        }
      });
  }

  closeDetail($event) {
    this.showDetail = $event;
    this.participanteSeleccionado = null;
  }

  // Contar los caracteres de la cedula para activar boton <Buscar>
  onKey(event) {
    if (event.target.value.length != 10) {
      this.resetTheForm();
    } else {
    }
  }

  resetTheForm(): void {
    this.listaPersona = null;
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

  // Tratar Archivos
  selectFiles(event) {
    this.progressInfo = [];
    event.target.files.length == 1 ? this.fileName = event.target.files[0].name : this.fileName = event.target.files.length + " archivos";
    this.selectedFiles = event.target.files;
  }

  cargarArchivos() {
    //this.play();
    this.message = '';
    for (let i = 0; i < this.selectedFiles.length; i++) {
      this.cargarArchivo(i, this.selectedFiles[i]);
      this.previsualizarArchivo(i, this.selectedFiles[i]);
      //this.descargarArchivo(this.selectedFiles[i].name);
      //this.obtenerReporteTitulo25();
    }
  }

  previsualizarArchivo(index, file) {
    //Previsualizar documento
    this.pdfFileURL = URL.createObjectURL(file);
    //window.open(this.pdfFileURL);
    //document.querySelector('#vistaPreviaDJ').setAttribute('src', pdfFileURL);
    document.getElementById('vistaPreviaDJ').setAttribute('src', this.pdfFileURL);
  }

  cargarArchivo(index, file) {
    this.participanteService.cargarArchivo(file, "").subscribe(
      async (respuesta) => {
        //console.log("respuesta = ", respuesta);
      }, err => {
        console.log("err = ", err);
        if (err == "OK") {
          this.habilitarAgregarParticipante = false;
          this.habilitarSeleccionarArchivo = true;
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

  compararCategoria(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }

  compararSubcategoria(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }

  compararInstancia(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }

  mostrarModalInfo() {
    this.modalService.open(this.myModalInfo);
  }

  verListaIntegrante = async (codParticipante: number) => {
    //this.listaIntegrante = [];
    await this.listarIntegrantePorParticipante(codParticipante);
    await this.verModalIntegrante();
  }

  listarIntegrantePorParticipante(codParticipante: number) {
    return new Promise((resolve, rejects) => {
      this.participanteService.listarIntegrantePorParticipante(codParticipante).subscribe({
        next: (respuesta) => {
          this.listaIntegrante = respuesta['listado'];
          resolve(respuesta);
        }, error: (error) => {
          rejects("Error");
          console.log("Error =", error);
        }
      })
    })
  }

  listarParticipantePDF() {
    //this.listaParticipante = [];
    this.crearPDF = true;
    if (this.currentUser?.cedula == "Suscriptor") {
      this.listarParticipantePorEmail();
    } else {
      this.listarParticipantePorEstado();
    }
  }

  listarParticipantePDFCancion() {
    //this.listaParticipante = [];
    this.crearPDFCancion = true;
    if (this.currentUser?.cedula == "Suscriptor") {
      this.listarParticipantePorEmail();
    } else {
      this.listarParticipantePorEstado();
    }
  }

  listarParticipanteUsuario() {
    this.listaParticipanteUsuario = [];
    this.participanteService.listarParticipanteUsuario().subscribe(
      (respuesta) => {
        this.listaParticipanteUsuario = respuesta['listado'];
        if (this.listaParticipanteUsuario.length > 0) {
          this.listaParticipantePDF = this.listaParticipanteUsuario;
          this.generarPDF();
          this.crearPDF = false;
        }
      }
    );
  }

  async verModalIntegrante() {
    this.modalService.open(this.modalIntegrante).result.then(r => {
      console.log("Tu respuesta ha sido: " + r);
    }, error => {
      console.log(error);
    });
  }

  enviarNotificacionBoton() {
    this.enviarNotificacion = true;
    this.listarParticipantePorEstado();
    this.enviarNotificacion = false;
  }

  listarParticipantePorEstadoBoton() {
    this.listarPorInstancia = false;
    this.crearPDF = false;
    this.crearPDFCancion = false;
    this.enviarNotificacion = false;
    this.disabledEstado = true;
    this.listarParticipantePorEstado();
  }

  listarParticipantePorEstado() {
    this.participanteService.listarParticipantePorEstado("A").subscribe(
      (respuesta) => {
        this.listaParticipantePDF = respuesta['listado'];
        if (this.listaParticipantePDF.length < this.itemsRegistros) {
          this.page = 1;
        }
        // Ordenar lista por numParticipante
        this.listaParticipantePDF.sort((firstItem, secondItem) => firstItem.numParticipante - secondItem.numParticipante);
        if (this.listaParticipantePDF.length > 0) {
          this.numeroEnvioNotificacion = 0;
          for (const ele of this.listaParticipantePDF) {
            // Tratar nombre de Pariicipante
            if (ele?.nombrePareja != "" && ele?.nombrePareja != null) {
              ele.nombrePersona = ele?.nombrePersona + " - " + ele?.nombrePareja;
            }
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
            if (ele?.username != "" && ele.desCategoria == "PRE INFANTIL") {
              ele.desCategoria = "DIRECTOR";
              ele.desSubcategoria = "ACADEMIA";
            }
            ele.displayNoneGrupo = "none";
            if (ele.desSubcategoria.includes("GRUPOS") || ele.desSubcategoria.includes("CREW") ||
              ele.desSubcategoria.includes("SHOW DANCE")) {
              ele.displayNoneGrupo = "";
            }
            if (this.enviarNotificacion && ele?.celular != "") {
              this.enviarWhatsappApi(ele);
            }
          }
          setTimeout(() => {
            if (this.enviarNotificacion) {
              if (this.respuestaEnvioNotificacion != "") {
                this.mensajeService.mensajeAdvertencia(this.respuestaEnvioNotificacion);
              }
              if (this.numeroEnvioNotificacion > 0) {
                this.mensajeService.mensajeCorrecto(this.numeroEnvioNotificacion + ' notificaciones se enviaron con éxito...');
              }
            }
          }, 20000);
          if (this.crearPDF) {
            this.generarPDF();
            this.crearPDF = false;
          } else {
            if (this.crearPDFCancion) {
              this.generarPDFCancion();
              this.crearPDFCancion = false;
            }
          }
        }
        if (!this.listarPorInstancia && !this.crearPDF && !this.crearPDFCancion) {
          this.displayNone1 = "none";
          this.listaParticipante = this.listaParticipantePDF;
        } else {
          this.displayNone1 = "";
        }
      }
    );
  }

  async enviarWhatsappApi(participante: Participante) {
    //let imageSrcString = this.toDataURL('./assets/images/trofeo/trofeo1.png/')
    //console.log("imageSrcString = ", imageSrcString)

    //let fechaFin = dayjs(transaccion.fechaFin).format("DD-MM-YYYY");
    let dia = moment(participante?.dateLastActive).format("D");
    let mes = moment(participante?.dateLastActive).format("MMMM");
    let año = moment(participante?.dateLastActive).format("YYYY");
    let horaMinuto = moment(participante?.dateLastActive).format("HH:mm");
    //transaccion.numDiasRenovar = transaccion?.numDiasRenovar == 0 ? 1 :transaccion?.numDiasRenovar; 
    //this.mensajeCaduca = "*Mensaje Automático* Estimado(a) " + transaccion.nombreCliente + " el servicio de " + transaccion.descripcion + " que tiene contratado con nosotros está por caducar el " + fechaFin + ", favor su ayuda confirmando si desea renovarlo, caso contrario el día de corte procederemos con la suspención del mismo... Un excelente dia, tarde o noche....";
    let mensajeEnviar = "*Notificación Automática*%0aEstimado(a) Participante "
      + participante?.nombrePersona
      + ", por comunicarle que su participación en la Competencia de NewDanceEC en la categoría "
      + participante?.desCategoria + "/" + participante?.desSubcategoria + " está programada para el día "
      + dia + " de " + mes + " de " + año + " a las " + horaMinuto + " Horas aproximadamente "
      + ", favor su ayuda asistiendo con mínimo una hora de antelación... Un excelente dia, tarde o noche...."
      + "%0a*NewDanceEc Congress / Quito-Ecuador*";

    // Codificar el mensaje para asegurar que los caracteres especiales se manejen correctamente
    const codec = new HttpUrlEncodingCodec();
    //const encodedValue = codec.encodeValue(mensajeNotificacion); // Encodes the value as 'Hello%20World%21'
    const decodedValue = codec.decodeValue(mensajeEnviar); // Decodes the value as 'Hello World!'

    // Validar prefijo telefonico
    if (participante?.prefijoTelefonico == "" || participante?.prefijoTelefonico == null) {
      participante.prefijoTelefonico = "593";
    }
    let celularEnvioWhatsapp = participante?.prefijoTelefonico + participante?.celular.substring(1, 15).trim();
    //let celularEnvioWhatsapp = participante?.prefijoTelefonico + "0992752367".substring(1, 15).trim();
    // Enviar mensaje
    this.transaccionService.enviarMensajeWhatsappND(celularEnvioWhatsapp, decodedValue).subscribe({
      next: async (response) => {
        this.numeroEnvioNotificacion += 1;
        //this.mensajeService.mensajeCorrecto('Las notificaciones se enviaron con éxito...');
      },
      error: (error) => {
        this.respuestaEnvioNotificacion = 'Ha habido un problema al enviar las notificaciones ' + error;
        //this.mensajeService.mensajeError('Ha habido un problema al enviar las notificaciones ' + error);
      }
    });
    // Enviar imagen
    /*
    this.transaccionService.enviarImagenWhatsappAI(this.celularEnvioWhatsapp, decodedValue, imageSrcString).subscribe({
      next: async (response) => {
        this.seEnvioWhatsapp = true;
        this.mensajeService.mensajeCorrecto('Las notificaciones se enviaron con éxito...');
      },
      error: (error) => {
        this.mensajeService.mensajeError('Ha habido un problema al enviar las notificaciones ' + error);
      }
    });
    */
  }

  generarPDF() {
    this.listaParticipantePDF = this.listaParticipantePDF.filter(item => item.codInstancia === 1);
    const bodyData = this.listaParticipantePDF.map((participante, index) => [index + 1, participante?.nombrePersona, participante?.desCategoria + "/" + participante?.desSubcategoria, participante?.dateLastActive, ' ... ' + participante?.numParticipante, participante?.postcode]);
    const pdfDefinition: any = {
      content: [
        { text: 'Reporte Participante', style: 'datoTituloGeneral' },
        {
          table: {
            body: [
              ['#', 'Nombre', 'Categoría/Subcategoría', 'fecha/hora Competencia', '# Orden', 'Chequeo'],
              ...bodyData
            ],
          },
          style: 'datosTabla'
        },
      ],
      styles: {
        datosTabla: {
          fontSize: 10,
          margin: [5, 5, 5, 5], // Margen inferior para separar la tabla de otros elementos
          fillColor: '#F2F2F2', // Color de fondo de la tabla
        },
        datoTitulo: {
          fontSize: 10
        },
        datoTituloGeneral: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10], // Puedes ajustar el margen según tus preferencias
        },
        datoSubtitulo: {
          fontSize: 10,
          bold: true,
          alignment: 'center', // Alineado a la izquierda
          margin: [0, 0, 0, 10], // Ajusta el margen según tus preferencias
        }
      },
    }
    const pdf = pdfMake.createPdf(pdfDefinition);
    pdf.open();
  }

  generarPDFCancion() {
    this.listaParticipantePDF = this.listaParticipantePDF.filter(item => item.codInstancia === 1);
    const bodyData = this.listaParticipantePDF.map((participante, index) => [index + 1, participante?.nombrePersona, participante?.desCategoria + "/" + participante?.desSubcategoria, participante?.nombreCancion == null ? '' : participante?.nombreCancion.substring(16, 50), participante?.numParticipante, participante?.postcode]);
    const pdfDefinition: any = {
      content: [
        { text: 'Reporte Participante-Canción', style: 'datoTituloGeneral' },
        {
          table: {
            body: [
              ['#', 'Nombre', 'Categoría/Subcategoría', 'Canción', '# Orden', 'CheckList'],
              ...bodyData
            ],
          },
          style: 'datosTabla'
        },
      ],
      styles: {
        datosTabla: {
          fontSize: 10,
          margin: [5, 5, 5, 5], // Margen inferior para separar la tabla de otros elementos
          fillColor: '#F2F2F2', // Color de fondo de la tabla
        },
        datoTitulo: {
          fontSize: 10
        },
        datoTituloGeneral: {
          fontSize: 16,
          fbold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10], // Puedes ajustar el margen según tus preferencias
        },
        datoSubtitulo: {
          fontSize: 10,
          bold: true,
          alignment: 'center', // Alineado a la izquierda
          margin: [0, 0, 0, 10], // Ajusta el margen según tus preferencias
        }
      },
    }
    const pdf = pdfMake.createPdf(pdfDefinition);
    pdf.open();
  }

  /* Variables del html, para receptar datos y validaciones*/
  get codCategoriaField() {
    return this.formParticipanteParametro.get('codCategoria');
  }
  get codSubcategoriaField() {
    return this.formParticipanteParametro.get('codSubcategoria');
  }
  get codInstanciaField() {
    return this.formParticipanteParametro.get('codInstancia');
  }

}
