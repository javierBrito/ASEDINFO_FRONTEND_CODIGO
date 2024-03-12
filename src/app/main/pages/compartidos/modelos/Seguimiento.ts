
import { get, set } from 'lodash-es';
import { Iseguimiento } from '../interfaces/Iseguimiento';
export class Seguimiento implements Iseguimiento {

    constructor(data) {
        set(this, 'data', data);
    }

    get codigo(): number {
        return get(this, 'data.codigo');
    }
    set codigo(value: number) {
        set(this, 'data.codigo', value);
    }
    get descripcion(): string {
        return get(this, 'data.descripcion');
    }
    set descripcion(value: string) {
        set(this, 'data.descripcion', value);
    }
    get estado(): string {
        return get(this, 'data.estado');
    }
    set estado(value: string) {
        set(this, 'data.estado', value);
    }
    get asignado(): boolean {
        return get(this, 'data.asignado');
    }
    set asignado(value: boolean) {
        set(this, 'data.asignado', value);
    }

}
