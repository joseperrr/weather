export interface Ciudad {
  id: number;
  nombre: string;
  lat: number;
  lon: number;
  pais: string;
  region: string;
}

export type Unidad = "celsius" | "fahrenheit";

export interface Estado {
  ciudades: Ciudad[];
  ciudadDefaultId: number | null;
  unidad: Unidad;
}
