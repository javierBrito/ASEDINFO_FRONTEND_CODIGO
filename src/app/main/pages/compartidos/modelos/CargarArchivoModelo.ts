import { get, set } from 'lodash-es';
import { IcargarArchivoModelo } from '../interfaces/IcargarArchivoModelo';

export class CargarArchivoModelo implements IcargarArchivoModelo {
    constructor(data) {
        set(this, 'data', data);
    }

    get nombre(): string {
        return get(this, 'data.nombre');
    }
    set nombre(value: string) {
        set(this, 'data.nombre', value);
    }
    get url(): string {
        return get(this, 'data.url');
    }
    set url(value: string) {
        set(this, 'data.url', value);
    }

}
