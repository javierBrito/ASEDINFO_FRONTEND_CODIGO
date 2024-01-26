
import { get, set } from 'lodash-es';
import { Icliente } from '../interfaces/Icliente';

export class Cliente implements Icliente {

    constructor(data) {
        set(this, 'data', data);
    }

    get codigo(): number {
        return get(this, 'data.codigo');
    }
    set codigo(value: number) {
        set(this, 'data.codigo', value);
    }

    get tipoCliente(): string {
        return get(this, 'data.tipoCliente');
    }
    set tipoCliente(value: string) {
        set(this, 'data.tipoCliente', value);
    }

    get estado(): string {
        return get(this, 'data.estado');
    }
    set estado(value: string) {
        set(this, 'data.estado', value);
    }

    get fechaInicio(): string {
        return get(this, 'data.fechaInicio');
    }
    set fechaInicio(value: string) {
        set(this, 'data.fechaInicio', value);
    }

    get codPersona(): number {
        return get(this, 'data.codPersona');
    }
    set codUscodPersonauario(value: number) {
        set(this, 'data.codPersona', value);
    }

    get persona(): any {
        return get(this, 'data.persona');
    }
    set persona(value: any) {
        set(this, 'data.persona', value);
    }

    get correo(): string {
        return get(this, 'data.correo');
    }
    set correo(value: string) {
        set(this, 'data.correo', value);
    }    

    get nombres(): string {
        return get(this, 'data.nombres');
    }
    set nombres(value: string) {
        set(this, 'data.nombres', value);
    }    

    get apellidos(): string {
        return get(this, 'data.apellidos');
    }
    set apellidos(value: string) {
        set(this, 'data.apellidos', value);
    }    

    get identificacion(): string {
        return get(this, 'data.identificacion');
    }
    set identificacion(value: string) {
        set(this, 'data.identificacion', value);
    }    

    get prefijoTelefonico(): string {
        return get(this, 'data.prefijoTelefonico');
    }
    set prefijoTelefonico(value: string) {
        set(this, 'data.prefijoTelefonico', value);
    }
    get celular(): string {
        return get(this, 'data.celular');
    }
    set celular(value: string) {
        set(this, 'data.celular', value);
    }

    get nombrePersona(): string {
        return get(this, 'data.nombrePersona');
    }
    set nombrePersona(value: string) {
        set(this, 'data.nombrePersona', value);
    }

    get direccion(): string {
        return get(this, 'data.direccion');
    }
    set direccion(value: string) {
        set(this, 'data.direccion', value);
    }

    get fechaNacimiento(): string {
        return get(this, 'data.fechaNacimiento');
    }
    set fechaNacimiento(value: string) {
        set(this, 'data.fechaNacimiento', value);
    }
}
