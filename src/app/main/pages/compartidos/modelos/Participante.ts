
import { get, set } from 'lodash-es';
import { Iparticipante } from '../interfaces/Iparticipante';

export class Participante implements Iparticipante {

    constructor(data) {
        set(this, 'data', data);
    }

    get codigo(): number {
        return get(this, 'data.codigo');
    }
    set codigo(value: number) {
        set(this, 'data.codigo', value);
    }

    get username(): string {
        return get(this, 'data.username');
    }
    set username(value: string) {
        set(this, 'data.username', value);
    }

    get dateRegistered(): string {
        return get(this, 'data.dateRegistered');
    }
    set dateRegistered(value: string) {
        set(this, 'data.dateRegistered', value);
    }

    get codPersona(): number {
        return get(this, 'data.codPersona');
    }
    set codPersona(value: number) {
        set(this, 'data.codPersona', value);
    }

    get persona(): any {
        return get(this, 'data.persona');
    }
    set persona(value: any) {
        set(this, 'data.persona', value);
    }

}
