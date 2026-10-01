import type { Estado } from "../types/State.ts";

export function alternarUnidad(estado: Estado): Estado {
  return { ...estado, unidad: estado.unidad === "celsius" ? "fahrenheit" : "celsius" };
}
