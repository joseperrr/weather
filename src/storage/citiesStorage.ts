import type { Ciudad } from "../types/City.ts";
import { leerEstado, escribirEstado } from "./dataFile.ts";

export async function cargarCiudades(): Promise<Ciudad[]> {
  return (await leerEstado()).ciudades;
}

export async function guardarCiudades(ciudades: Ciudad[]): Promise<void> {
  const estado = await leerEstado();
  await escribirEstado({ ...estado, ciudades });
}
