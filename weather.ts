import type { Unidad } from "./types.ts";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export interface TemperaturaActual {
  valor: number;
  simbolo: string;
}

interface RespuestaForecast {
  current?: {
    temperature_2m?: number;
  };
  current_units?: {
    temperature_2m?: string;
  };
}

export async function obtenerTemperatura(
  lat: number,
  lon: number,
  unidad: Unidad,
): Promise<TemperaturaActual> {
  const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m&temperature_unit=${unidad}`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`);
  }
  const datos = (await respuesta.json()) as RespuestaForecast;
  const valor = datos.current?.temperature_2m;
  const simbolo = datos.current_units?.temperature_2m;
  if (valor === undefined || simbolo === undefined) {
    throw new Error("respuesta inesperada de OpenMeteo");
  }
  return { valor, simbolo };
}
