import type { Unidad } from "../types/Weather.ts";
import { leerEstado, escribirEstado } from "./dataFile.ts";

export interface Ajustes {
  ciudadDefaultId: number | null;
  unidad: Unidad;
}

export async function cargarAjustes(): Promise<Ajustes> {
  const estado = await leerEstado();
  return { ciudadDefaultId: estado.ciudadDefaultId, unidad: estado.unidad };
}

export async function guardarAjustes(ajustes: Ajustes): Promise<void> {
  const estado = await leerEstado();
  await escribirEstado({ ...estado, ...ajustes });
}
