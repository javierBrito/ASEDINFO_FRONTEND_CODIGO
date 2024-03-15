
import { get, set } from 'lodash-es';
import { IcuentaClave } from '../interfaces/IcuentaClave';
export class CuentaClave implements IcuentaClave {
    get codigo(): number {
        return get(this, 'data.codigo');
    }
    set codigo(value: number) {
        set(this, 'data.codigo', value);
    }
    get cuenta(): string {
        return get(this, 'data.cuenta');
    }
    set cuenta(value: string) {
        set(this, 'data.cuenta', value);
    }
    get clave(): string {
        return get(this, 'data.clave');
    }
    set clave(value: string) {
        set(this, 'data.clave', value);
    }
    get estado(): string {
        return get(this, 'data.estado');
    }
    set estado(value: string) {
        set(this, 'data.estado', value);
    }
    get codTransaccion(): number {
        return get(this, 'data.codTransaccion');
    }
    set codTransaccion(value: number) {
        set(this, 'data.codTransaccion', value);
    }
}
