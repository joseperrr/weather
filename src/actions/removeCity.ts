import type { Estado } from "../types/State.ts";
import { guardarCiudades } from "../storage/citiesStorage.ts";
import { guardarAjustes } from "../storage/settingsStorage.ts";
import { elegirCiudad } from "../presentation/input.ts";
import { exito } from "../presentation/output.ts";
import { etiquetaCiudad } from "../utils/format.ts";
import { listarCiudades } from "./listCities.ts";

export async function eliminarCiudad(estado: Estado): Promise<Estado> {
  if (estado.ciudades.length === 0) {
    console.log("  No hay ciudades guardadas. Usa la opción 3 para agregar alguna.");
    return estado;
  }
  listarCiudades(estado.ciudades);
  const indice = await elegirCiudad(estado.ciudades, "eliminar");
  if (indice === null) {
    return estado;
  }
  const ciudad = estado.ciudades[indice];
  if (!ciudad) {
    return estado;
  }
  const nuevo: Estado = {
    ...estado,
    ciudades: estado.ciudades.filter((c) => c.id !== ciudad.id),
    ciudadDefaultId: estado.ciudadDefaultId === ciudad.id ? null : estado.ciudadDefaultId,
  };
  await guardarCiudades(nuevo.ciudades);
  if (estado.ciudadDefaultId === ciudad.id) {
    await guardarAjustes({ ciudadDefaultId: null, unidad: nuevo.unidad });
  }
  exito(`Ciudad eliminada: ${etiquetaCiudad(ciudad)}`);
  return nuevo;
}
