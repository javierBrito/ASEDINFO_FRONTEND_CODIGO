export interface Iparticipante {
    codigo?: number;
    codPersona?: number;
    codSubcategoria?: number;
    dateRegistered?: string;
    username?: string;

    customerId: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    
    desSubcategoria: string;
    
    persona: any;
    nombrePersona: string;
}