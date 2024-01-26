export interface Icliente {
    codigo?: number;
    codPersona?: number;
    fechaInicio?: string;
    tipoCliente?: string;
    estado?: string;
    
    persona: any;
    nombrePersona: string;
    celular: string;
    prefijoTelefonico: string;
    correo: string;
    nombres: string;
    apellidos: string;
    identificacion: string;
    direccion: string;
    fechaNacimiento: string;
}