import type { Ciudad } from "../types/City.ts";
import type { PronosticoDia, TemperaturaActual } from "../types/Weather.ts";
import { amarillo, rojo, verde } from "../utils/colors.ts";
import { etiquetaCiudad, FORMATO_FECHA } from "../utils/format.ts";

export function mensajeError(error: unknown): string {
  return error instanceof Error ? error.message : "error desconocido";
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

export function mostrarPronostico(ciudad: Ciudad, dias: readonly PronosticoDia[]): void {
  console.log(`  Pronóstico de 7 días para ${etiquetaCiudad(ciudad)}:`);
  if (dias.length === 0) {
    console.log("  Sin datos de pronóstico.");
    return;
  }
  for (const dia of dias) {
    const fecha = FORMATO_FECHA.format(new Date(`${dia.fecha}T00:00:00Z`));
    const lectura = `${dia.min} – ${dia.max} ${dia.simbolo}`;
    console.log(`  ${fecha}  ${dia.descripcion.padEnd(28)} ${amarillo(lectura)}`);
  }
}

export function mostrarError(texto: string): void {
  console.log(`  ${rojo(`⚠ ${texto}`)}`);
}

export function exito(texto: string): void {
  console.log(`  ${verde(texto)}`);
}
