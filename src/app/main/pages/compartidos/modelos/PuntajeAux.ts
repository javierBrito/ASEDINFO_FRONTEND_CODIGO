import { IpuntajeAux } from "../interfaces/IpuntajeAux";
import { get, set } from 'lodash-es';
export class PuntajeAux implements IpuntajeAux {
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
    get codInstancia(): number {
        return get(this, 'data.codInstancia');
    }
    set codInstancia(value: number) {
        set(this, 'data.codInstancia', value);
    }
    get codParticipante(): number {
        return get(this, 'data.codParticipante');
    }
    set codParticipante(value: number) {
        set(this, 'data.codParticipante', value);
    }
    get codSubcategoria(): number {
        return get(this, 'data.codSubcategoria');
    }
    set codSubcategoria(value: number) {
        set(this, 'data.codSubcategoria', value);
    }
    get puntaje(): number {
        return get(this, 'data.puntaje');
    }
    set puntaje(value: number) {
        set(this, 'data.puntaje', value);
    }
    get estado(): string {
        return get(this, 'data.estado');
    }
    set estado(value: string) {
        set(this, 'data.estado', value);
    }
    get porcentaje(): number {
        return get(this, 'data.porcentaje');
    }
    set porcentaje(value: number) {
        set(this, 'data.porcentaje', value);
    }
    get nombreParticipante(): string {
        return get(this, 'data.nombreParticipante');
    }
    set nombreParticipante(value: string) {
        set(this, 'data.nombreParticipante', value);
    }
    
    get codUsuarioJuez(): number {
        return get(this, 'data.codUsuarioJuez');
    }
    set codUsuarioJuez(value: number) {
        set(this, 'data.codUsuarioJuez', value);
    }

}