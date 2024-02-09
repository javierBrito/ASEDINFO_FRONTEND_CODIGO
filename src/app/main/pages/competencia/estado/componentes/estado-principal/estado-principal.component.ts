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
import { Instancia } from 'app/main/pages/compartidos/modelos/Instancia';
import { Subcategoria } from 'app/main/pages/compartidos/modelos/Subcategoria';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { EstadoCompetencia } from 'app/main/pages/compartidos/modelos/EstadoCompetencia';
import { userInfo } from 'os';
import { CargarArchivoModelo } from 'app/main/pages/compartidos/modelos/CargarArchivoModelo';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { AudioService } from 'app/main/pages/compartidos/servicios/audio.service';
import { DataService } from 'app/main/pages/compartidos/servicios/data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Integrante } from 'app/main/pages/compartidos/modelos/Integrante';
import { ParticipanteService } from '../../../participante/servicios/participante.service';
import { AuthenticationService } from 'app/auth/service';

@Component({
  selector: 'app-estado-principal',
  templateUrl: './estado-principal.component.html',
  styleUrls: ['./estado-principal.component.scss']
})
export class EstadoPrincipalComponent implements OnInit {
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
  public identificacion: string;
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
  public urlCancion: string;

  /*LISTAS*/
  public listaParticipante: Participante[] = [];
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
  public nombreArchivoDescarga: string;

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
  public formEstado: FormGroup;

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
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private autenticacion: AuthenticationService,
  ) {
    // Inicio - Para acceder directamente a la página de estado
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log("this.currentUser = ", this.currentUser);
    if (this.currentUser == null) {
      this.iniciarSesion();
    };
    console.log("this.currentUser = ", this.currentUser)
    // Fin - Para acceder directamente a la página de inscripción  }
    //this.urlCancion = "./assets/musica/bachata_prueba.mpeg";
    //this.urlCancion = "./assets/musica/solista_salsa.mp3";
    this.urlCancion = "./assets/musica/";
    //this.urlCancion = ".../upload/musica/";
    //this.urlCancion = "D:/upload/";
    //this.descargarArchivo("comprobante.pdf");
    this.codigo = 0;
    this.codigoSede = 0;
    this.itemsRegistros = 5;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.sede = this.currentUser.sede;
    this.habilitarAgregarParticipante = true;
    this.habilitarSeleccionarArchivo = false;
  }

  ngOnInit() {
    this.formEstado = this.formBuilder.group({
      codCategoria: new FormControl('', Validators.required),
      codSubcategoria: new FormControl('', Validators.required),
      codInstancia: new FormControl('', Validators.required),
      identificacion: new FormControl(''),
    })
    this.listarCategoriaActivo();
    this.listarEstadoCompetenciaActivo();
    if (this.currentUser.cedula == "Suscriptor") {
      this.disabledEstado = true;
      this.displayNone = 'none';
      this.listarParticipantePorEmail();
    } else {
      this.disabledEstado = false;
      this.displayNone1 = 'none';
    }
    //this.listarIntegranteActivo();
  }

  // Inicio - Para acceder directamente a la página de inscripción
  // Crear usuario para acceso directo a la página de inscripción
  iniciarSesion() {
    this.autenticacion.login('1707025746', '1512').subscribe(
      (respuesta) => {
        console.log("respuesta = " + respuesta);
      }
    );
  }
  // Fin - Para acceder directamente a la página de inscripción

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
    this.participanteService.listarCategoriaActivo().subscribe(
      (respuesta) => {
        this.listaCategoria = respuesta['listado'];
      }
    )
  }

  listarSubcategoriaPorCategoria() {
    this.habilitarAgregarParticipante = true;
    this.listaParticipante = [];
    // Receptar la descripción de formEstado.value
    let estadoCompetenciaParametroTemp = this.formEstado.value;
    this.codCategoria = estadoCompetenciaParametroTemp?.codCategoria;
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
    this.habilitarAgregarParticipante = true;
    this.listaParticipante = [];
    // Receptar codCategoria de formEstado.value
    let estadoCompetenciaParametroTemp = this.formEstado.value;
    this.codSubcategoria = estadoCompetenciaParametroTemp?.codSubcategoria;
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

  listarParticipanteGeneral() {
    if (this.currentUser.cedula == "Suscriptor") {
      this.listarParticipantePorEmail();
    } else {
      this.listarParticipantePorSubcategoriaInstancia();
    }
  }

  listarParticipantePorEmail() {
    // Receptar la codSubcategoria y codInstancia de formEstado.value
    let estadoCompetenciaParametroTemp = this.formEstado.value;
    this.codSubcategoria = estadoCompetenciaParametroTemp?.codSubcategoria;
    this.codInstancia = estadoCompetenciaParametroTemp?.codInstancia;
    //this.habilitarAgregarParticipante = true;
    this.habilitarAgregarParticipante = false;
    this.participanteService.listarParticipantePorEmail(this.currentUser.identificacion).subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        if (this.listaParticipante.length < this.itemsRegistros) {
          this.page = 1;
        }
        if (this.listaParticipante.length > 0) {
          //this.habilitarAgregarParticipante = false;
          for (const ele of this.listaParticipante) {
            ele.nombreCancion = this.urlCancion + ele?.nombreCancion;
            ele.displayNoneGrupo = "none";
            this.customerId = ele.customerId;
            this.userId = ele.userId;
            if (ele?.identificacion == this.currentUser.identificacion) {
              ele.desCategoria = "DIRECTOR";
              ele.desSubcategoria = "ACADEMIA";
            }
            if (ele?.desSubcategoria.includes("GRUPOS")) {
              ele.displayNoneGrupo = "";
            }
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          }
        }
      }
    );
  }

  listarParticipantePorSubcategoriaInstancia() {
    // Receptar la descripción de formEstado.value
    let estadoCompetenciaParametroTemp = this.formEstado.value;
    this.codSubcategoria = estadoCompetenciaParametroTemp?.codSubcategoria;
    this.codInstancia = estadoCompetenciaParametroTemp?.codInstancia;
    this.buscarInstanciaPorCodigo();
    //this.habilitarAgregarParticipante = false;
    this.participanteService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, 0).subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        for (const ele of this.listaParticipante) {
          ele.nombreCancion = this.urlCancion + ele?.nombreCancion;
          ele.displayNoneGrupo = "none";
          ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          if (ele.desSubcategoria.includes("GRUPOS")) {
            ele.displayNoneGrupo = "";
          }
        }
      }
    );
  }

  cambiarEstado(participante: Participante) {
    switch (participante?.codEstadoCompetencia) {
      case 1: {
        participante.codEstadoCompetencia = 2;
        this.participante = participante;
        this.addRegistroParticipante();
        break;
      }
      case 2: {
        participante.codEstadoCompetencia = 3;
        this.participante = participante;
        this.addRegistroParticipante();
        break;
      }
      case 3: {
        participante.codEstadoCompetencia = 4;
        this.participante = participante;
        this.addRegistroParticipante();
        break;
      }
      case 4: {
        participante.codEstadoCompetencia = 5;
        this.participante = participante;
        this.addRegistroParticipante();
        break;
      }
      case 5: {
        //participante.codEstadoCompetencia = 4;
        this.mensajeService.mensajeError('Su participación ha sido completada...');
        break;
      }
      default: {
        //participante.codEstadoCompetencia = 1;
        this.mensajeService.mensajeError('Defina un estado para el participante...');
        break;
      }
    }
  }

  addRegistroParticipante() {
    this.participante.dateLastActive = dayjs(this.participante?.dateLastActive).format("YYYY-MM-DD HH:mm:ss.SSS")
    this.participanteService.guardarParticipante(this.participante).subscribe({
      next: (response) => {
        this.listarParticipantePorSubcategoriaInstancia();
        this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
      },
      error: (error) => {
        this.listarParticipantePorSubcategoriaInstancia();
        this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
      }
    });
  }

  listarParticipanteActivoActualizada(event) {
    this.listaParticipante = event;
  }

  openDetail(codjornada) {
    this.showDetail = true;
  }

  openEditarDetail(participante: Participante) {
    this.participanteSeleccionado = participante;
    this.showDetail = true;
  }

  openRemoverDetail(persona: Persona) {
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
          this.participanteService.eliminarParticipantePorId(persona.codigo).subscribe({
            next: (response) => {
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
          // Hicieron click en "Sí, eliminar"
          this.participanteService.migrarClienteWP().subscribe({
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
        console.log("respuesta = ", respuesta);
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

  async verModalIntegrante() {
    this.modalService.open(this.modalIntegrante).result.then(r => {
      console.log("Tu respuesta ha sido: " + r);
    }, error => {
      console.log(error);
    });
  }

  /* Variables del html, para receptar datos y validaciones*/
  get identificacionField() {
    return this.formEstado.get('identificacion');
  }
  get codCategoriaField() {
    return this.formEstado.get('codCategoria');
  }
  get codSubcategoriaField() {
    return this.formEstado.get('codSubcategoria');
  }
  get codInstanciaField() {
    return this.formEstado.get('codInstancia');
  }

}