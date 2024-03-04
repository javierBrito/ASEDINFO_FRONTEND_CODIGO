import { set, get } from 'lodash-es';
import { IusuarioWPDTO } from '../interfaces/IusuarioWPDTO';

export class UsuarioWPDTO implements IusuarioWPDTO {
    constructor(data) {
        set(this, 'data', data);
    }
    get username(): string {
        return get(this, 'data.username');
    }
    set username(value: string) {
        set(this, 'data.username', value);
    }
    get firstname(): string {
        return get(this, 'data.firstname');
    }
    set firstname(value: string) {
        set(this, 'data.firstname', value);
    }
    get lastname(): string {
        return get(this, 'data.lastname');
    }
    set lastname(value: string) {
        set(this, 'data.lastname', value);
    }
    get email(): string {
        return get(this, 'data.email');
    }
    set email(value: string) {
        set(this, 'data.email', value);
    }
    get dateLastActive(): string {
        return get(this, 'data.dateLastActive');
    }
    set dateLastActive(value: string) {
        set(this, 'data.dateLastActive', value);
    }
    get dateRegistered(): string {
        return get(this, 'data.dateRegistered');
    }
    set dateRegistered(value: string) {
        set(this, 'data.dateRegistered', value);
    }
}
