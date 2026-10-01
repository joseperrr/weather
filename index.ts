import type { Ciudad, Estado } from "./types.ts";
import { buscarCiudades } from "./geocoding.ts";
import { obtenerPronostico, obtenerTemperatura } from "./weather.ts";
import { cargarEstado, guardarEstado } from "./storage.ts";
import {
  EntradaCerrada,
  cerrar,
  dibujarMenu,
  elegirCiudad,
  etiquetaCiudad,
  exito,
  mostrarError,
  mostrarPronostico,
  mostrarTemperatura,
  pausar,
  preguntar,
  rojo,
} from "./ui.ts";

function mensajeError(error: unknown): string {
  return error instanceof Error ? error.message : "error desconocido";
}

async function consultarYMostrar(ciudad: Ciudad, estado: Estado): Promise<void> {
  try {
    const temperatura = await obtenerTemperatura(ciudad.lat, ciudad.lon, estado.unidad);
    mostrarTemperatura(ciudad, temperatura);
  } catch (error) {
    mostrarError(`No se pudo consultar el clima de ${ciudad.nombre}: ${mensajeError(error)}`);
  }
}

async function climaDefault(estado: Estado): Promise<void> {
  const ciudad = estado.ciudades.find((c) => c.id === estado.ciudadDefaultId);
  if (!ciudad) {
    console.log("  No hay ciudad default. Usa la opción 5 para establecerla.");
    return;
  }
  await consultarYMostrar(ciudad, estado);
}

async function climaTodas(estado: Estado): Promise<void> {
  if (estado.ciudades.length === 0) {
    console.log("  No hay ciudades guardadas. Usa la opción 3 para agregar alguna.");
    return;
  }
  for (const ciudad of estado.ciudades) {
    await consultarYMostrar(ciudad, estado);
  }
}

async function pronosticoCiudad(estado: Estado): Promise<void> {
  if (estado.ciudades.length === 0) {
    console.log("  No hay ciudades guardadas. Usa la opción 3 para agregar alguna.");
    return;
  }
  console.log("  Ciudades guardadas:");
  const indice = await elegirCiudad(estado.ciudades, "ver pronóstico");
  if (indice === null) {
    return;
  }
  const ciudad = estado.ciudades[indice];
  if (!ciudad) {
    return;
  }
  try {
    const dias = await obtenerPronostico(ciudad.lat, ciudad.lon, estado.unidad);
    mostrarPronostico(ciudad, dias);
  } catch (error) {
    mostrarError(`No se pudo consultar el pronóstico de ${ciudad.nombre}: ${mensajeError(error)}`);
  }
}

async function buscarYAgregar(estado: Estado): Promise<Estado> {
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
  await guardarEstado(nuevo);
  exito(`Ciudad agregada: ${etiquetaCiudad(ciudad)}`);
  return nuevo;
}

async function eliminarCiudad(estado: Estado): Promise<Estado> {
  if (estado.ciudades.length === 0) {
    console.log("  No hay ciudades guardadas. Usa la opción 3 para agregar alguna.");
    return estado;
  }
  console.log("  Ciudades guardadas:");
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
  await guardarEstado(nuevo);
  exito(`Ciudad eliminada: ${etiquetaCiudad(ciudad)}`);
  return nuevo;
}

async function establecerDefault(estado: Estado): Promise<Estado> {
  if (estado.ciudades.length === 0) {
    console.log("  No hay ciudades guardadas. Usa la opción 3 para agregar alguna.");
    return estado;
  }
  console.log("  Ciudades guardadas:");
  const indice = await elegirCiudad(estado.ciudades, "establecer como default");
  if (indice === null) {
    return estado;
  }
  const ciudad = estado.ciudades[indice];
  if (!ciudad) {
    return estado;
  }
  const nuevo: Estado = { ...estado, ciudadDefaultId: ciudad.id };
  await guardarEstado(nuevo);
  exito(`Ciudad default: ${etiquetaCiudad(ciudad)}`);
  return nuevo;
}

function alternarUnidad(estado: Estado): Estado {
  return { ...estado, unidad: estado.unidad === "celsius" ? "fahrenheit" : "celsius" };
}

async function main(): Promise<void> {
  let estado = await cargarEstado();
  let salir = false;
  while (!salir) {
    dibujarMenu(estado);
    const opcion = await preguntar("  Selecciona una opción: ");
    console.log();
    switch (opcion) {
      case "1":
        await climaDefault(estado);
        break;
      case "2":
        await climaTodas(estado);
        break;
      case "3":
        estado = await buscarYAgregar(estado);
        break;
      case "4":
        estado = await eliminarCiudad(estado);
        break;
      case "5":
        estado = await establecerDefault(estado);
        break;
      case "6":
        await pronosticoCiudad(estado);
        break;
      case "8": {
        estado = alternarUnidad(estado);
        await guardarEstado(estado);
        exito(`Unidad actualizada a ${estado.unidad === "celsius" ? "°C" : "°F"}.`);
        break;
      }
      case "9":
        console.log("  ¡Hasta luego!");
        salir = true;
        break;
      default:
        console.log(`  ${rojo("Opción no válida.")}`);
    }
    if (!salir) {
      await pausar();
      console.log();
    }
  }
  cerrar();
}

main().catch((error) => {
  if (error instanceof EntradaCerrada) {
    console.log("\n  ¡Hasta luego!");
  } else {
    console.error(`  ${rojo(`Error inesperado: ${mensajeError(error)}`)}`);
  }
  cerrar();
});
