import { stdin, stdout } from "node:process";
import type { Ciudad } from "../types/City.ts";
import { rojo } from "../utils/colors.ts";
import { imprimirLista } from "./output.ts";

const cola: string[] = [];
const esperando: ((linea: string | null) => void)[] = [];
let pendiente = "";
let eof = false;

function entregar(linea: string): void {
  const resolver = esperando.shift();
  if (resolver) resolver(linea);
  else cola.push(linea);
}

stdin.setEncoding("utf8");
stdin.on("data", (chunk: string) => {
  let texto = String(chunk);
  let indice = texto.indexOf("\n");
  while (indice !== -1) {
    entregar(texto.slice(0, indice).replace(/\r$/, ""));
    texto = texto.slice(indice + 1);
    indice = texto.indexOf("\n");
  }
  if (texto.length > 0) {
    pendiente += texto;
  }
});
stdin.on("end", () => {
  eof = true;
  if (pendiente.length > 0) {
    entregar(pendiente);
    pendiente = "";
  }
  while (esperando.length > 0) {
    const resolver = esperando.shift();
    resolver?.(null);
  }
});
stdin.on("error", () => {});

export class EntradaCerrada extends Error {}

async function siguienteLinea(): Promise<string | null> {
  const enCola = cola.shift();
  if (enCola !== undefined) {
    return enCola;
  }
  if (eof) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => esperando.push(resolve));
}

export async function preguntar(texto: string): Promise<string> {
  stdout.write(texto);
  const linea = await siguienteLinea();
  if (linea === null) {
    throw new EntradaCerrada();
  }
  return linea.trim();
}

export async function pausar(): Promise<void> {
  await preguntar("  Presiona Enter para continuar...");
}

export function cerrar(): void {
  stdin.destroy();
}

export async function elegirCiudad(
  ciudades: readonly Ciudad[],
  accion: string,
): Promise<number | null> {
  const respuesta = await preguntar(`  Número de la ciudad a ${accion} (0 para cancelar): `);
  const numero = Number(respuesta);
  if (!Number.isInteger(numero) || numero < 0 || numero > ciudades.length) {
    console.log(`  ${rojo("Entrada no válida.")}`);
    return null;
  }
  if (numero === 0) {
    return null;
  }
  return numero - 1;
}
