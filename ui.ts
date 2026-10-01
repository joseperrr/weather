import { stdin, stdout } from "node:process";
import type { Ciudad, Estado } from "./types.ts";
import type { TemperaturaActual } from "./weather.ts";

const SEPARADOR = "═".repeat(40);

const COLORES_ACTIVOS = stdout.isTTY === true && process.env["NO_COLOR"] === undefined;

function pintar(codigo: string, texto: string): string {
  return COLORES_ACTIVOS ? `\x1b[${codigo}m${texto}\x1b[0m` : texto;
}

export const cian = (texto: string): string => pintar("36", texto);
export const amarillo = (texto: string): string => pintar("33", texto);
export const verde = (texto: string): string => pintar("32", texto);
export const rojo = (texto: string): string => pintar("31", texto);

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

export function dibujarMenu(estado: Estado): void {
  const simbolo = estado.unidad === "celsius" ? "°C" : "°F";
  console.log(cian(SEPARADOR));
  console.log(cian("         WEATHER CLI"));
  console.log(cian(SEPARADOR));
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${estado.ciudades.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes (${simbolo})`);
  console.log("  9. Salir");
  console.log(cian(SEPARADOR));
}

export function etiquetaCiudad(ciudad: Ciudad): string {
  const lugar = [ciudad.region, ciudad.pais].filter(Boolean).join(", ");
  return lugar ? `${ciudad.nombre} (${lugar})` : ciudad.nombre;
}

export function imprimirLista(ciudades: readonly Ciudad[]): void {
  ciudades.forEach((ciudad, indice) => {
    console.log(`  ${indice + 1}. ${etiquetaCiudad(ciudad)}`);
  });
}

export function mostrarTemperatura(ciudad: Ciudad, temperatura: TemperaturaActual): void {
  const lectura = `${temperatura.valor} ${temperatura.simbolo}`;
  console.log(`  ${etiquetaCiudad(ciudad)}: ${amarillo(lectura)}`);
}

export async function elegirCiudad(
  ciudades: readonly Ciudad[],
  accion: string,
): Promise<number | null> {
  imprimirLista(ciudades);
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

export function mostrarError(texto: string): void {
  console.log(`  ${rojo(`⚠ ${texto}`)}`);
}

export function exito(texto: string): void {
  console.log(`  ${verde(texto)}`);
}
