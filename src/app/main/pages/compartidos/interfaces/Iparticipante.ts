export interface Iparticipante {
    codigo?: number;
    codPersona?: number;
    codSubcategoria?: number;
    codCategoria?: number;
    codInstancia?: number;
    codEstadoCompetencia?: number;
    dateRegistered?: string;
    dateLastActive?: string;
    username?: string;
    desEstadoCompetencia?: string;
    numPuntajeJuez?: number;
    numParticipante?: number;
    nombreCancion?: string;
    numJueces: number;
    nombreEscuela: string;
    nombrePareja: string;
    estado: string;

    customerId: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    city: string;
    postcode: string;
    
    desCategoria: string;
    desSubcategoria: string;
    desInstancia: string;
    
    persona: any;
    nombrePersona: string;
    celular: string;
    correo: string;
    nombres: string;
    apellidos: string;
    identificacion: string;
    fechaNacimiento: string;
    prefijoTelefonico: string;

    estadoCompetencia: any;

    colorBoton: string;
    displayNoneGrupo: string;
}