import type { Ciudad } from "../types/City.ts";
import type { Estado } from "../types/State.ts";
import { obtenerTemperatura } from "../api/weather.ts";
import { mostrarError, mostrarTemperatura, mensajeError } from "../presentation/output.ts";

async function consultarYMostrar(ciudad: Ciudad, estado: Estado): Promise<void> {
  try {
    const temperatura = await obtenerTemperatura(ciudad.lat, ciudad.lon, estado.unidad);
    mostrarTemperatura(ciudad, temperatura);
  } catch (error) {
    mostrarError(`No se pudo consultar el clima de ${ciudad.nombre}: ${mensajeError(error)}`);
  }
}

export async function climaDefault(estado: Estado): Promise<void> {
  const ciudad = estado.ciudades.find((c) => c.id === estado.ciudadDefaultId);
  if (!ciudad) {
    console.log("  No hay ciudad default. Usa la opción 5 para establecerla.");
    return;
  }
  await consultarYMostrar(ciudad, estado);
}

export async function climaTodas(estado: Estado): Promise<void> {
  if (estado.ciudades.length === 0) {
    console.log("  No hay ciudades guardadas. Usa la opción 3 para agregar alguna.");
    return;
  }
  for (const ciudad of estado.ciudades) {
    await consultarYMostrar(ciudad, estado);
  }
}
