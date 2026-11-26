export const API_BASE = "https://catalogo-series-api.onrender.com";

export type Estado = "En emisión" | "Finalizada";
export const ESTADOS: Estado[] = ["En emisión", "Finalizada"];

export interface Serie {
  id: number;
  titulo: string;
  anio_estreno: number;
  temporadas: number;
  genero: string;
  plataforma: string;
  estado: Estado;
  sinopsis: string;
  imagen_url: string | null;
}

export type SerieNueva = Omit<Serie, "id" | "imagen_url"> & { imagen_url: string };
export interface SerieEdicion {
  estado: Estado;
  imagen_url: string;
  temporadas: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : {},
    });
  } catch {
    throw new Error("No se pudo conectar con la API. Puede que el servidor esté despertando, que no haya conexión o que la API no permita peticiones desde esta web (CORS). Inténtalo de nuevo.");
  }
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = typeof body?.detail === "string" ? body.detail : JSON.stringify(body?.detail ?? body);
    } catch {
      /* sin cuerpo */
    }
    if (res.status === 404) throw new Error(`Serie no encontrada (404). ${detail}`.trim());
    throw new Error(`Error ${res.status} de la API. ${detail}`.trim());
  }
  // 204 No Content: la respuesta no tiene cuerpo, así que no se intenta parsear JSON.
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export const listarSeries = () => request<Serie[]>("/series");
export const obtenerSerie = (id: number) => request<Serie>(`/series/${id}`);
export const crearSerie = (s: SerieNueva) =>
  request<Serie>("/series", { method: "POST", body: JSON.stringify(s) });
export const editarSerie = (id: number, s: SerieEdicion) =>
  request<Serie>(`/series/${id}`, { method: "PUT", body: JSON.stringify(s) });
export const borrarSerie = (id: number): Promise<void> =>
  request<void>(`/series/${id}`, { method: "DELETE" });

export interface FormValues {
  titulo: string;
  anio_estreno: string;
  temporadas: string;
  genero: string;
  plataforma: string;
  estado: string;
  sinopsis: string;
  imagen_url: string;
}

export function validar(v: FormValues, modo: "crear" | "editar"): Record<string, string> {
  const e: Record<string, string> = {};
  const t = Number(v.temporadas);
  if (!/^\d+$/.test(v.temporadas.trim()) || t < 1 || t > 20)
    e["temporadas"] = "Debe ser un entero entre 1 y 20.";
  if (!ESTADOS.includes(v.estado as Estado)) e["estado"] = 'Solo "En emisión" o "Finalizada".';
  if (modo === "crear") {
    const a = Number(v.anio_estreno);
    if (!/^\d+$/.test(v.anio_estreno.trim()) || a < 1900 || a > 2030)
      e["anio_estreno"] = "Debe ser un entero entre 1900 y 2030.";
    if (!v.titulo.trim()) e["titulo"] = "El título es obligatorio.";
    if (!v.genero.trim()) e["genero"] = "El género es obligatorio.";
    if (!v.plataforma.trim()) e["plataforma"] = "La plataforma es obligatoria.";
    if (!v.sinopsis.trim()) e["sinopsis"] = "La sinopsis es obligatoria.";
  }
  return e;
}
