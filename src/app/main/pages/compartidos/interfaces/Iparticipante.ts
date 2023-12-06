export interface Iparticipante {
    codigo?: number;
    codPersona?: number;
    codSubcategoria?: number;
    codInstancia?: number;
    dateRegistered?: string;
    username?: string;

    customerId: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    
    desSubcategoria: string;
    desInstancia: string;
    
    persona: any;
    nombrePersona: string;
}