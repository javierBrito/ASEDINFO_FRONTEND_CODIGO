export interface Itransaccion {
    codigo?: number;
    codCliente?: number;
    codPersona?: number;
    codModulo?: number;
    codOperacion?: number;
    descripcion?: string;
    claveCuenta?: string;
    precio?: number;
    monto?: number;
    numProducto?: number;
    numExistenciaActual?: number;
    numMes?: number;
    numDiasExtra?: number;
    fechaInicio?: string;
    fechaFin?: string;
    fechaRegistra?: string;
    fechaCambia?: string;
    estado?: string;

    cliente?: any,
    producto?: any,
    modulo?: any,
    operacion?: any,
    colorFila?: string;
    visibleBoton?: string;
    colorColumna?: string;
    descripcionProducto?: string;
    precioCosto?: number;
    precioMayoreo?: number;
    nombreCliente?: string;
    prefijoTelefonico?: string;
    celular?: string;
    numDiasRenovar: number;
}