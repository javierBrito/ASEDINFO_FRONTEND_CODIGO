import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Parametro } from 'app/main/pages/compartidos/modelos/Parametro';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import { ParametroService } from '../../../servicios/parametro.service';
import { DetailComponent } from '../../detail/detail.component';

@Component({
  selector: 'app-form-parametro',
  templateUrl: './form-parametro.component.html',
  styleUrls: ['./form-parametro.component.scss']
})

export class FormParametroComponent implements OnInit {
  /*OUTPUT ENVIAN*/
  @Output() close: EventEmitter<boolean>;
  @Output() listaParametro: EventEmitter<any>;
  
  /*INPUT RECIBEN*/
  @Input() listaParametroChild: any;
  @Input() parametroEditar: Parametro;

  /*MODALES*/
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;
  @ViewChild(DetailComponent, { static: false }) parentDetail: DetailComponent;
  
  /*VARIABLES*/
  public showDetail: boolean;
  private currentUser: any;

  /*FORMULARIOS*/
  public formParametro: FormGroup;

  /*OBJETOS*/
  public parametro: Parametro;
  public listaParametroAux: Parametro[];

  /*CONSTRUCTOR*/
  constructor(
    private parametroService: ParametroService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.close = new EventEmitter<boolean>();
    this.listaParametro = new EventEmitter<any>();
    this.showDetail = true;
  }

  ngOnInit() {
    this.listarParametroActivo();
    if (this.parametroEditar) {
      this.formParametro = this.formBuilder.group({
        descripcion: new FormControl(this.parametroEditar.descripcion, Validators.required),
        nemonico: new FormControl(this.parametroEditar.nemonico, Validators.required),
        valor: new FormControl(this.parametroEditar.valor),
        valorCadena: new FormControl(this.parametroEditar.valorCadena),
      })
    } else {
      this.formParametro = this.formBuilder.group({
        descripcion: new FormControl('', Validators.required),
        nemonico: new FormControl('', Validators.required), 
        valor: new FormControl(''), 
        valorCadena: new FormControl(''),
      })
    }
  }

  async listarParametroActivoAsync() {
    this.parametroService.listarParametroActivo().subscribe(
      (respuesta) => {
        this.listaParametroChild = respuesta['listado']
        for (const ele of this.listaParametroChild) {
          this.parametroService.buscarParametroPorCodigo(ele.codigo).subscribe(
            (respuesta) => {
              ele.parametro = respuesta['objeto'];
            }
          )
        }
        this.listaParametro.emit(this.listaParametroChild);
      }
    );
  }

  listarParametroActivo() {
    this.parametroService.listarParametroActivo().subscribe({
      next: (response) => {
        this.listaParametroAux = response['listado'];
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
  
  addRegistro() {
    if (this.formParametro?.valid) {
      let parametroTemp = this.formParametro.value;
      this.parametro = new Parametro({
        //codigo: parametroTemp.codigo,
        valorCadena: parametroTemp.valorCadena,
        descripcion: parametroTemp.descripcion,
        nemonico: parametroTemp.nemonico,
        valor: parametroTemp.valor,
        estado: 'A',
      });
    }
    if (this.parametroEditar) {
      this.parametro['data'].codigo = this.parametroEditar.codigo;
      this.parametroService.guardarParametro(this.parametro['data']).subscribe({
        next: (response) => {
          this.listarParametroActivoAsync();
          this.mensajeService.mensajeCorrecto('Se ha actualizado el registro correctamente...');
          this.parentDetail.closeDetail();
        },
        error: (error) => {
          this.mensajeService.mensajeError('Ha habido un problema al actualizar el registro...');
          this.parentDetail.closeDetail();
        }
      });
    } else {
      this.parametroService.guardarParametro(this.parametro['data']).subscribe({
        next: async (response) => {
          this.listarParametroActivoAsync();
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

  get valorCadenaField() {
    return this.formParametro.get('valorCadena');
  }
  get descripcionField() {
    return this.formParametro.get('descripcion');
  }
  get nemonicoField() {
    return this.formParametro.get('nemonico');
  }
  get valorField() {
    return this.formParametro.get('valor');
  }
}
