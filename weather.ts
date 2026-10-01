import type { Unidad } from "./types.ts";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export interface TemperaturaActual {
  valor: number;
  simbolo: string;
}

export interface PronosticoDia {
  fecha: string;
  descripcion: string;
  max: number;
  min: number;
  simbolo: string;
}

interface RespuestaForecast {
  current?: {
    temperature_2m?: number;
  };
  current_units?: {
    temperature_2m?: string;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
  };
  daily_units?: {
    temperature_2m_max?: string;
  };
}

const DESCRIPCIONES_CODIGO: Record<number, string> = {
  0: "Despejado",
  1: "Poco nublado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna intensa",
  56: "Llovizna helada ligera",
  57: "Llovizna helada intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  66: "Lluvia helada ligera",
  67: "Lluvia helada intensa",
  71: "Nevada ligera",
  73: "Nevada moderada",
  75: "Nevada intensa",
  77: "Granos de nieve",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos violentos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve intensos",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo intenso",
};

function descripcionCodigo(codigo: number): string {
  return DESCRIPCIONES_CODIGO[codigo] ?? "Desconocido";
}

export async function obtenerTemperatura(
  lat: number,
  lon: number,
  unidad: Unidad,
): Promise<TemperaturaActual> {
  const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m&temperature_unit=${unidad}`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`);
  }
  const datos = (await respuesta.json()) as RespuestaForecast;
  const valor = datos.current?.temperature_2m;
  const simbolo = datos.current_units?.temperature_2m;
  if (valor === undefined || simbolo === undefined) {
    throw new Error("respuesta inesperada de OpenMeteo");
  }
  return { valor, simbolo };
}

export async function obtenerPronostico(
  lat: number,
  lon: number,
  unidad: Unidad,
): Promise<PronosticoDia[]> {
  const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto&temperature_unit=${unidad}`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`);
  }
  const datos = (await respuesta.json()) as RespuestaForecast;
  const fechas = datos.daily?.time;
  const codigos = datos.daily?.weather_code;
  const maximas = datos.daily?.temperature_2m_max;
  const minimas = datos.daily?.temperature_2m_min;
  const simbolo = datos.daily_units?.temperature_2m_max;
  if (!fechas || !codigos || !maximas || !minimas || simbolo === undefined) {
    throw new Error("respuesta inesperada de OpenMeteo");
  }
  const dias: PronosticoDia[] = [];
  for (let i = 0; i < fechas.length; i++) {
    const fecha = fechas[i];
    const codigo = codigos[i];
    const max = maximas[i];
    const min = minimas[i];
    if (
      fecha === undefined ||
      codigo === undefined ||
      max === null ||
      max === undefined ||
      min === null ||
      min === undefined
    ) {
      continue;
    }
    dias.push({ fecha, descripcion: descripcionCodigo(codigo), max, min, simbolo });
  }
  return dias;
}
