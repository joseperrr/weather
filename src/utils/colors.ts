import { stdout } from "node:process";

const COLORES_ACTIVOS = stdout.isTTY === true && process.env["NO_COLOR"] === undefined;

function pintar(codigo: string, texto: string): string {
  return COLORES_ACTIVOS ? `\x1b[${codigo}m${texto}\x1b[0m` : texto;
}

export const cian = (texto: string): string => pintar("36", texto);
export const amarillo = (texto: string): string => pintar("33", texto);
export const verde = (texto: string): string => pintar("32", texto);
export const rojo = (texto: string): string => pintar("31", texto);
