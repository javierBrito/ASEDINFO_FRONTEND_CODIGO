
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

    get dateLastActive(): string {
        return get(this, 'data.dateLastActive');
    }
    set dateLastActive(value: string) {
        set(this, 'data.dateLastActive', value);
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

    get nombreEscuela(): string {
        return get(this, 'data.nombreEscuela');
    }
    set nombreEscuela(value: string) {
        set(this, 'data.nombreEscuela', value);
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
    get desCategoria(): string {
        return get(this, 'data.desCategoria');
    }
    set desCategoria(value: string) {
        set(this, 'data.desCategoria', value);
    }

    get codSubcategoria(): number {
        return get(this, 'data.codSubcategoria');
    }
    set codSubcategoria(value: number) {
        set(this, 'data.codSubcategoria', value);
    }

    get codCategoria(): number {
        return get(this, 'data.codCategoria');
    }
    set codCategoria(value: number) {
        set(this, 'data.codCategoria', value);
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
    get country(): string {
        return get(this, 'data.country');
    }
    set country(value: string) {
        set(this, 'data.country', value);
    }
    get city(): string {
        return get(this, 'data.city');
    }
    set city(value: string) {
        set(this, 'data.city', value);
    }
    get postcode(): string {
        return get(this, 'data.postcode');
    }
    set postcode(value: string) {
        set(this, 'data.postcode', value);
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
    get celular(): string {
        return get(this, 'data.celular');
    }
    set celular(value: string) {
        set(this, 'data.celular', value);
    }

    get codEstadoCompetencia(): number {
        return get(this, 'data.codEstadoCompetencia');
    }
    set codEstadoCompetencia(value: number) {
        set(this, 'data.codEstadoCompetencia', value);
    }

    get desEstadoCompetencia(): string {
        return get(this, 'data.desEstadoCompetencia');
    }
    set desEstadoCompetencia(value: string) {
        set(this, 'data.desEstadoCompetencia', value);
    }

    get numPuntajeJuez(): number {
        return get(this, 'data.numPuntajeJuez');
    }
    set numPuntajeJuez(value: number) {
        set(this, 'data.numPuntajeJuez', value);
    }

    get numParticipante(): number {
        return get(this, 'data.numParticipante');
    }
    set numParticipante(value: number) {
        set(this, 'data.numParticipante', value);
    }

    get numJueces(): number {
        return get(this, 'data.numJueces');
    }
    set numJueces(value: number) {
        set(this, 'data.numJueces', value);
    }

    get colorBoton(): string {
        return get(this, 'data.colorBoton');
    }
    set colorBoton(value: string) {
        set(this, 'data.colorBoton', value);
    }

    get estadoCompetencia(): any {
        return get(this, 'data.estadoCompetencia');
    }
    set estadoCompetencia(value: any) {
        set(this, 'data.estadoCompetencia', value);
    }

    get correo(): string {
        return get(this, 'data.correo');
    }
    set correo(value: string) {
        set(this, 'data.correo', value);
    }

    get nombres(): string {
        return get(this, 'data.nombres');
    }
    set nombres(value: string) {
        set(this, 'data.nombres', value);
    }

    get apellidos(): string {
        return get(this, 'data.apellidos');
    }
    set apellidos(value: string) {
        set(this, 'data.apellidos', value);
    }

    get identificacion(): string {
        return get(this, 'data.identificacion');
    }
    set identificacion(value: string) {
        set(this, 'data.identificacion', value);
    }

    get fechaNacimiento(): string {
        return get(this, 'data.fechaNacimiento');
    }
    set fechaNacimiento(value: string) {
        set(this, 'data.fechaNacimiento', value);
    }

    get nombreCancion(): string {
        return get(this, 'data.nombreCancion');
    }
    set nombreCancion(value: string) {
        set(this, 'data.nombreCancion', value);
    }

    get displayNoneGrupo(): string {
        return get(this, 'data.displayNoneGrupo');
    }
    set displayNoneGrupo(value: string) {
        set(this, 'data.displayNoneGrupo', value);
    }

    get prefijoTelefonico(): string {
        return get(this, 'data.prefijoTelefonico');
    }
    set prefijoTelefonico(value: string) {
        set(this, 'data.prefijoTelefonico', value);
    }

    get estado(): string {
        return get(this, 'data.estado');
    }
    set estado(value: string) {
        set(this, 'data.estado', value);
    }

    get nombrePareja(): string {
        return get(this, 'data.nombrePareja');
    }
    set nombrePareja(value: string) {
        set(this, 'data.nombrePareja', value);
    }
}
