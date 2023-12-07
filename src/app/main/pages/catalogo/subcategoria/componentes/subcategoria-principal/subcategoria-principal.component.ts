import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { Subcategoria } from 'app/main/pages/compartidos/modelos/Subcategoria';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { SubcategoriaService } from '../../servicios/subcategoria.service';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { CategoriaService } from 'app/main/pages/catalogo/categoria/servicios/categoria.service';

@Component({
  selector: 'app-subcategoria-principal',
  templateUrl: './subcategoria-principal.component.html',
  styleUrls: ['./subcategoria-principal.component.scss']
})
export class SubcategoriaPrincipalComponent implements OnInit {
  /*MODALES*/
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;

  /*VARIABLES*/
  public codigo: number;
  public institucion: any;
  public codCategoria = null;

  /*LISTAS*/
  public listaSubcategoria: Subcategoria[] = [];
  public listaCategoria: Categoria[] = [];
  public listaPeriodoRegAniLec: any[];

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
  public subcategoriaSeleccionado: Subcategoria;

  /*FORMULARIOS*/
  public formSubcategoria: FormGroup;

  /*CONSTRUCTOR */
  constructor(
    /*Servicios*/
    private readonly subcategoriaService: SubcategoriaService,
    private readonly categoriaService: CategoriaService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
  ) {
    this.codigo = 0;
    this.codCategoria = 0;
    this.itemsRegistros = 5;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.sede = this.currentUser.sede;
  }

  ngOnInit() {
    this.listarCategoria();
    this.formSubcategoria = this.formBuilder.group({
      categoria: new FormControl('', Validators.required)
    })
  }

  listarCategoria() {
    this.categoriaService.listarCategoriaActivo().subscribe({
      next: (response) => {
        this.listaCategoria = response['listado'];
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  listarSubcategoria() {
    let subcategoriaTemp = this.formSubcategoria.value;
    this.codCategoria = subcategoriaTemp.categoria.codigo;
    this.subcategoriaService.listarSubcategoriaPorCategoria(this.codCategoria).subscribe(
      (respuesta) => {
        this.listaSubcategoria = respuesta['listado'];
        if (this.listaSubcategoria.length < this.itemsRegistros) {
          this.page = 1;
        }
        for (const ele of this.listaSubcategoria) {
          this.categoriaService.buscarCategoriaPorCodigo(ele.codCategoria).subscribe(
            (respuesta) => {
              ele.categoria = respuesta['objeto'];
            }
          )
        }
        // Ordenar lista por codigo
        //this.listaSubcategoria.sort((firstItem, secondItem) => firstItem.categoria.codigo - secondItem.categoria.codigo);
      }
    );
  }

  listaSubcategoriaActualizada(event) {
    this.listaSubcategoria = event;
  }

  openDetail(codjornada) {
    this.showDetail = true;
  }

  openEditarDetail(subcategoria: Subcategoria) {
    this.subcategoriaSeleccionado = subcategoria;
    this.showDetail = true;
  }

  openRemoverDetail(subcategoria: Subcategoria) {
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
          this.subcategoriaService.eliminarSubcategoriaPorId(subcategoria.codigo).subscribe({
            next: (response) => {
              this.listarSubcategoria();
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

  compararCategoria(o1, o2) {
    return o1 === undefined || o2 === undefined ? false : o1.codigo === o2.codigo;
  }
  
  closeDetail($event) {
    this.showDetail = $event;
    this.subcategoriaSeleccionado = null;
  }

}
