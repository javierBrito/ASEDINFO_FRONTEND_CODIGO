import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Parametro } from 'app/main/pages/compartidos/modelos/Parametro';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { ParametroService } from '../../servicios/parametro.service';
import { DetailComponent } from '../detail/detail.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PuntajeService } from 'app/main/pages/competencia/puntaje/servicios/puntaje.service';

@Component({
  selector: 'app-parametro-principal',
  templateUrl: './parametro-principal.component.html',
  styleUrls: ['./parametro-principal.component.scss']
})

export class ParametroPrincipalComponent implements OnInit {
  /*MODALES*/
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;
  @ViewChild(DetailComponent, { static: false }) parentDetail: DetailComponent;

  /*VARIABLES*/
  public mensaje: string;
  public codCategoria: number;
  public codSubcategoria: number;
  public codInstancia: number;
  public codParametro: number;
  public valor: number;
  public nemonico: string;
  public descripcion: string;

  /*LISTAS*/
  public listaParametro: Parametro[] = [];
  public listaCategoria: any[];
  public listaSubcategoria: any[];
  public listaInstancia: any[];
  public listaModeloPuntaje: any[];

  /*TABS*/
  public selectedTab: number;

  /*DETAIL*/
  public showDetail: boolean;

  /*PAGINACION*/
  public page: number;
  public pageVespertina: number;
  public pageNocturna: number;
  public itemsRegistros: number;

  /*OBJETOS*/
  public parametroSeleccionado: Parametro;
  public parametro: Parametro;

  /*FORMULARIOS*/
  public formParametroParametro: FormGroup;

  /*CONSTRUCTOR*/
  constructor(
    /*Servicios*/
    private readonly puntajeService: PuntajeService,
    private readonly parametroService: ParametroService,
    private readonly mensajeService: MensajeService,
    private formBuilder: FormBuilder
  ) {
    this.itemsRegistros = 5;
    this.page = 1;
    this.pageVespertina = 1;
    this.pageNocturna = 1;
    this.showDetail = false;
    this.selectedTab = 0;
  }

  ngOnInit() {
    this.listarParametroActivo();
    this.formParametroParametro = this.formBuilder.group({
      codCategoria: new FormControl('', Validators.required),
      codSubcategoria: new FormControl('', Validators.required),
      codInstancia: new FormControl('', Validators.required),
    });
    this.listarModeloPuntajeActivo();
    this.listarCategoriaActivo();
    this.listarInstanciaActivo();
  }

  listarModeloPuntajeActivo() {
    this.puntajeService.listarModeloPuntajeActivo().subscribe(
      (respuesta) => {
        this.listaModeloPuntaje = respuesta['listado'];
      }
    )
  }

  listarCategoriaActivo() {
    this.puntajeService.listarCategoriaActivo().subscribe(
      (respuesta) => {
        this.listaCategoria = respuesta['listado'];
      }
    )
  }

  listarSubcategoriaPorCategoria() {
    // Receptar la descripción de formPuntajeParametro.value
    let puntajeParametroTemp = this.formParametroParametro.value;
    this.codCategoria = puntajeParametroTemp?.codCategoria;
    this.puntajeService.listarSubcategoriaPorCategoria(this.codCategoria).subscribe(
      (respuesta) => {
        this.listaSubcategoria = respuesta['listado'];
      }
    )
  }

  listarInstanciaActivo() {
    this.puntajeService.listarInstanciaActivo().subscribe(
      (respuesta) => {
        this.listaInstancia = respuesta['listado'];
      }
    )
  }

  async guardarParametros() {
    // Receptar el codCategoria, codSubcategoria y codInstancia de formPuntajeParametro.value
    let puntajeParametroTemp = this.formParametroParametro.value;
    this.codSubcategoria = puntajeParametroTemp?.codSubcategoria;
    this.codInstancia = puntajeParametroTemp?.codInstancia;

    // Verificar si existen ya los parámetros de Subcategoria
    this.codParametro = 0;
    this.nemonico = 'SUBCATEGORIA';
    await this.verificarExistenciaParametro(this.nemonico);
    // Mover los datos a guardar o actualizar
    this.descripcion = "SUBCATEGORIA DE LA COMPETENCIA";
    this.valor = this.codSubcategoria;
    // Guardar parámetros de Subcategoria
    await this.addRegistro();

    // Verificar si existen ya los parámetros de Instancia
    this.codParametro = 0;
    this.nemonico = 'INSTANCIA';
    await this.verificarExistenciaParametro(this.nemonico);
    // Mover los datos a guardar o actualizar
    this.descripcion = "INSTANCIA DE LA COMPETENCIA";
    this.valor = this.codInstancia;
    // Guardar parámetros de Subcategoria
    await this.addRegistro();
  }

  async verificarExistenciaParametro(nemonico: string) {
    return new Promise((resolve, rejects) => {
      this.parametroService.buscarParametroPorNemonico(nemonico).subscribe({
        next: (respuesta) => {
          this.parametro = respuesta['objeto'];
          this.codParametro = this.parametro?.codigo;
          resolve(respuesta);
        }, error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          rejects("Error");
        }
      })
    })
  }

  addRegistro() {
    this.parametro = new Parametro({
      codigo: this.codParametro,
      valorCadena: '',
      descripcion: this.descripcion,
      nemonico: this.nemonico,
      valor: this.valor,
      estado: 'A',
    });

    if (this.parametro.codigo != null) {
      this.parametroService.guardarParametro(this.parametro['data']).subscribe({
        next: (response) => {
          this.listarParametroActivo();
          this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
        }
      });
    } else {
      this.parametroService.guardarParametro(this.parametro['data']).subscribe({
        next: async (response) => {
          this.listarParametroActivo();
          this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al agregar el registro...');
        }
      });
    }
  }

  listarParametroActivo() {
    this.parametroService.listarParametroActivo().subscribe(
      (respuesta) => {
        this.listaParametro = respuesta['listado'];
        if (this.listaParametro.length < this.itemsRegistros) {
          this.page = 1;
        }
      }
    );
  }

  listarParametroActivoActualizada(event) {
    this.listaParametro = event;
  }

  openDetail() {
    this.showDetail = true;
  }

  openEditarDetail(parametro: Parametro) {
    this.parametroSeleccionado = parametro;
    if (this.listaParametro.length < this.itemsRegistros) {
      this.page = 1;
    }
    this.showDetail = true;
  }

  openRemoverDetail(parametro: Parametro) {
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
          this.parametroService.eliminarParametroPorId(parametro.codigo).subscribe({
            next: (response) => {
              this.listarParametroActivo();
              this.mensajeService.mensajeCorrecto('El registro ha sido borrada con éxito...');
              this.page = 1;
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

  compararCategoria(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }

  compararSubcategoria(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }

  compararInstancia(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }

  closeDetail($event) {
    this.showDetail = $event;
    this.parametroSeleccionado = null;
  }

  /* Variables del html, para receptar datos y validaciones*/
  get codCategoriaField() {
    return this.formParametroParametro.get('codCategoria');
  }
  get codSubcategoriaField() {
    return this.formParametroParametro.get('codSubcategoria');
  }
  get codInstanciaField() {
    return this.formParametroParametro.get('codInstancia');
  }

}
