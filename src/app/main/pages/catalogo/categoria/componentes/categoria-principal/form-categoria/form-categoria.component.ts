import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { CategoriaService } from '../../../servicios/categoria.service';
import { DetailComponent } from '../../detail/detail.component';

@Component({
  selector: 'app-form-categoria',
  templateUrl: './form-categoria.component.html',
  styleUrls: ['./form-categoria.component.scss']
})

export class FormCategoriaComponent implements OnInit {
  /*OUTPUT ENVIAN*/
  @Output() close: EventEmitter<boolean>;
  @Output() listaCategoria: EventEmitter<any>;
  
  /*INPUT RECIBEN*/
  @Input() listaCategoriaChild: any;
  @Input() categoriaEditar: Categoria;

  /*MODALES*/
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;
  @ViewChild(DetailComponent, { static: false }) parentDetail: DetailComponent;
  
  /*VARIABLES*/
  public showDetail: boolean;
  private currentUser: any;

  /*FORMULARIOS*/
  public formCategoria: FormGroup;

  /*OBJETOS*/
  public categoria: Categoria;
  public listaCategoriaSuperior: Categoria[];

  /*CONSTRUCTOR*/
  constructor(
    private categoriaService: CategoriaService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.close = new EventEmitter<boolean>();
    this.listaCategoria = new EventEmitter<any>();
    this.showDetail = true;
  }

  ngOnInit() {
    if (this.categoriaEditar) {
      this.formCategoria = this.formBuilder.group({
        denominacion: new FormControl(this.categoriaEditar?.denominacion, Validators.required),
        edadMinima: new FormControl(this.categoriaEditar?.edadMinima),
        edadMaxima: new FormControl(this.categoriaEditar?.edadMaxima),
      })
    } else {
      this.formCategoria = this.formBuilder.group({
        denominacion: new FormControl('', Validators.required),
        edadMinima: new FormControl(''),
        edadMaxima: new FormControl(''),
      })
    }
  }

  async listarCategoriaActivoAsync() {
    this.categoriaService.listarCategoriaActivo().subscribe(
      (respuesta) => {
        this.listaCategoriaChild = respuesta['listado']
        this.listaCategoria.emit(this.listaCategoriaChild);
      }
    );
  }
  
  addRegistro() {
    if (this.formCategoria?.valid) {
      let categoriaTemp = this.formCategoria.value;
      let codigoCategoriaSuperior = 0;
      this.categoria = new Categoria({
        codigo: 0,
        denominacion: categoriaTemp?.denominacion,
        edadMinima: categoriaTemp?.edadMinima,
        edadMaxima: categoriaTemp?.edadMaxima,
        estado: 'A',
      });
    }

    if (this.categoriaEditar) {
      this.categoria['data'].codigo = this.categoriaEditar.codigo;
      this.categoriaService.guardarCategoria(this.categoria['data']).subscribe({
        next: (response) => {
          this.listarCategoriaActivoAsync();
          this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
          this.parentDetail.closeDetail();
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    } else {
      this.categoriaService.guardarCategoria(this.categoria['data']).subscribe({
        next: async (response) => {
          this.listarCategoriaActivoAsync();
          this.mensajeService.mensajeCorrecto('Se ha agregado el registro correctamente...');
          this.parentDetail.closeDetail();
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

  compararCategoriaSuperior(o1, o2) {
    return o1 === undefined || o2 === undefined || o2 === null ? false : o1.codigo === o2.codigo;
  }

  get denominacionField() {
    return this.formCategoria.get('denominacion');
  }
  get edadMinimaField() {
    return this.formCategoria.get('edadMinima');
  }
  get edadMaximaField() {
    return this.formCategoria.get('edadMaxima');
  }
}
