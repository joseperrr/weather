import type { Ciudad } from "../types/City.ts";

export const FORMATO_FECHA = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

export function etiquetaCiudad(ciudad: Ciudad): string {
  const lugar = [ciudad.region, ciudad.pais].filter(Boolean).join(", ");
  return lugar ? `${ciudad.nombre} (${lugar})` : ciudad.nombre;
}
