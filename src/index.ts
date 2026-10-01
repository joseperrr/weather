import { EntradaCerrada, cerrar } from "./presentation/input.ts";
import { mensajeError } from "./presentation/output.ts";
import { ejecutarMenu } from "./presentation/menu.ts";
import { rojo } from "./utils/colors.ts";

ejecutarMenu().catch((error) => {
  if (error instanceof EntradaCerrada) {
    console.log("\n  ¡Hasta luego!");
  } else {
    console.error(`  ${rojo(`Error inesperado: ${mensajeError(error)}`)}`);
  }
  cerrar();
});
