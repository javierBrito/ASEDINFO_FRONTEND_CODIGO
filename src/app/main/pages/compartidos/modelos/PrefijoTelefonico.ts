
import { get, set } from 'lodash-es';
import { IprefijoTelefonico } from '../interfaces/IprefijoTelefonico';
export class PrefijoTelefonico implements IprefijoTelefonico {

    constructor(data) {
        set(this, 'data', data);
    }

    get codigo(): string {
        return get(this, 'data.codigo');
    }
    set codigo(value: string) {
        set(this, 'data.codigo', value);
    }
    get nombrePais(): string {
        return get(this, 'data.nombrePais');
    }
    set nombrePais(value: string) {
        set(this, 'data.nombrePais', value);
    }
}
