import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Sede } from 'app/auth/models/sede';
import { Subcategoria } from 'app/main/pages/compartidos/modelos/Subcategoria';
import { MensajesIziToastService } from 'app/main/pages/compartidos/servicios/iziToast/mensajesIziToast.service';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { DetailComponent } from 'app/main/pages/catalogo/subcategoria/componentes/detail/detail.component';
import { SubcategoriaService } from '../../../servicios/subcategoria.service';
import { CategoriaService } from 'app/main/pages/catalogo/categoria/servicios/categoria.service';
import { Categoria } from 'app/main/pages/compartidos/modelos/Categoria';

@Component({
  selector: 'app-form-subcategoria',
  templateUrl: './form-subcategoria.component.html',
  styleUrls: ['./form-subcategoria.component.scss']
})
export class FormSubcategoriaComponent implements OnInit {
  /*SPINNER*/
  public load_btn: boolean;
  
  /*OUTPUT ENVIAN*/
  @Output() close: EventEmitter<boolean>;
  @Output() listaSubcategoria: EventEmitter<any>;

  /*INPUT RECIBEN*/
  @Input() listaSubcategoriaChild: any;
  @Input() subcategoriaEditar: Subcategoria;
  @Input() codigoChild: number;
  @Input() codCategoriaChild: number;

  /*MODALES*/
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;
  @ViewChild(DetailComponent, { static: false }) parentDetail: DetailComponent;
  
  /*VARIABLES */
  public showDetail: boolean;
  private amieRegex: string;
  private currentUser: any;
  private sede: Sede;
  
  /*FORMULARIOS*/
  public formSubcategoria: FormGroup;

  /*OBJETOS*/
  public subcategoria: Subcategoria;
  public listaCategoria: Categoria[];
  
  /*CONSTRUCTOR*/
  constructor(
    private subcategoriaService: SubcategoriaService,
    private categoriaService: CategoriaService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private mensajeIzi: MensajesIziToastService,
  ) {
    this.load_btn = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.sede = this.currentUser.sede;
    //this.amieRegex = this.patternAmie(this.sede.nombre);
    this.close = new EventEmitter<boolean>();
    this.listaSubcategoria = new EventEmitter<any>();
    this.showDetail = true;

  }

  ngOnInit() {
    this.listarCategoria();
    if (this.subcategoriaEditar) {
      this.formSubcategoria = this.formBuilder.group({
        denominacion: new FormControl(this.subcategoriaEditar?.denominacion, Validators.required),
        categoria: new FormControl(this.subcategoriaEditar?.categoria),
        numJueces: new FormControl(this.subcategoriaEditar?.numJueces, Validators.required),
      })
      //AQUI TERMINA ACTUALIZAR
    } else {
      this.formSubcategoria = this.formBuilder.group({
        denominacion: new FormControl('', Validators.required),
        categoria: new FormControl(''),
        numJueces: new FormControl('', Validators.required),
      })
    }
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
  
  async listarSubcategoriaPorCategoria() {
    this.subcategoriaService.listarSubcategoriaPorCategoria(this.codCategoriaChild).subscribe(
      (respuesta) => {
        this.listaSubcategoriaChild = respuesta['listado']
        for (const ele of this.listaSubcategoriaChild) {
          this.categoriaService.buscarCategoriaPorCodigo(ele.codCategoria).subscribe(
            (respuesta) => {
              ele.categoria = respuesta['objeto'];
            }
          )
        }
        this.listaSubcategoria.emit(this.listaSubcategoriaChild);
      }
    );
  }

  patternAmie(amie: string) {
    const valorEncontrar = amie
    const regExp = new RegExp('([0-9])\\w+')
    const amieFiltrado = valorEncontrar.match(regExp)
    return amieFiltrado['0']
  }

  addRegistro() {
    if (this.formSubcategoria?.valid) {
      let subcategoriaTemp = this.formSubcategoria.value;
      this.subcategoria = new Subcategoria({
        codigo: 0,
        denominacion: subcategoriaTemp?.denominacion,
        estado: 'A',
        codCategoria: this.codCategoriaChild,
        numJueces: subcategoriaTemp?.numJueces,
      });
    }
    if (this.subcategoriaEditar) {
      this.subcategoria['data'].codigo = this.subcategoriaEditar.codigo;
      this.subcategoriaService.guardarSubcategoria(this.subcategoria['data']).subscribe({
        next: (response) => {
          this.listarSubcategoriaPorCategoria();
          this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
          this.parentDetail.closeDetail();
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    } else {
      this.subcategoriaService.guardarSubcategoria(this.subcategoria['data']).subscribe({
        next: async (response) => {
          this.listarSubcategoriaPorCategoria();
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

  compararCategoria(o1, o2) {
    return o1 === undefined || o2 === undefined || o2 === null ? false : o1.codigo === o2.codigo;
  }

  get denominacionField() {
    return this.formSubcategoria.get('denominacion');
  }
  get categoriaField() {
    return this.formSubcategoria.get('categoria');
  }
  get numJuecesField() {
    return this.formSubcategoria.get('numJueces');
  }
}
