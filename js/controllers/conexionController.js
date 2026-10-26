// Controlador Alpine para mostrar el estado de la conexión a internet

export function conexionController(){
    return {
        enLinea: navigator.online,
        conectar(){
            this.enLinea = true;
        },
        desconectar(){
            this.enLinea = false;
        }
    };
}