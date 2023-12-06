
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

    get nombrePersona(): string {
        return get(this, 'data.nombrePersona');
    }
    set nombrePersona(value: string) {
        set(this, 'data.nombrePersona', value);
    }

    get persona(): any {
        return get(this, 'data.persona');
    }
    set persona(value: any) {
        set(this, 'data.persona', value);
    }
    get desSubcategoria(): string {
        return get(this, 'data.desSubcategoria');
    }
    set desSubcategoria(value: string) {
        set(this, 'data.desSubcategoria', value);
    }
    
    get codSubcategoria(): number {
        return get(this, 'data.codSubcategoria');
    }
    set codSubcategoria(value: number) {
        set(this, 'data.codSubcategoria', value);
    }
    
    get customerId(): number {
        return get(this, 'data.customerId');
    }
    set customerId(value: number) {
        set(this, 'data.customerId', value);
    }
    get userId(): number {
        return get(this, 'data.userId');
    }
    set userId(value: number) {
        set(this, 'data.userId', value);
    }
    get firstName(): string {
        return get(this, 'data.firstName');
    }
    set firstName(value: string) {
        set(this, 'data.firstName', value);
    }
    get lastName(): string {
        return get(this, 'data.lastName');
    }
    set lastName(value: string) {
        set(this, 'data.lastName', value);
    }
    get email(): string {
        return get(this, 'data.email');
    }
    set email(value: string) {
        set(this, 'data.email', value);
    }
    get codInstancia(): number {
        return get(this, 'data.codInstancia');
    }
    set codInstancia(value: number) {
        set(this, 'data.codInstancia', value);
    }
    get desInstancia(): string {
        return get(this, 'data.desInstancia');
    }
    set desInstancia(value: string) {
        set(this, 'data.desInstancia', value);
    }
}
