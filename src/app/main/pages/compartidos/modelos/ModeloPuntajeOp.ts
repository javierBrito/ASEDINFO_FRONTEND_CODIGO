
import { get, set } from 'lodash-es';
import { ImodeloPuntajeOp } from '../interfaces/ImodeloPuntajeOp';

export class ModeloPuntajeOp implements ImodeloPuntajeOp {

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
    get asignado(): boolean {
        return get(this, 'data.asignado');
    }
    set asignado(value: boolean) {
        set(this, 'data.asignado', value);
    }

}
