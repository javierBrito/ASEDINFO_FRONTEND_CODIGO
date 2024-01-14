
import { get, set } from 'lodash-es';
import { Iintegrante } from '../interfaces/Iintegrante';
export class Integrante implements Iintegrante {
    get codigo(): number {
        return get(this, 'data.codigo');
    }
    set codigo(value: number) {
        set(this, 'data.codigo', value);
    }
    get nombre(): string {
        return get(this, 'data.nombre');
    }
    set nombre(value: string) {
        set(this, 'data.nombre', value);
    }
    get estado(): string {
        return get(this, 'data.estado');
    }
    set estado(value: string) {
        set(this, 'data.estado', value);
    }
    get codParticipante(): number {
        return get(this, 'data.codParticipante');
    }
    set codParticipante(value: number) {
        set(this, 'data.codParticipante', value);
    }
}
