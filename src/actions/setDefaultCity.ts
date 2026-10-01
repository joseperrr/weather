import type { Estado } from "../types/State.ts";
import { guardarAjustes } from "../storage/settingsStorage.ts";
import { elegirCiudad } from "../presentation/input.ts";
import { exito } from "../presentation/output.ts";
import { etiquetaCiudad } from "../utils/format.ts";
import { listarCiudades } from "./listCities.ts";

export async function establecerDefault(estado: Estado): Promise<Estado> {
  if (estado.ciudades.length === 0) {
    console.log("  No hay ciudades guardadas. Usa la opción 3 para agregar alguna.");
    return estado;
  }
  listarCiudades(estado.ciudades);
  const indice = await elegirCiudad(estado.ciudades, "establecer como default");
  if (indice === null) {
    return estado;
  }
  const ciudad = estado.ciudades[indice];
  if (!ciudad) {
    return estado;
  }
  const nuevo: Estado = { ...estado, ciudadDefaultId: ciudad.id };
  await guardarAjustes({ ciudadDefaultId: nuevo.ciudadDefaultId, unidad: nuevo.unidad });
  exito(`Ciudad default: ${etiquetaCiudad(ciudad)}`);
  return nuevo;
}
