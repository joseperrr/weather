import type { Ciudad } from "./City.ts";
import type { Unidad } from "./Weather.ts";

export interface Estado {
  ciudades: Ciudad[];
  ciudadDefaultId: number | null;
  unidad: Unidad;
}
