import type { Ciudad } from "./types.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

interface RespuestaGeocoding {
  results?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
  }[];
}

export async function buscarCiudades(nombre: string, cantidad = 5): Promise<Ciudad[]> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(nombre)}&count=${cantidad}&language=es&format=json`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`);
  }
  const datos = (await respuesta.json()) as RespuestaGeocoding;
  return (datos.results ?? []).map((resultado) => ({
    id: resultado.id,
    nombre: resultado.name,
    lat: resultado.latitude,
    lon: resultado.longitude,
    pais: resultado.country ?? "",
    region: resultado.admin1 ?? "",
  }));
}
