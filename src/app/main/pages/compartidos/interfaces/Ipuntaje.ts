export interface Ipuntaje {
    codigo: number,
    codModeloPuntaje: number,
    codInstancia: number,
    codParticipante: number,
    codSubcategoria: number,
    codUsuarioJuez: number,
    puntaje: number,
    estado: string,

    nombreParticipante: string;
    pathImagenTrofeo: string;
}