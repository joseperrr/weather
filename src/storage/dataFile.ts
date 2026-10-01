import type { Estado } from "../types/State.ts";
import { ARCHIVO_DATOS } from "../utils/constants.ts";

const ESTADO_INICIAL: Estado = {
  ciudades: [],
  ciudadDefaultId: null,
  unidad: "celsius",
};

export async function leerEstado(): Promise<Estado> {
  try {
    const archivo = Bun.file(ARCHIVO_DATOS);
    if (!(await archivo.exists())) {
      return ESTADO_INICIAL;
    }
    const datos = (await archivo.json()) as Partial<Estado>;
    if (!Array.isArray(datos.ciudades)) {
      return ESTADO_INICIAL;
    }
    return {
      ciudades: datos.ciudades,
      ciudadDefaultId: typeof datos.ciudadDefaultId === "number" ? datos.ciudadDefaultId : null,
      unidad: datos.unidad === "fahrenheit" ? "fahrenheit" : "celsius",
    };
  } catch {
    return ESTADO_INICIAL;
  }
}

export async function escribirEstado(estado: Estado): Promise<void> {
  await Bun.write(ARCHIVO_DATOS, `${JSON.stringify(estado, null, 2)}\n`);
}
