
import { get, set } from 'lodash-es';
import { Iinstancia } from '../interfaces/Iinstancia';
export class Instancia implements Iinstancia {

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

}
