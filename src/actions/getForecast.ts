import type { Estado } from "../types/State.ts";
import { obtenerPronostico } from "../api/weather.ts";
import { elegirCiudad } from "../presentation/input.ts";
import { mostrarError, mostrarPronostico, mensajeError } from "../presentation/output.ts";
import { listarCiudades } from "./listCities.ts";

export async function pronosticoCiudad(estado: Estado): Promise<void> {
  if (estado.ciudades.length === 0) {
    console.log("  No hay ciudades guardadas. Usa la opción 3 para agregar alguna.");
    return;
  }
  listarCiudades(estado.ciudades);
  const indice = await elegirCiudad(estado.ciudades, "ver pronóstico");
  if (indice === null) {
    return;
  }
  const ciudad = estado.ciudades[indice];
  if (!ciudad) {
    return;
  }
  try {
    const dias = await obtenerPronostico(ciudad.lat, ciudad.lon, estado.unidad);
    mostrarPronostico(ciudad, dias);
  } catch (error) {
    mostrarError(`No se pudo consultar el pronóstico de ${ciudad.nombre}: ${mensajeError(error)}`);
  }
}
