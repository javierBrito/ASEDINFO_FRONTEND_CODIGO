import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { Participante } from 'app/main/pages/compartidos/modelos/Participante';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import dayjs from "dayjs";
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { Instancia } from 'app/main/pages/compartidos/modelos/Instancia';
import { Subcategoria } from 'app/main/pages/compartidos/modelos/Subcategoria';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { EstadoCompetencia } from 'app/main/pages/compartidos/modelos/EstadoCompetencia';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Integrante } from 'app/main/pages/compartidos/modelos/Integrante';
import { ParticipanteService } from '../../../participante/servicios/participante.service';
import { AuthenticationService } from 'app/auth/service';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpUrlEncodingCodec } from '@angular/common/http';
import { TransaccionService } from 'app/main/pages/venta/transaccion/servicios/transaccion.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-sorteo-principal',
  templateUrl: './sorteo-principal.component.html',
  styleUrls: ['./sorteo-principal.component.scss']
})
export class SorteoPrincipalComponent implements OnInit {
  /*INPUT RECIBEN*/

  /*MODALES*/
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;

  @ViewChild("myModalInfo", { static: false }) myModalInfo: TemplateRef<any>;
  @ViewChild("modalIntegrante", { static: false }) modalIntegrante: TemplateRef<any>;

  /*VARIABLES*/
  public codigo: number;
  public codigoSede = null;
  public codCategoria: number;
  public codSubcategoria: number;
  public codInstancia: number;
  public desCategoria: string;
  public desSubcategoria: string;
  public desInstancia: string;
  public habilitarSortearParticipante: boolean;
  public displayNone: string = '';
  public displayNone1: string = 'none';
  public displayBotonGuardar: string = 'none';
  public disabledEstado: boolean;
  public dateLastActive: string;

  /*LISTAS*/
  public listaParticipante: Participante[] = [];
  public listaParticipanteAux: Participante[] = [];
  public listaCategoria: Categoria[] = [];
  public listaSubcategoria: Subcategoria[] = [];
  public listaInstancia: Instancia[] = [];
  public listaEstadoCompetencia: EstadoCompetencia[] = [];
  public listaIntegrante: Integrante[] = [];


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
  public formSorteo: FormGroup;

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
    private readonly transaccionService: TransaccionService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private autenticacion: AuthenticationService,
  ) {
    // Inicio - Para acceder directamente a la página de inscripción
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser == null) {
      this.iniciarSesion();
    };
    // Fin - Para acceder directamente a la página de inscripción
    // Fechas en español
    moment.locale("es");
  }

  ngOnInit() {
    this.codigo = 0;
    this.codigoSede = 0;
    this.itemsRegistros = 10;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
    this.habilitarSortearParticipante = true;
    this.formSorteo = this.formBuilder.group({
      codCategoria: new FormControl('', Validators.required),
      codSubcategoria: new FormControl('', Validators.required),
      codInstancia: new FormControl('', Validators.required),
      dateLastActive: new FormControl(dayjs(new Date()).format("YYYY-MM-DD HH:mm")),
      numParticipante: new FormControl(''),
    })
    this.listarCategoriaActivo();
    this.listarEstadoCompetenciaActivo();
    this.disabledEstado = true;
    this.displayNone = '';
    this.displayNone1 = 'none';
    // Sincronizar fecha/hora competencia vs numero participante
    //this.listarParticipantePorEstado();
  }

  listarParticipantePorEstado() {
    this.listaParticipante = [];
    this.participanteService.listarParticipantePorEstado("A").subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        if (this.listaParticipante.length > 0) {
          for (const ele of this.listaParticipante) {
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
          }
        }
        // Ordenar lista por numParticipante
        //this.listaParticipante.sort((firstItem, secondItem) => firstItem.numParticipante - secondItem.numParticipante);
      }
    );
  }

  // Inicio - Acceder directamente a la página de inscripción
  iniciarSesion() {
    this.autenticacion.login('1707025746', '1512').subscribe(
      (respuesta) => {
      }
    );
  }
  // Fin - Acceder directamente a la página de inscripción

  listarIntegranteActivo() {
    this.participanteService.listarIntegranteActivo().subscribe(
      (respuesta) => {
        this.listaIntegrante = respuesta['listado'];
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

  listarCategoriaActivo() {
    this.participanteService.listarCategoriaActivo().subscribe(
      (respuesta) => {
        this.listaCategoria = respuesta['listado'];
      }
    )
  }

  listarSubcategoriaPorCategoria() {
    this.habilitarSortearParticipante = true;
    this.displayBotonGuardar = "none";
    this.listaParticipante = [];
    // Receptar codCategoria de formSorteo.value
    let formSorteoTemp = this.formSorteo.value;
    this.codCategoria = formSorteoTemp?.codCategoria;
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
    this.habilitarSortearParticipante = true;
    this.displayBotonGuardar = "none";
    this.listaParticipante = [];
    // Receptar codSubcategoria de formSorteo.value
    let formSorteoTemp = this.formSorteo.value;
    this.codSubcategoria = formSorteoTemp?.codSubcategoria;
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

  sorteoTotal() {
    if (this.listaCategoria.length > 0) {
      // Ordenar lista por codigo
      this.listaCategoria.sort((firstItem, secondItem) => firstItem.codigo - secondItem.codigo);
      for (let categoria of this.listaCategoria) {
        this.participanteService.listarSubcategoriaPorCategoria(categoria?.codigo).subscribe(
          (respuesta) => {
            this.listaSubcategoria = respuesta['listado'];
            if (this.listaSubcategoria.length > 0) {
              for (let subcategoria of this.listaSubcategoria) {
                this.codSubcategoria = subcategoria?.codigo;
                this.codInstancia = 1;
                this.participanteService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, 0).subscribe(
                  (respuesta) => {
                    this.listaParticipante = respuesta['listado'];
                    if (this.listaParticipante.length > 0) {
                      this.listaParticipante.sort((firstItem, secondItem) => Math.random() - 0.5);
                      this.participanteService.actualizarListaParticipante(this.listaParticipante).subscribe({
                        next: (response) => {
                          this.mensajeService.mensajeCorrecto('Se ha realizado el sorteo correctamente...');
                        },
                        error: (error) => {
                          this.mensajeService.mensajeError('Ha habido un problema al sortear los registros...');
                        }
                      });
                    }
                  }
                );
              }
            }
          }
        )
      }
    }
  }

  listarParticipantePorSubcategoriaInstanciaTot() {
    this.codInstancia = 1;
    this.participanteService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, 0).subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
      }
    );
  }

  async listarSubcategoria(categoria: Categoria) {
    return new Promise((resolve, rejects) => {
      this.participanteService.listarSubcategoriaPorCategoria(categoria?.codigo).subscribe({
        next: (respuesta) => {
          this.listaSubcategoria = respuesta['listado'];
          this.listaSubcategoria.sort((firstItem, secondItem) => firstItem.codigo - secondItem.codigo);
          resolve(respuesta);
        }, error: (error) => {
          this.mensajeService.mensajeError('Error al traer la lista. Subcategoria Error = ' + error)
          rejects("Error");
        }
      })
    })
  }

  async listarParticipante(subcategoria: Subcategoria) {
    this.codInstancia = 1;
    this.listaParticipante = [];
    return new Promise((resolve, rejects) => {
      this.participanteService.listarParticipantePorSubcategoriaInstancia(subcategoria?.codigo, this.codInstancia, 0).subscribe({
        next: (respuesta) => {
          this.listaParticipante = respuesta['listado'];
          if (this.listaParticipante.length > 0) {
            this.listaParticipante.sort((firstItem, secondItem) => Math.random() - 0.5);
          }
          resolve(respuesta);
        }, error: (error) => {
          this.mensajeService.mensajeError('Error al traer la lista. Participante Error = ' + error)
          rejects("Error");
        }
      })
    })
  }

  sorteoTotalAsync = async () => {
    await this.listaCategoria.sort((firstItem, secondItem) => firstItem.codigo - secondItem.codigo);
    for (let categoria of this.listaCategoria) {
      await this.listarSubcategoria(categoria);
      for (let subcategoria of this.listaSubcategoria) {
        await this.listarParticipante(subcategoria);
        if (this.listaParticipante.length > 0) {
          await this.actualizarListaParticipante();
        }
      }
    }
  }

  sincronizarOrden() {
    this.displayBotonGuardar = "";
    this.habilitarSortearParticipante = true;

    // Sortear aleatoriamente los participantes
    //this.listaParticipante.sort((firstItem, secondItem) => Math.random() - 0.5);

    let formSorteoTemp = this.formSorteo.value;
    let numParticipante: number = 0;
    if (formSorteoTemp?.numParticipante != "" && formSorteoTemp?.numParticipante != undefined) {
      numParticipante = formSorteoTemp?.numParticipante;
    }
    this.dateLastActive = formSorteoTemp?.dateLastActive;
    // Tiempo a sumar en minutos
    let tiempo = "00:03";
    let fechaASumar: any;

    this.listaParticipanteAux = [];
    this.participanteService.listarParticipantePorEstado("A").subscribe(
      (respuesta) => {
        this.listaParticipanteAux = respuesta['listado'];
        if (this.listaParticipanteAux.length > 0) {
          // Actualizar fecha competencia & numero participante
          for (const participante of this.listaParticipanteAux) {
            if (moment(this.dateLastActive).format('yyyy-MM-DD') == moment(participante?.dateLastActive).format('yyyy-MM-DD') &&
              participante?.numParticipante >= numParticipante) {
              fechaASumar = moment(this.dateLastActive);
              participante.dateLastActive = (fechaASumar.add(moment.duration(tiempo))).format('yyyy-MM-DD HH:mm');
              this.dateLastActive = participante?.dateLastActive;
            }
          }
        }
      }
    );
  }

  sinSortearParticipante() {
    this.displayBotonGuardar = "";
    this.habilitarSortearParticipante = true;

    let formSorteoTemp = this.formSorteo.value;
    let numParticipante: number = 0;
    if (formSorteoTemp?.numParticipante != "" && formSorteoTemp?.numParticipante != undefined) {
      numParticipante = formSorteoTemp?.numParticipante;
    }
    this.dateLastActive = formSorteoTemp?.dateLastActive;
    // Tiempo a sumar en minutos
    let tiempo = "00:03";
    let fechaASumar: any;
    // Actualizar fecha competencia & numero participante
    for (let participante of this.listaParticipante) {
      if (numParticipante > 0) {
        numParticipante += 1;
        participante.numParticipante = numParticipante;
      } else {
        participante.numParticipante = 0;
      }
      fechaASumar = moment(this.dateLastActive);
      participante.dateLastActive = (fechaASumar.add(moment.duration(tiempo))).format('yyyy-MM-DD HH:mm');
      this.dateLastActive = participante?.dateLastActive;
    }

    //return this.listaParticipante.sort((firstItem, secondItem) => Math.random() - 0.5);
  }

  sortearParticipante() {
    this.displayBotonGuardar = "";
    this.habilitarSortearParticipante = true;

    // Sortear aleatoriamente los participantes
    this.listaParticipante.sort((firstItem, secondItem) => Math.random() - 0.5);

    let formSorteoTemp = this.formSorteo.value;
    let numParticipante: number = 0;
    if (formSorteoTemp?.numParticipante != "" || formSorteoTemp?.numParticipante != undefined) {
      numParticipante = formSorteoTemp?.numParticipante;
    }
    this.dateLastActive = formSorteoTemp?.dateLastActive;
    // Tiempo a sumar en minutos
    let tiempo = "00:03";
    let fechaASumar: any;
    // Actualizar la fecha de competencia de los participantes
    for (let participante of this.listaParticipante) {
      if (numParticipante > 0) {
        numParticipante += 1;
        participante.numParticipante = numParticipante;
      } else {
        participante.numParticipante = 0;
      }
      fechaASumar = moment(this.dateLastActive);
      participante.dateLastActive = (fechaASumar.add(moment.duration(tiempo))).format('yyyy-MM-DD HH:mm');
      this.dateLastActive = participante?.dateLastActive;
    }

    //return this.listaParticipante.sort((firstItem, secondItem) => Math.random() - 0.5);
  }

  listarParticipantePorSubcategoriaInstancia() {
    this.habilitarSortearParticipante = true;
    this.displayBotonGuardar = "none";
    this.listaParticipante = [];
    // Receptar codSubcategoria de formSorteo.value
    let formSorteoTemp = this.formSorteo.value;
    this.codSubcategoria = formSorteoTemp?.codSubcategoria;
    this.buscarSubcategoriaPorCodigo();
    this.codInstancia = formSorteoTemp?.codInstancia;
    //this.codInstancia = 1;
    this.buscarInstanciaPorCodigo();
    this.participanteService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, 0).subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        if (this.listaParticipante?.length > 0) {
          //this.habilitarSortearParticipante = false;
          for (const ele of this.listaParticipante) {
            if (ele?.numParticipante != 0) {
              this.mensajeService.mensajeAdvertencia('Ya se ha realizado el sorteo de la Subcategoria ' + ele.desSubcategoria);
            } else {
              this.habilitarSortearParticipante = false;
            }
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
            ele.displayNoneGrupo = "none";
            if (ele.desSubcategoria.includes("GRUPOS") || ele.desSubcategoria.includes("CREW") ||
              ele.desSubcategoria.includes("SHOW DANCE")) {
              ele.displayNoneGrupo = "";
            }
          }
          // Ordenar lista por numParticipante
          this.listaParticipante.sort((firstItem, secondItem) => firstItem.numParticipante - secondItem.numParticipante);
        }
      }
    );
  }

  listarParticipantePorSubcategoriaInstanciaAux() {
    this.habilitarSortearParticipante = true;
    this.displayBotonGuardar = "none";
    this.listaParticipante = [];
    this.participanteService.listarParticipantePorSubcategoriaInstancia(this.codSubcategoria, this.codInstancia, 0).subscribe(
      (respuesta) => {
        this.listaParticipante = respuesta['listado'];
        if (this.listaParticipante?.length > 0) {
          for (const ele of this.listaParticipante) {
            ele.dateLastActive = dayjs(ele.dateLastActive).format("YYYY-MM-DD HH:mm")
            ele.displayNoneGrupo = "none";
            if (ele.desSubcategoria.includes("GRUPOS") || ele.desSubcategoria.includes("CREW") ||
              ele.desSubcategoria.includes("SHOW DANCE")) {
              ele.displayNoneGrupo = "";
            }
          }
          // Ordenar lista por numParticipante
          this.listaParticipante.sort((firstItem, secondItem) => firstItem.numParticipante - secondItem.numParticipante);
        }
      }
    );
  }

  async actualizarListaParticipante() {
    return new Promise((resolve, rejects) => {
      this.participanteService.actualizarListaParticipante(this.listaParticipante).subscribe({
        next: (respuesta) => {
          this.displayBotonGuardar = "none";
          this.habilitarSortearParticipante = true;
          this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
          resolve(respuesta);
        }, error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          rejects("Error");
        }
      })
    })
  }

  listarParticipantePDF() {
    if (this.listaParticipante.length > 0) {
      this.generarPDF();
    }
  }

  generarPDF() {
    const bodyData = this.listaParticipante.map((participante, index) => [index + 1, participante?.nombrePersona, participante?.identificacion, participante?.dateLastActive, ' ... ' + participante?.numParticipante, participante?.postcode]);
    const pdfDefinition: any = {
      content: [
        { text: 'Sorteo Participantes: ' + this.desCategoria + '/' + this.desSubcategoria, style: 'datoTituloGeneral' },
        {
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['#', 'Nombre', 'Identificación', 'Fecha Competir', '# Orden', 'Chequeo'],
              ...bodyData
            ],
          },
          style: 'datosTabla'
        },
      ],
      styles: {
        datosTabla: {
          fontSize: 10,
          margin: [50, 5, 5, 0], // Margen inferior para separar la tabla de otros elementos
          fillColor: '#F2F2F2', // Color de fondo de la tabla
        },
        datoTitulo: {
          fontSize: 10
        },
        datoTituloGeneral: {
          fontSize: 15,
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

  confirmarActualizarListaParticipante() {
    Swal
      .fire({
        title: "Sortear Participantes",
        text: "¿Quieres guardar el sorteo?'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
      })
      .then(resultado => {
        if (resultado.value) {
          // Hicieron click en "Sí, sortear"
          // Si proceso es sincronizarOrden lista-aux mover a lista
          if (this.listaParticipanteAux.length > 0) {
            this.listaParticipante = this.listaParticipanteAux;
          }
          // Actualizar formato fecha lista participantes
          for (let participante of this.listaParticipante) {
            participante.dateLastActive = dayjs(participante?.dateLastActive).format('YYYY-MM-DD HH:mm:ss.SSS');
          }
          this.participanteService.actualizarListaParticipante(this.listaParticipante).subscribe({
            next: (response) => {
              this.listaParticipante = response['listado'];
              this.displayBotonGuardar = "none";
              this.habilitarSortearParticipante = true;
              this.listarParticipantePorSubcategoriaInstanciaAux();
              this.mensajeService.mensajeCorrecto('Se ha sorteado los participantes de la Subcategoría ' + this.desSubcategoria);
              this.confirmarEnviarNotificacion();
            },
            error: (error) => {
              this.listarParticipantePorSubcategoriaInstancia();
              this.mensajeService.mensajeError('Ha habido un problema al sortear los participantes...');
            }
          });
        } else {
          // Hicieron click en "Cancelar"
          console.log("*Se cancela el proceso...*");
        }
      });
  }

  confirmarSorteoTotal() {
    Swal
      .fire({
        title: "Sortear Participantes",
        text: "¿Quieres sortear los participantes?'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "Sí, sortear",
        cancelButtonText: "Cancelar",
      })
      .then(resultado => {
        if (resultado.value) {
          // Hicieron click en "Sí, sortear"
          this.sorteoTotalAsync();
        } else {
          // Hicieron click en "Cancelar"
          console.log("*Se cancela el proceso...*");
        }
      });
  }

  confirmarEnviarNotificacion() {
    Swal
      .fire({
        title: "Enviar Notificaciones a los Participantes",
        text: "¿Quiere enviar Notificaciones a los participantes?'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: "Sí, enviar",
        cancelButtonText: "Cancelar",
      })
      .then(resultado => {
        if (resultado.value) {
          // Hicieron click en "Sí, sortear"
          if (this.listaParticipante.length > 0) {
            this.enviarNotificacion();
          }
        } else {
          // Hicieron click en "Cancelar"
          console.log("*Se cancela el proceso...*");
        }
      });
  }

  enviarNotificacion = async () => {
    for (let ele of this.listaParticipante) {
      // Tratar nombre de Pariicipante
      if (ele?.lastName != "" && ele?.username == "") {
        ele.nombrePersona = ele?.firstName + " - " + ele?.lastName;
      } else {
        ele.nombrePersona = ele?.firstName;
      }
      await this.enviarWhatsappApi(ele);
    }
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
      + participante?.desCategoria + "/" + participante?.desSubcategoria + " a salido sorteada para el día "
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
        this.mensajeService.mensajeCorrecto('Las notificaciones se enviaron con éxito...');
      },
      error: (error) => {
        this.mensajeService.mensajeError('Ha habido un problema al enviar las notificaciones ' + error);
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

  closeDetail($event) {
    this.showDetail = $event;
    this.participanteSeleccionado = null;
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

  mostrarModalInfo() {
    this.modalService.open(this.myModalInfo);
  }

  verListaIntegrante = async (codParticipante: number) => {
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
  get codCategoriaField() {
    return this.formSorteo.get('codCategoria');
  }
  get codSubcategoriaField() {
    return this.formSorteo.get('codSubcategoria');
  }
  get codInstanciaField() {
    return this.formSorteo.get('codInstancia');
  }
  get dateLastActiveField() {
    return this.formSorteo.get('dateLastActive');
  }
  get numParticipanteField() {
    return this.formSorteo.get('numParticipante');
  }

}
