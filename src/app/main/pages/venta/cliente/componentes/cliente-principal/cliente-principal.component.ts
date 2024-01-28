import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginAplicacion } from 'app/auth/models/loginAplicacion';
import { Sede } from 'app/auth/models/sede';
import { Cliente } from 'app/main/pages/compartidos/modelos/Cliente';
import { MensajeService } from 'app/main/pages/compartidos/servicios/mensaje/mensaje.service';
import Swal from 'sweetalert2';
import { Aplicacion } from 'app/main/pages/compartidos/modelos/Aplicacion';
import { MyValidators } from 'app/utils/validators';
import dayjs from "dayjs";
import { Persona } from 'app/main/pages/compartidos/modelos/Persona';
import { empty } from 'rxjs';
import { ClienteService } from '../../servicios/cliente.service';
import { PersonaService } from 'app/main/pages/catalogo/persona/servicios/persona.service';
import { SedeService } from 'app/main/pages/seguridad/sede/servicios/sede.service';

@Component({
  selector: 'app-cliente-principal',
  templateUrl: './cliente-principal.component.html',
  styleUrls: ['./cliente-principal.component.scss']
})
export class ClientePrincipalComponent implements OnInit {
  /*INPUT RECIBEN*/
  @Input() listaPersonaChild: any;

  /*MODALES*/
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;

  /*VARIABLES*/
  public codigo: number;
  public institucion: any;
  public codigoSede = null;
  public identificacion: string;
  public nombre: string;

  /*LISTAS*/
  public listaCliente: Cliente[] = [];
  public listaPersona: Persona[] = [];
  public listaAplicacion: Aplicacion[] = [];

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
  public clienteSeleccionado: Cliente;

  /*FORMULARIOS*/
  public formCliente: FormGroup;
  public formClienteIdentificacion: FormGroup;

  /*CONSTRUCTOR */
  constructor(
    /*Servicios*/
    private readonly clienteService: ClienteService,
    private readonly personaService: PersonaService,
    private readonly sedeService: SedeService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
  ) {
    this.codigo = 0;
    this.codigoSede = 0;
    this.itemsRegistros = 5;
    this.page = 1;
    this.showDetail = false;
    this.selectedTab = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.sede = this.currentUser.sede;
  }

  ngOnInit() {
    if (this.listaPersonaChild != null) {
      this.listaPersona = this.listaPersonaChild;
    }
    this.formClienteIdentificacion = this.formBuilder.group({
      nombre: new FormControl(''),
      identificacion: new FormControl(''),
      /*
        identificacion: new FormControl('', Validators.compose([
        MyValidators.isCedulaValid,
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern("^[0-9]*$"),
      ])),
      */
    })
    this.listarClienteActivoOrdenNombre();
  }

  listarClienteActivoOrdenNombre() {
    this.clienteService.listarClienteActivoOrdenNombre().subscribe(
      (respuesta) => {
        this.listaCliente = respuesta['listado'];
        for (const ele of this.listaCliente) {
          ele.fechaInicio = dayjs(ele.fechaInicio).format("YYYY-MM-DD");
          if (ele?.prefijoTelefonico == null || ele?.prefijoTelefonico == "") {
            ele.prefijoTelefonico = '593';
          }
        }
        if (this.listaCliente.length < this.itemsRegistros) {
          this.page = 1;
        }
      }
    );
  }

  listarCliente() {
    // Receptar la identificación y/o nombre de formInscripcionCedula.value
    let clienteIdentificacionTemp = this.formClienteIdentificacion.value;
    this.identificacion = clienteIdentificacionTemp.identificacion;
    this.nombre = clienteIdentificacionTemp.nombre;
    if (this.nombre?.length != 0) {
      this.listarClientePorPersonaNombre();
      return;
    }
    if (this.identificacion?.length != 0) {
      this.listarClientePorPersonaIdentificacion();
      return;
    }
  }

  listarClientePorPersonaIdentificacion() {
    // Receptar la identificación de formInscripcionCedula.value
    //let clienteIdentificacionTemp = this.formClienteIdentificacion.value;
    //this.identificacion = clienteIdentificacionTemp.identificacion;
    this.clienteService.listarClientePorPersonaIdentificacion(this.identificacion).subscribe(
      (respuesta) => {
        this.listaCliente = respuesta['listado'];
        for (const ele of this.listaCliente) {
          ele.fechaInicio = dayjs(ele.fechaInicio).format("YYYY-MM-DD")
          if (ele?.prefijoTelefonico == null || ele?.prefijoTelefonico == "") {
            ele.prefijoTelefonico = '593';
          }
        }
        if (this.listaCliente.length < this.itemsRegistros) {
          this.page = 1;
        }
      }
    );
  }

  listarClientePorPersonaNombre() {
    // Receptar el nombre de formClienteIdentificacion.value
    //let clienteIdentificacionTemp = this.formClienteIdentificacion.value;
    //this.nombre = clienteIdentificacionTemp.nombre;
    this.clienteService.listarClientePorPersonaNombre(this.nombre).subscribe(
      (respuesta) => {
        this.listaCliente = respuesta['listado'];
        for (const ele of this.listaCliente) {
          ele.fechaInicio = dayjs(ele.fechaInicio).format("YYYY-MM-DD")
          if (ele?.prefijoTelefonico == null || ele?.prefijoTelefonico == "") {
            ele.prefijoTelefonico = '593';
          }
        }
        if (this.listaCliente.length < this.itemsRegistros) {
          this.page = 1;
        }
      }
    );
  }

  listaClienteActualizada(event) {
    this.listaCliente = event;
  }

  openDetail(codjornada) {
    this.showDetail = true;
    if (this.listaCliente.length < this.itemsRegistros) {
      this.page = 1;
    }
  }

  openEditarDetail(cliente: Cliente) {
    this.identificacion = cliente?.identificacion;
    this.clienteSeleccionado = cliente;
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
          this.clienteService.eliminarClientePorId(persona.codigo).subscribe({
            next: (response) => {
              this.listarClientePorPersonaIdentificacion();
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

  closeDetail($event) {
    this.showDetail = $event;
    this.clienteSeleccionado = null;
  }

  // Contar los caracteres de la cedula para activar boton <Buscar>
  blurIdentificacion(event) {
    //if (event.target.value.length != 10) {
    //  this.resetTheForm();
    //} else {
      this.listarClientePorPersonaIdentificacion();    
    //}
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

  /* Variables del html, para receptar datos y validaciones*/
  get identificacionField() {
    return this.formClienteIdentificacion.get('identificacion');
  }
  get nombreField() {
    return this.formClienteIdentificacion.get('nombre');
  }

}
