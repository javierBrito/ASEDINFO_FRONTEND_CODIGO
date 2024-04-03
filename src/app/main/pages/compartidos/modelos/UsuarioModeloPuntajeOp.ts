
import { get, set } from 'lodash-es';
import { IusuarioModeloPuntajeOp } from '../interfaces/IusuarioModeloPuntajeOp';

export class UsuarioModeloPuntajeOp implements IusuarioModeloPuntajeOp {
    get codigo(): number {
        return get(this, 'data.codigo');
    }
    set codigo(value: number) {
        set(this, 'data.codigo', value);
    }
    get codModeloPuntaje(): number {
        return get(this, 'data.codModeloPuntaje');
    }
    set codModeloPuntaje(value: number) {
        set(this, 'data.codModeloPuntaje', value);
    }
    get codUsuario(): number {
        return get(this, 'data.codUsuario');
    }
    set codUsuario(value: number) {
        set(this, 'data.codUsuario', value);
    }
    get estado(): string {
        return get(this, 'data.estado');
    }
    set estado(value: string) {
        set(this, 'data.estado', value);
    }
}
