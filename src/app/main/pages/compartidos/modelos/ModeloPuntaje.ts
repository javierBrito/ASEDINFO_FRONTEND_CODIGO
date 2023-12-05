
import { get, set } from 'lodash-es';
import { ImodeloPuntaje } from '../interfaces/ImodeloPuntaje';
export class ModeloPuntaje implements ImodeloPuntaje {

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
    get porcentaje(): number {
        return get(this, 'data.porcentaje');
    }
    set porcentaje(value: number) {
        set(this, 'data.porcentaje', value);
    }
    get estado(): string {
        return get(this, 'data.estado');
    }
    set estado(value: string) {
        set(this, 'data.estado', value);
    }

}
