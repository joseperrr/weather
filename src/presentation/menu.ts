import type { MenuOption } from "../types/MenuOption.ts";
import type { Estado } from "../types/State.ts";
import { alternarUnidad } from "../actions/toggleUnit.ts";
import { buscarYAgregar } from "../actions/addCity.ts";
import { climaDefault, climaTodas } from "../actions/getWeather.ts";
import { pronosticoCiudad } from "../actions/getForecast.ts";
import { eliminarCiudad } from "../actions/removeCity.ts";
import { establecerDefault } from "../actions/setDefaultCity.ts";
import { cargarCiudades } from "../storage/citiesStorage.ts";
import { cargarAjustes, guardarAjustes } from "../storage/settingsStorage.ts";
import { cian, rojo } from "../utils/colors.ts";
import { SEPARADOR } from "../utils/constants.ts";
import { cerrar, pausar, preguntar } from "./input.ts";
import { exito } from "./output.ts";

const OPCIONES_VALIDAS = ["1", "2", "3", "4", "5", "6", "8", "9"] as const;

function esOpcionValida(texto: string): texto is MenuOption {
  return (OPCIONES_VALIDAS as readonly string[]).includes(texto);
}

export function dibujarMenu(estado: Estado): void {
  const simbolo = estado.unidad === "celsius" ? "°C" : "°F";
  console.log(cian(SEPARADOR));
  console.log(cian("         WEATHER CLI"));
  console.log(cian(SEPARADOR));
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${estado.ciudades.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log("  6. Pronóstico de 7 días");
  console.log(`  8. Ajustes (${simbolo})`);
  console.log("  9. Salir");
  console.log(cian(SEPARADOR));
}

async function cargarEstado(): Promise<Estado> {
  const [ciudades, ajustes] = await Promise.all([cargarCiudades(), cargarAjustes()]);
  return { ciudades, ...ajustes };
}

export async function ejecutarMenu(): Promise<void> {
  let estado = await cargarEstado();
  let salir = false;
  while (!salir) {
    dibujarMenu(estado);
    const entrada = await preguntar("  Selecciona una opción: ");
    console.log();
    const opcion: MenuOption | null = esOpcionValida(entrada) ? entrada : null;
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
        await guardarAjustes({ ciudadDefaultId: estado.ciudadDefaultId, unidad: estado.unidad });
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
