import { describe, it, expect, vi, afterEach } from "vitest";
import { API_BASE, borrarSerie, validar, type FormValues } from "./series-api";

const base: FormValues = { titulo: "X", anio_estreno: "2008", temporadas: "5", genero: "Drama", plataforma: "Netflix", estado: "Finalizada", sinopsis: "s", imagen_url: "" };

describe("validar", () => {
  it("año fuera de 1900-2030", () => { expect(validar({ ...base, anio_estreno: "2031" }, "crear")["anio_estreno"]).toBeDefined(); expect(validar({ ...base, anio_estreno: "1899" }, "crear")["anio_estreno"]).toBeDefined(); });
  it("temporadas fuera de 1-20", () => { expect(validar({ ...base, temporadas: "21" }, "crear")["temporadas"]).toBeDefined(); expect(validar({ ...base, temporadas: "0" }, "editar")["temporadas"]).toBeDefined(); });
  it("estado inválido", () => { expect(validar({ ...base, estado: "Cancelada" }, "crear")["estado"]).toBeDefined(); });
  it("valores válidos", () => { expect(validar(base, "crear")).toEqual({}); });
});

describe("borrarSerie", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("un 204 con cuerpo vacío se resuelve sin valor", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(borrarSerie(3)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/series/3`, expect.objectContaining({ method: "DELETE" }));
  });
});

import { borrarSerie as borrar2 } from "./series-api";
import { it as it2, expect as expect2, vi as vi2 } from "vitest";
it2("DELETE con 200 y cuerpo vacío se resuelve sin error", async () => {
  vi2.stubGlobal("fetch", vi2.fn(async () => new Response("", { status: 200 })));
  await expect2(borrar2(1)).resolves.toBeUndefined();
  vi2.unstubAllGlobals();
});
