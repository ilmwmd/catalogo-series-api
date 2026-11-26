import { describe, it, expect } from "vitest";
import { validar, type FormValues } from "./series-api";
const base: FormValues = { titulo: "X", anio_estreno: "2008", temporadas: "5", genero: "Drama", plataforma: "Netflix", estado: "Finalizada", sinopsis: "s", imagen_url: "" };
describe("validar", () => {
  it("año fuera de 1900-2030", () => { expect(validar({ ...base, anio_estreno: "2031" }, "crear")["anio_estreno"]).toBeDefined(); expect(validar({ ...base, anio_estreno: "1899" }, "crear")["anio_estreno"]).toBeDefined(); });
  it("temporadas fuera de 1-20", () => { expect(validar({ ...base, temporadas: "21" }, "crear")["temporadas"]).toBeDefined(); expect(validar({ ...base, temporadas: "0" }, "editar")["temporadas"]).toBeDefined(); });
  it("estado inválido", () => { expect(validar({ ...base, estado: "Cancelada" }, "crear")["estado"]).toBeDefined(); });
  it("valores válidos", () => { expect(validar(base, "crear")).toEqual({}); });
});
