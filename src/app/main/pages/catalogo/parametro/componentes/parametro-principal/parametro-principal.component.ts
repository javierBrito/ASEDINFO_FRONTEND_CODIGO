import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Parametro } from 'app/main/pages/compartidos/modelos/Parametro';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { ParametroService } from '../../servicios/parametro.service';
import { DetailComponent } from '../detail/detail.component';

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
  
  /*LISTAS*/
  public listaParametro: Parametro[] = [];
  
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
  
  /*CONSTRUCTOR*/
  constructor(
  /*Servicios*/
    private readonly parametroService: ParametroService,
    private readonly mensajeService: MensajeService,
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

  closeDetail($event) {
    this.showDetail = $event;
    this.parametroSeleccionado = null;
  }

}
