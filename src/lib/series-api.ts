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
  const texto = await res.text().catch(() => "");
  let cuerpo: unknown = undefined;
  let jsonValido = true;
  if (texto.trim()) {
    try { cuerpo = JSON.parse(texto); } catch { jsonValido = false; }
  }
  if (!res.ok) {
    const d = (cuerpo as { detail?: unknown } | undefined)?.detail ?? cuerpo;
    const detail = d === undefined ? "" : typeof d === "string" ? d : JSON.stringify(d);
    if (res.status === 404) throw new Error(`Serie no encontrada (404). ${detail}`.trim());
    throw new Error(`Error ${res.status} de la API. ${detail}`.trim());
  }
  // 204 o cuerpo vacío (p. ej. DELETE): no hay nada que parsear.
  if (res.status === 204 || !texto.trim()) return undefined as unknown as T;
  if (!jsonValido) throw new Error("La API devolvió una respuesta no válida.");
  return cuerpo as T;
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
