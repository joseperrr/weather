import type { Ciudad } from "../types/City.ts";
import { imprimirLista } from "../presentation/output.ts";

export function listarCiudades(ciudades: readonly Ciudad[]): void {
  console.log("  Ciudades guardadas:");
  imprimirLista(ciudades);
}
