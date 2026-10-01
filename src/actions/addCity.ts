import type { Ciudad } from "../types/City.ts";
import type { Estado } from "../types/State.ts";
import { buscarCiudades } from "../api/geocoding.ts";
import { guardarCiudades } from "../storage/citiesStorage.ts";
import { elegirCiudad, preguntar } from "../presentation/input.ts";
import { exito, imprimirLista, mensajeError, mostrarError } from "../presentation/output.ts";
import { etiquetaCiudad } from "../utils/format.ts";

export async function buscarYAgregar(estado: Estado): Promise<Estado> {
  const nombre = await preguntar("  Nombre de la ciudad: ");
  if (!nombre) {
    console.log("  No se ingresó ningún nombre.");
    return estado;
  }
  let coincidencias: Ciudad[];
  try {
    coincidencias = await buscarCiudades(nombre, 5);
  } catch (error) {
    mostrarError(`No se pudo buscar la ciudad: ${mensajeError(error)}`);
    return estado;
  }
  if (coincidencias.length === 0) {
    console.log(`  No se encontraron ciudades con el nombre "${nombre}".`);
    return estado;
  }
  console.log(`  Resultados para "${nombre}":`);
  imprimirLista(coincidencias);
  const indice = await elegirCiudad(coincidencias, "agregar");
  if (indice === null) {
    return estado;
  }
  const ciudad = coincidencias[indice];
  if (!ciudad) {
    return estado;
  }
  if (estado.ciudades.some((c) => c.id === ciudad.id)) {
    console.log(`  ${ciudad.nombre} ya está en tu lista.`);
    return estado;
  }
  const nuevo: Estado = { ...estado, ciudades: [...estado.ciudades, ciudad] };
  await guardarCiudades(nuevo.ciudades);
  exito(`Ciudad agregada: ${etiquetaCiudad(ciudad)}`);
  return nuevo;
}
