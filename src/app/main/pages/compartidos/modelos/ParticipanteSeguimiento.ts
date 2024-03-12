
import { get, set } from 'lodash-es';
import { IparticipanteSeguimiento } from '../interfaces/IparticipanteSeguimiento';

export class ParticipanteSeguimiento implements IparticipanteSeguimiento {
    get codigo(): number {
        return get(this, 'data.codigo');
    }
    set codigo(value: number) {
        set(this, 'data.codigo', value);
    }
    get codSeguimiento(): number {
        return get(this, 'data.codSeguimiento');
    }
    set codSeguimiento(value: number) {
        set(this, 'data.codSeguimiento', value);
    }
    get codParticipante(): number {
        return get(this, 'data.codParticipante');
    }
    set codParticipante(value: number) {
        set(this, 'data.codParticipante', value);
    }
    get estado(): string {
        return get(this, 'data.estado');
    }
    set estado(value: string) {
        set(this, 'data.estado', value);
    }
}
