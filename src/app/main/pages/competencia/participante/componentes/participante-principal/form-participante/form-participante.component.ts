import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MensajesIziToastService } from 'app/main/pages/compartidos/servicios/iziToast/mensajesIziToast.service';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { DetailComponent } from 'app/main/pages/competencia/participante/componentes/detail/detail.component';
import dayjs from "dayjs";
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { ParticipanteService } from '../../../servicios/participante.service';
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { EstadoCompetencia } from 'app/main/pages/compartidos/modelos/EstadoCompetencia';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { Subcategoria } from 'app/main/pages/compartidos/modelos/Subcategoria';
import { Instancia } from 'app/main/pages/compartidos/modelos/Instancia';
import { CargarArchivoModelo } from 'app/main/pages/compartidos/modelos/CargarArchivoModelo';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Integrante } from 'app/main/pages/compartidos/modelos/Integrante';
import { saveAs } from 'file-saver';
import { ClienteService } from 'app/main/pages/venta/cliente/servicios/cliente.service';
import { PrefijoTelefonico } from 'app/main/pages/compartidos/modelos/PrefijoTelefonico';

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
  @ViewChild("modalIntegrante", { static: false }) modalIntegrante: TemplateRef<any>;

  /*VARIABLES */
  public showDetail: boolean;
  private amieRegex: string;
  private currentUser: any;
  public displayParticipante: string = '';
  public displayInstancia: string = '';
  public displayIntegrante2: string = '';
  public displayIntegranteGrupo: string = '';
  public displayCategoria: string = '';
  public codCategoria: number;
  public codSubcategoria: number;
  public codInstancia: number;
  public desSubcategoria: string;
  public desCategoria: string;
  public nombreCancion: string;
  public nombreIntegrante: string;
  public pathCancion: string = "./assets/musica/";
  public nombreArchivoDescarga: string;
  public fechaNacimiento: string = "";
  public edadMinima: number;
  public edadMaxima: number;
  public existeIdentificacion: boolean;
  public disabledIdentificacion: boolean;
  public disabledApellidos: boolean;
  public codParticipante: number = 0;
  public siActualizaIntegrante: boolean;
  public codPersona: number = 0;

  /*FORMULARIOS*/
  public formParticipante: FormGroup;

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

  /*OBJETOS*/
  public participante: Participante;
  public participanteAux: Participante;
  public personaEditar: Persona;
  public persona: Persona;
  public subcategoria: Subcategoria;
  public listaEstadoCompetencia: EstadoCompetencia[];
  public listaRespuesta = [
    { valor: "SI" },
    { valor: "NO" },
  ];
  public listaCategoria: Categoria[] = [];
  public listaSubcategoria: Subcategoria[] = [];
  public listaInstancia: Instancia[] = [];
  public listaIntegrante: Integrante[] = [];
  public listaIntegranteAux: Integrante[] = [];
  public integrante: Integrante;
  public listaPersona: Persona[] = [];
  public listaPrefijoTelefonico: PrefijoTelefonico[];

  /*CONSTRUCTOR*/
  constructor(
    private participanteService: ParticipanteService,
    private personaService: PersonaService,
    private clienteService: ClienteService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private mensajeIzi: MensajesIziToastService,
    private modalService: NgbModal
  ) {
    this.load_btn = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.close = new EventEmitter<boolean>();
    this.listaParticipante = new EventEmitter<any>();
    this.showDetail = true;
  }

  ngOnInit() {
    this.listarEstadoCompetenciaActivo();
    this.listarSubcategoriaActivo();
    if (this.participanteEditar) {
      if (this.participanteEditar?.prefijoTelefonico == null || this.participanteEditar?.prefijoTelefonico == "") {
        this.participanteEditar.prefijoTelefonico = '593';
      }
      this.codParticipante = this.participanteEditar?.codigo;
      this.disabledIdentificacion = true;
      this.desSubcategoria = this.participanteEditar?.desSubcategoria;
      if (this.participanteEditar?.fechaNacimiento != "" && this.participanteEditar?.fechaNacimiento != null) {
        this.fechaNacimiento = dayjs(this.participanteEditar?.fechaNacimiento).format("YYYY-MM-DD");
      }
      this.nombreCancion = this.participanteEditar?.nombreCancion;
      this.codSubcategoriaChild = this.participanteEditar?.codSubcategoria;
      this.desCategoria = this.participanteEditar?.desCategoria;
      this.codInstanciaChild = this.participanteEditar?.codInstancia;
      this.formParticipante = this.formBuilder.group({
        identificacion: new FormControl(this.participanteEditar?.identificacion, Validators.required),
        nombres: new FormControl(this.participanteEditar?.nombres, Validators.required),
        nombrePareja: new FormControl(this.participanteEditar?.nombrePareja),
        fechaNacimiento: new FormControl(this.fechaNacimiento),
        codigo: new FormControl(this.participanteEditar?.prefijoTelefonico),
        celular: new FormControl(this.participanteEditar?.celular),
        correo: new FormControl(this.participanteEditar?.correo),
        dateLastActive: new FormControl(dayjs(this.participanteEditar?.dateLastActive).format("YYYY-MM-DD HH:mm")),
        username: new FormControl(this.participanteEditar?.username),
        codEstadoCompetencia: new FormControl(this.participanteEditar?.codEstadoCompetencia),
        numPuntajeJuez: new FormControl(this.participanteEditar?.numPuntajeJuez),
        numParticipante: new FormControl(this.participanteEditar?.numParticipante),
        codCategoria: new FormControl(this.participanteEditar?.codCategoria),
        codSubcategoria: new FormControl(this.participanteEditar?.codSubcategoria),
        codInstancia: new FormControl(this.participanteEditar?.codInstancia),
        nombreEscuela: new FormControl(this.participanteEditar?.nombreEscuela),
      })
      //AQUI TERMINA ACTUALIZAR
    } else {
      this.codSubcategoriaChild = 0;
      this.formParticipante = this.formBuilder.group({
        identificacion: new FormControl('', Validators.required),
        nombres: new FormControl('', Validators.required),
        nombrePareja: new FormControl(''),
        fechaNacimiento: new FormControl(''),
        codigo: new FormControl('593', Validators.required),
        celular: new FormControl(''),
        correo: new FormControl(this.currentUser?.correo),
        dateLastActive: new FormControl(dayjs(new Date()).format("YYYY-MM-DD HH:mm")),
        username: new FormControl(''),
        codEstadoCompetencia: new FormControl(1),
        numPuntajeJuez: new FormControl(''),
        numParticipante: new FormControl(''),
        codCategoria: new FormControl(''),
        codSubcategoria: new FormControl(''),
        codInstancia: new FormControl(''),
        nombreEscuela: new FormControl(''),
      })
    }
    this.codSubcategoria = this.codSubcategoriaChild;
    if (this.codSubcategoria != 0) {
      this.buscarSubcategoriaPorCodigo();
    }
    this.displayInstancia = 'none';
    this.displayIntegranteGrupo = 'none';
    this.disabledApellidos = false;
    this.displayIntegrante2 = 'none';
    if (this.currentUser.cedula == "Suscriptor") {
      this.displayParticipante = 'none';
      this.displayCategoria = '';
      this.listarCategoriaActivo();
      this.listarInstanciaActivo();
    } else {
      this.displayCategoria = 'none';
    }
    this.listarPrefijoTelefonico();
  }

  async listarPrefijoTelefonico() {
    this.clienteService.listarPrefijoTelefonico().subscribe(
      (respuesta) => {
        this.listaPrefijoTelefonico = respuesta['listado'];
      }
    );
  }

  adicionarIntegrante() {
    // Receptar la codSubcategoria y codInstancia de formParticipante.value
    let participanteTemp = this.formParticipante.value;
    this.nombreIntegrante = participanteTemp?.nombrePareja;
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
      this.formParticipante.controls.nombrePareja.setValue("");
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
    this.listaSubcategoria = [];
    let listaSubcategoriaAux: Subcategoria[] = [];
    this.participanteService.listarSubcategoriaActivo().subscribe(
      (respuesta) => {
        listaSubcategoriaAux = respuesta['listado'];
        let codCategoria = 0;
        if (this.participanteEditar) {
          codCategoria = this.participanteEditar?.codCategoria;
        }
        for (let ele of listaSubcategoriaAux) {
          if (ele?.codCategoria == codCategoria) {
            this.listaSubcategoria.push(ele);
          }
          
        }
      }
    )
  }

  listarSubcategoriaPorCategoriaEditar(codCategoria: number) {
    this.participanteService.listarSubcategoriaPorCategoria(codCategoria).subscribe(
      (respuesta) => {
        this.listaSubcategoria = respuesta['listado'];
      }
    )
  }

  listarSubcategoriaPorCategoria() {
    this.displayIntegrante2 = "none";
    this.displayIntegranteGrupo = "none";
    this.disabledApellidos = false;
    // Receptar la descripción de formParticipante.value
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
    this.displayIntegrante2 = "none";
    this.displayIntegranteGrupo = "none";
    this.disabledApellidos = false;
    // Receptar la codSubcategoria y codInstancia de formParticipante.value
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
        this.subcategoria = respuesta['objeto'];
        this.edadMinima = this.subcategoria?.edadMinima;
        this.edadMaxima = this.subcategoria?.edadMaxima;
        this.desCategoria = this.subcategoria?.desCategoria;
        this.desSubcategoria = this.subcategoria?.denominacion;
        this.codCategoria = this.subcategoria.codCategoria;
        if (this.desSubcategoria.includes("PAREJA") || this.desSubcategoria.includes("DUO")) {
          this.disabledApellidos = false;
          this.displayIntegrante2 = "";
        }
        if (this.desSubcategoria.includes("GRUPO") || this.desSubcategoria.includes("CREW") ||
          this.desSubcategoria.includes("SHOW DANCE")) {
          this.displayIntegrante2 = "";
          this.displayIntegranteGrupo = "";
          this.disabledApellidos = true;
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
      await this.listarParticipantePorEmail();
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
          // Ordenar lista por numParticipante
          this.listaParticipanteChild.sort((firstItem, secondItem) => firstItem.numParticipante - secondItem.numParticipante);
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
            ele.displayNoneGrupo = "none";
            if (ele?.username != "" && ele.desCategoria == "PRE INFANTIL") {
              ele.desCategoria = "DIRECTOR";
              ele.desSubcategoria = "ACADEMIA";
            }
            if (this.desSubcategoria.includes("GRUPOS") || this.desSubcategoria.includes("CREW") ||
              this.desSubcategoria.includes("SHOW DANCE")) {
              ele.displayNoneGrupo = "";
            }
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          }
        }
        this.listaParticipante.emit(this.listaParticipanteChild);
      }
    );
  }

  async buscarPersonaPorCodigo(codPersona: number) {
    this.personaService.buscarPersonaPorCodigo(codPersona).subscribe({
      next: (response) => {
        this.personaEditar = response['objeto'];
        if (this.personaEditar?.fechaNacimiento != "" && this.personaEditar?.fechaNacimiento != null) {
          this.fechaNacimiento = dayjs(this.personaEditar?.fechaNacimiento).format("YYYY-MM-DD");
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  async listarPersonaPorIdentificacion(identificacion: string) {
    this.existeIdentificacion = false;
    this.personaService.listarPersonaPorIdentificacion(identificacion).subscribe(
      (respuesta) => {
        this.listaPersona = respuesta['listado'];
        if (this.listaPersona?.length > 0) {
          this.existeIdentificacion = true;
          this.persona = this.listaPersona['0'];
          this.codPersona = this.persona?.codigo;
          this.formParticipante.controls.fechaNacimiento.setValue(dayjs(this.persona?.fechaNacimiento).format("YYYY-MM-DD"));
          this.formParticipante.controls.nombres.setValue(this.persona?.nombres);
          if (this.currentUser?.cedula == "Suscriptor") {
            this.formParticipante.controls.correo.setValue(this.currentUser?.correo);
          } else {
            this.formParticipante.controls.correo.setValue(this.persona?.correo);
          }
          this.formParticipante.controls.celular.setValue(this.persona?.celular);
          if (!this.disabledIdentificacion) {
            this.mensajeService.mensajeAdvertencia('El Usuario ' + identificacion + ' ya existe, modifique su nombre o continue con el mismo...');
          }
        } else {
          this.formParticipante.controls.fechaNacimiento.setValue(dayjs(new Date()).format("YYYY-MM-DD"));
          this.formParticipante.controls.celular.setValue('');
        }
      }
    );
  }

  patternAmie(amie: string) {
    const valorEncontrar = amie
    const regExp = new RegExp('([0-9])\\w+')
    const amieFiltrado = valorEncontrar.match(regExp)
    return amieFiltrado['0']
  }

  addRegistroPersona() {
    if (this.formParticipante?.valid) {
      let edad = 0;
      let participanteTemp = this.formParticipante.value;
      if (participanteTemp?.fechaNacimiento != "" && participanteTemp?.fechaNacimiento != null) {
        participanteTemp.fechaNacimiento = dayjs(participanteTemp?.fechaNacimiento).format("YYYY-MM-DD HH:mm:ss.SSS");
        this.fechaNacimiento = participanteTemp?.fechaNacimiento;
        edad = this.calcularEdad();
        if (this.desCategoria.includes("PRE INFANTIL") && (edad < this.edadMinima || edad > this.edadMaxima)) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 4 años y menor a 9 años...');
          return;
        }
        if (this.desCategoria.includes("INFANTIL") && (edad < this.edadMinima || edad > this.edadMaxima)) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 7 años y menor a 13 años...');
          return;
        }
        if (this.desCategoria.includes("JUNIOR") && (edad < this.edadMinima || edad > this.edadMaxima)) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 13 años y menor a 18 años...');
          return;
        }
        if ((this.desCategoria.includes("ESTUDIANTES") ||
          this.desCategoria.includes("PRO-AM")) && edad < this.edadMinima) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 4 años...');
          return;
        }
        if (this.desCategoria.includes("AMATEUR") && edad < this.edadMinima) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 13 años...');
          return;
        }
        if (this.desCategoria.includes("OPEN") && edad < this.edadMinima) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 14 años...');
          return;
        }
      } else {
        if (this.desCategoria.includes("PRE INFANTIL")) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 4 años y menor a 9 años...');
          return;
        }
        if (this.desCategoria.includes("INFANTIL")) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 7 años y menor a 13 años...');
          return;
        }
        if (this.desCategoria.includes("JUNIOR")) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 13 años y menor a 18 años...');
          return;
        }
        if (this.desCategoria.includes("ESTUDIANTES") ||
          this.desCategoria.includes("PRO-AM")) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 4 años...');
          return;
        }
        if (this.desCategoria.includes("AMATEUR")) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 13 años...');
          return;
        }
        if (this.desCategoria.includes("OPEN")) {
          this.mensajeService.mensajeError('La Edad del participante debe ser: mayor a 14 años...');
          return;
        }
      }
      this.persona = new Persona({
        codigo: 0,
        identificacion: participanteTemp?.identificacion,
        nombres: participanteTemp?.nombres,
        fechaNacimiento: participanteTemp?.fechaNacimiento,
        celular: participanteTemp?.celular,
        prefijoTelefonico: participanteTemp?.codigo,
        correo: participanteTemp?.correo,
        cedula: 'Suscriptor',
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
      this.persona['data'].codigo = this.codPersona;
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
      if (this.displayIntegrante2 == "none") {
        this.formParticipante.controls.nombrePareja.setValue(null);
      }
      let participanteTemp = this.formParticipante.value;
      this.participanteAux = new Participante({
        codigo: 0,
        nombrePareja: participanteTemp?.nombrePareja,
        username: participanteTemp.username,
        customerId: this.customerIdChild,
        userId: this.userIdChild,
        email: participanteTemp?.correo,
        codSubcategoria: this.codSubcategoriaChild,
        codInstancia: this.codInstanciaChild,
        country: participanteTemp?.country,
        dateLastActive: dayjs(participanteTemp.dateLastActive).format("YYYY-MM-DD HH:mm:ss.SSS"),
        codEstadoCompetencia: participanteTemp?.codEstadoCompetencia,
        nombreCancion: this.nombreCancion,
        nombreEscuela: participanteTemp?.nombreEscuela,
        numParticipante: participanteTemp?.numParticipante,
        estado: 'A',
      });
    }
    if (this.participanteEditar) {
      this.participante = this.participanteEditar;
      this.participante.nombrePareja = this.participanteAux['data'].nombrePareja;
      this.participante.username = this.participanteAux['data'].username;
      this.participante.email = this.participanteAux['data'].email;
      this.participante.codSubcategoria = this.codSubcategoriaChild;
      this.participante.codInstancia = this.codInstanciaChild;
      this.participante.country = this.participanteAux['data'].country;
      this.participante.dateLastActive = this.participanteAux['data'].dateLastActive;
      this.participante.codEstadoCompetencia = this.participanteAux['data'].codEstadoCompetencia;
      this.participante.nombreCancion = this.participanteAux['data'].nombreCancion;
      this.participante.nombreEscuela = this.participanteAux['data'].nombreEscuela;
      this.participante.numParticipante = this.participanteAux['data'].numParticipante;
      this.participante.estado = this.participanteAux['data'].estado;
      this.participanteService.guardarParticipante(this.participante).subscribe({
        next: (response) => {
          this.participante = response['objeto'];
          if (this.listaIntegrante.length > 0 && this.siActualizaIntegrante) {
            for (let ele of this.listaIntegrante) {
              ele.codParticipante = this.participante?.codigo;
            }
            this.participanteService.guardarListaIntegrante(this.listaIntegrante).subscribe({
              next: async (response) => {
                this.listarParticipantePorSubcategoriaInstancia();
                this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
                this.parentDetail.closeDetail();
              },
              error: (error) => {
                this.listarParticipantePorSubcategoriaInstancia();
                this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
                this.parentDetail.closeDetail();
              }
            });
          } else {
            this.listarParticipantePorSubcategoriaInstancia();
            this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
            this.parentDetail.closeDetail();
          }
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
          if (this.listaIntegrante.length > 0 && this.siActualizaIntegrante) {
            for (const ele of this.listaIntegrante) {
              ele.codParticipante = this.participante.codigo;
            }
            this.participanteService.guardarListaIntegrante(this.listaIntegrante).subscribe({
              next: async (response) => {
                this.listarParticipantePorSubcategoriaInstancia();
                this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
                this.parentDetail.closeDetail();
              },
              error: (error) => {
                this.listarParticipantePorSubcategoriaInstancia();
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

  calcularEdad(): number {
    const today: Date = new Date('04-07-2024');
    const birthDate: Date = new Date(this.fechaNacimiento);
    let edad: number = today.getFullYear() - birthDate.getFullYear();
    let month: number = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      edad--;
    }
    if (month > 0) {
      month = month / 12;
      edad = edad + month;
    }
    return edad;
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

  // Tomar el valor nombres y convertirlo en identificacion
  blurIdentificacion(event) {
    if (!this.disabledIdentificacion) {
      if (event.target.value.length != 0) {
        let participanteTemp = this.formParticipante.value;
        if (participanteTemp?.username == "") {
          this.formParticipante.controls.identificacion.setValue((event.target.value.replaceAll(" ", ".")).toLowerCase());
          // Verificar si ya existe la persona con esa identificacion
          this.listarPersonaPorIdentificacion(event.target.value.replaceAll(" ", "."));
        }
      }
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

  compararPrefijoTelefonico(o1, o2) {
    return o1 === undefined || o2 === undefined || o2 === null ? false : o1.codigo === o2.codigo;
  }

  buscarPrefijoTelefonico() {
    // Receptar el codigo de formParticipante.value
    let formParticipanteTemp = this.formParticipante.value;
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
    let noCargaArchivo: boolean = false;
    // Receptar identificacion de formParticipante.value
    let participanteTemp = this.formParticipante.value;
    this.nombreCancion = this.pathCancion + this.desCategoria + "_" + this.desSubcategoria + "_" + participanteTemp?.nombres + "_" + file?.name;
    let nombreArchivo = this.desCategoria + "_" + this.desSubcategoria + "_" + participanteTemp?.nombres + "_" + file?.name;
    this.participanteService.cargarArchivo(file, nombreArchivo).subscribe(
      async (respuesta) => {
        console.log("respuesta = ", respuesta);
        if (respuesta['status'] == 417) {
          noCargaArchivo = true;
        }
      }, err => {
        console.log("err = ", err);
        if (err == "OK" && !noCargaArchivo) {
          this.mensajeService.mensajeCorrecto('Se cargo el archivo a la carpeta = ' + file.name);
        } else {
          this.mensajeService.mensajeError('No se puede cargar el archivo = ' + file.name + '. Revise tipo archivo (audio/mp3/mp4), peso máximo 3.000 KB, nombres máximo 60 carácteres.');
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

  // Métod temporal para vizualizar un pdf a partir de un código en base64
  async verpdf() {
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
          console.log("httpEvent.url = ", httpEvent.url)
          console.log("httpEvent.body = ", httpEvent.body)
          saveAs(new Blob([httpEvent.body!],
            { type: `${httpEvent.headers.get('Content-Type')};charset=utf-8` }),
            "solista_salsa.mp3");
        }
        this.fileStatus.status = 'done';
        break;
      default:
        //console.log(httpEvent);
        break;

    }
  }

  //fileStatus = { status: '', requestType: '', percent: 0 };
  private updateStatus(loaded: number, total: number, requestType: string): void {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round(100 * loaded / total);

  }

  procesarListaIntegrante = async () => {
    this.listaIntegrante = [];
    await this.listarIntegrantePorParticipante(this.codParticipante);
    await this.verModalIntegrante();
  }

  listarIntegrantePorParticipante(codParticipante: number) {
    return new Promise((resolve, rejects) => {
      this.participanteService.listarIntegrantePorParticipante(codParticipante).subscribe({
        next: (respuesta) => {
          this.listaIntegrante = respuesta['listado'];
          let index = 0;
          if (this.listaIntegrante.length > 0) {
            index = this.listaIntegrante.length;
          }
          for (index; index < 20; index++) {
            this.integrante = new Integrante();
            this.integrante = {
              codigo: 0,
              nombre: "",
              codParticipante: 0,
              estado: "A",
            }
            this.listaIntegrante.push(this.integrante);
          }
          resolve(respuesta);
        }, error: (error) => {
          rejects("Error");
          console.log("Error =", error);
        }
      })
    })
  }

  async verModalIntegrante() {
    this.siActualizaIntegrante = false;
    this.listaIntegranteAux = [];
    this.modalService.open(this.modalIntegrante).result.then(proceso => {
      console.log("Tu respuesta ha sido: " + proceso);
      if (proceso == "Si") {
        this.siActualizaIntegrante = true;
        for (let integranteAux of this.listaIntegrante) {
          if (integranteAux?.nombre != "") {
            this.integrante = new Integrante();
            this.integrante = {
              codigo: integranteAux?.codigo,
              nombre: integranteAux?.nombre,
              codParticipante: integranteAux?.codParticipante,
              estado: integranteAux?.estado,
            }
            this.listaIntegranteAux.push(this.integrante);
          }
        }
        this.listaIntegrante = this.listaIntegranteAux;
      }
    }, error => {
      console.log(error);
    });
  }

  get identificacionField() {
    return this.formParticipante.get('identificacion');
  }
  get nombresField() {
    return this.formParticipante.get('nombres');
  }
  get nombreParejaField() {
    return this.formParticipante.get('nombrePareja');
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
  get numParticipanteField() {
    return this.formParticipante.get('numParticipante');
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
  get nombreEscuelaField() {
    return this.formParticipante.get('nombreEscuela');
  }
  get codigoField() {
    return this.formParticipante.get('codigo');
  }

}
