
import { get, set } from 'lodash-es';
import { Isubcategoria } from '../interfaces/Isubcategoria';
export class Subcategoria implements Isubcategoria {
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
    get codCategoria(): number {
        return get(this, 'data.codCategoria');
    }
    set codCategoria(value: number) {
        set(this, 'data.codCategoria', value);
    }
    get desCategoria(): string {
        return get(this, 'data.desCategoria');
    }
    set desCategoria(value: string) {
        set(this, 'data.desCategoria', value);
    }
    get categoria(): any {
        return get(this, 'data.categoria');
    }
    set categoria(value: any) {
        set(this, 'data.categoria', value);
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

    get numJueces(): number {
        return get(this, 'data.numJueces');
    }
    set numJueces(value: number) {
        set(this, 'data.numJueces', value);
    }

}
