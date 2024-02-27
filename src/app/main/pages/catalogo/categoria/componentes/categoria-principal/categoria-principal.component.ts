import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { CategoriaService } from '../../servicios/categoria.service';
import { DetailComponent } from '../detail/detail.component';

@Component({
  selector: 'app-categoria-principal',
  templateUrl: './categoria-principal.component.html',
  styleUrls: ['./categoria-principal.component.scss']
})

export class CategoriaPrincipalComponent implements OnInit {
  /*MODALES*/
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;
  @ViewChild(DetailComponent, { static: false }) parentDetail: DetailComponent;

  /*VARIABLES*/
  public mensaje: string;

  /*LISTAS*/
  public listaCategoria: Categoria[] = [];

  /*TABS*/
  public selectedTab: number;

  /*DETAIL*/
  public showDetail: boolean;

  /*PAGINACION*/
  public page: number;
  public itemsRegistros: number;

  /*OBJETOS*/
  public categoriaSeleccionado: Categoria;
  public categoriaSuperior: Categoria;

  /*CONSTRUCTOR*/
  constructor(
    /*Servicios*/
    private readonly categoriaService: CategoriaService,
    private readonly mensajeService: MensajeService,
  ) {
    this.itemsRegistros = 5;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
  }

  ngOnInit() {
    this.listarCategoriaActivo();
  }

  listarCategoriaActivo() {
    this.categoriaService.listarCategoriaActivo().subscribe(
      (respuesta) => {
        this.listaCategoria = respuesta['listado'];
        if (this.listaCategoria.length < this.itemsRegistros) {
          this.page = 1;
        }
        // Ordenar lista por codigo
        //this.listaCategoria.sort((firstItem, secondItem) => firstItem.categoria.codigo - secondItem.categoria.codigo);
      }
    );
  }

  listarCategoriaActivoActualizada(event) {
    this.listaCategoria = event;
  }

  openDetail() {
    this.showDetail = true;
  }

  openEditarDetail(categoria: Categoria) {
    this.categoriaSeleccionado = categoria;
    if (this.listaCategoria.length < this.itemsRegistros) {
      this.page = 1;
    }
    this.showDetail = true;
  }

  openRemoverDetail(categoria: Categoria) {
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
          this.categoriaService.eliminarCategoriaPorId(categoria.codigo).subscribe({
            next: (response) => {
              this.listarCategoriaActivo();
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

  closeDetail($event) {
    this.showDetail = $event;
    this.categoriaSeleccionado = null;
  }

}
