export type Unidad = "celsius" | "fahrenheit";

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

export interface RespuestaForecast {
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
