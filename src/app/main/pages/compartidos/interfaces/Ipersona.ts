export interface Ipersona {
    codigo?: number;
    identificacion?: string;
    cedula?: string;
    nombres?: string;
    apellidos?: string;
    fechaNacimiento: string;
    direccion?: string;
    celular?: string;
    prefijoTelefonico: string;
    correo?: string;
    estado?: string;

    cliente: any;
    usuario: any;
    socio: any;  
    participante: any;  
}