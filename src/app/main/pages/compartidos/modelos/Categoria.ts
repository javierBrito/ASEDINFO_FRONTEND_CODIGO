
import { get, set } from 'lodash-es';
import { Icategoria } from '../interfaces/Icategoria';
export class Categoria implements Icategoria {

    constructor(data) {
        set(this, 'data', data);
    }

    get codigo(): number {
        return get(this, 'data.codigo');
    }
    set codigo(value: number) {
        set(this, 'data.codigo', value);
    }
    get denominacion(): string {
        return get(this, 'data.denominacion');
    }
    set denominacion(value: string) {
        set(this, 'data.denominacion', value);
    }
    get estado(): string {
        return get(this, 'data.estado');
    }
    set estado(value: string) {
        set(this, 'data.estado', value);
    }
    get edadMinima(): number {
        return get(this, 'data.edadMinima');
    }
    set edadMinima(value: number) {
        set(this, 'data.edadMinima', value);
    }
    get edadMaxima(): number {
        return get(this, 'data.edadMaxima');
    }
    set edadMaxima(value: number) {
        set(this, 'data.edadMaxima', value);
    }
}
