// Controlador Alpine para mostrar el estado de la conexión a internet

export function conexionController(){
    return {
        enLinea: navigator.onLine,
        conectar(){
            this.enLinea = true;
        },
        desconectar(){
            this.enLinea = false;
        }
    };
}