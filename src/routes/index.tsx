import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ESTADOS, borrarSerie, crearSerie, editarSerie, listarSeries, obtenerSerie, validar,
  type Estado, type FormValues, type Serie,
} from "@/lib/series-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SeriesFlix · Catálogo de series de TV" },
      { name: "description", content: "Explora, añade, edita y borra series de TV de tu catálogo." },
      { property: "og:title", content: "SeriesFlix · Catálogo de series de TV" },
      { property: "og:description", content: "Explora, añade, edita y borra series de TV de tu catálogo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const vacio: FormValues = { titulo: "", anio_estreno: "", temporadas: "", genero: "", plataforma: "", estado: "En emisión", sinopsis: "", imagen_url: "" };

function Index() {
  const [series, setSeries] = useState<Serie[]>([]);
  const [pendientes, setPendientes] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [form, setForm] = useState<{ modo: "crear" | "editar"; id?: number; valores: FormValues } | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const ejecutar = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setPendientes((n) => n + 1);
    try { return await fn(); }
    catch (e) { setError(e instanceof Error ? e.message : "Error desconocido"); return undefined; }
    finally { setPendientes((n) => n - 1); }
  }, []);

  const cargar = useCallback(async () => {
    const data = await ejecutar(listarSeries);
    if (data) setSeries(data);
  }, [ejecutar]);

  useEffect(() => { void cargar(); }, [cargar]);

  const abrirEditar = async (s: Serie) => {
    setError(null);
    const actual = await ejecutar(() => obtenerSerie(s.id));
    if (!actual) return;
    setErrores({});
    setForm({ modo: "editar", id: actual.id, valores: {
      titulo: actual.titulo, anio_estreno: String(actual.anio_estreno), temporadas: String(actual.temporadas),
      genero: actual.genero, plataforma: actual.plataforma, estado: actual.estado, sinopsis: actual.sinopsis,
      imagen_url: actual.imagen_url ?? "",
    } });
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const v = form.valores;
    const errs = validar(v, form.modo);
    setErrores(errs);
    if (Object.keys(errs).length) return;
    setError(null);
    const res = form.modo === "crear"
      ? await ejecutar(() => crearSerie({
          titulo: v.titulo.trim(), anio_estreno: Number(v.anio_estreno), temporadas: Number(v.temporadas),
          genero: v.genero.trim(), plataforma: v.plataforma.trim(), estado: v.estado as Estado,
          sinopsis: v.sinopsis.trim(), imagen_url: v.imagen_url.trim(),
        }))
      : await ejecutar(() => editarSerie(form.id!, {
          estado: v.estado as Estado, imagen_url: v.imagen_url.trim(), temporadas: Number(v.temporadas),
        }));
    if (res) {
      setAviso(form.modo === "crear" ? `"${res.titulo}" añadida.` : `"${res.titulo}" actualizada.`);
      setForm(null);
      await cargar();
    }
  };

  const borrar = async (s: Serie) => {
    if (!window.confirm(`¿Seguro que quieres borrar "${s.titulo}"? Esta acción no se puede deshacer.`)) return;
    setError(null);
    const res = await ejecutar(() => borrarSerie(s.id));
    if (res) { setAviso(`"${res.titulo}" borrada.`); await cargar(); }
  };

  const cargando = pendientes > 0;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-4 px-4 py-3 sm:px-8 2xl:px-16">
          <h1 className="font-display text-3xl tracking-wider text-primary sm:text-4xl 2xl:text-5xl">SERIESFLIX</h1>
          <button
            onClick={() => { setErrores({}); setForm({ modo: "crear", valores: vacio }); }}
            className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 sm:px-6 sm:text-base 2xl:text-lg"
          >+ Añadir serie</button>
        </div>
      </header>

      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-[1920px] px-4 pb-6 pt-10 sm:px-8 sm:pt-16 2xl:px-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-glow">Catálogo</p>
          <h2 className="mt-2 font-display text-5xl leading-none sm:text-7xl 2xl:text-8xl">Tus series de TV</h2>
          <p className="mt-3 max-w-xl text-muted-foreground 2xl:text-xl">{series.length} series en el catálogo</p>
        </div>
      </section>

      <main className="mx-auto max-w-[1920px] px-4 pb-16 sm:px-8 2xl:px-16">
        {cargando && (
          <div role="status" className="mb-6 flex items-center gap-3 rounded-lg border border-primary/40 bg-accent px-4 py-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <div>
              <p className="font-semibold">Cargando series...</p>
              <p className="text-sm text-muted-foreground">El servidor puede tardar hasta un minuto en despertar.</p>
            </div>
          </div>
        )}
        {error && (
          <div role="alert" className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-destructive/60 bg-destructive/15 px-4 py-3">
            <p><strong>Ha ocurrido un error:</strong> {error}</p>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => { setError(null); void cargar(); }} className="rounded bg-secondary px-3 py-1 text-sm hover:bg-muted">Reintentar</button>
              <button onClick={() => setError(null)} aria-label="Cerrar" className="px-2 text-lg">×</button>
            </div>
          </div>
        )}
        {aviso && !cargando && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-success/50 bg-success/10 px-4 py-3">
            <p>{aviso}</p><button onClick={() => setAviso(null)} aria-label="Cerrar" className="px-2 text-lg">×</button>
          </div>
        )}
        {!cargando && !error && series.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">No hay series en el catálogo todavía.</p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 2xl:gap-8 min-[2400px]:grid-cols-6">
          {series.map((s) => (
            <article key={s.id} className="group flex flex-col overflow-hidden rounded-lg bg-card ring-1 ring-border transition duration-300 hover:-translate-y-1 hover:ring-primary hover:shadow-glow">
              <div className="relative aspect-video overflow-hidden">
                {s.imagen_url ? (
                  <img src={s.imagen_url} alt={s.titulo} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-poster">
                    <span className="px-4 text-center font-display text-4xl tracking-wide text-muted-foreground">{s.titulo}</span>
                  </div>
                )}
                <span className={`absolute left-3 top-3 rounded px-2 py-0.5 text-xs font-bold uppercase ${s.estado === "En emisión" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{s.estado}</span>
              </div>
              <div className="flex flex-1 flex-col p-4 2xl:p-5">
                <h3 className="font-display text-3xl leading-tight tracking-wide 2xl:text-4xl">{s.titulo}</h3>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm 2xl:text-base">
                  <Dato k="Género" v={s.genero} /><Dato k="Plataforma" v={s.plataforma} />
                  <Dato k="Estreno" v={String(s.anio_estreno)} /><Dato k="Temporadas" v={String(s.temporadas)} />
                  <Dato k="Estado" v={s.estado} />
                </dl>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground 2xl:text-base">{s.sinopsis}</p>
                <div className="mt-4 flex gap-2">
                  <button disabled={cargando} onClick={() => void abrirEditar(s)} className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50">Editar</button>
                  <button disabled={cargando} onClick={() => void borrar(s)} className="flex-1 rounded-md border border-destructive/70 px-3 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50">Borrar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {form && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => !cargando && setForm(null)}>
          <form onSubmit={enviar} noValidate onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-xl bg-card p-5 ring-1 ring-border sm:rounded-xl sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-4xl tracking-wide">{form.modo === "crear" ? "Nueva serie" : `Editar serie #${form.id}`}</h2>
              <button type="button" onClick={() => setForm(null)} aria-label="Cerrar" className="text-2xl text-muted-foreground hover:text-foreground">×</button>
            </div>
            {form.modo === "editar" && (
              <p className="mb-4 rounded-md bg-accent px-3 py-2 text-sm text-muted-foreground">La API solo permite editar estado, temporadas e imagen. El resto de campos se muestran como referencia.</p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {form.modo === "editar" && <Campo label="ID" value={String(form.id)} disabled onChange={() => {}} />}
              {(["titulo", "genero", "plataforma", "anio_estreno", "temporadas", "imagen_url"] as const).map((k) => (
                <Campo key={k} label={etiquetas[k]} value={form.valores[k]} error={errores[k]}
                  type={k === "anio_estreno" || k === "temporadas" ? "number" : k === "imagen_url" ? "url" : "text"}
                  min={k === "anio_estreno" ? 1900 : k === "temporadas" ? 1 : undefined}
                  max={k === "anio_estreno" ? 2030 : k === "temporadas" ? 20 : undefined}
                  disabled={form.modo === "editar" && !editables.includes(k)}
                  onChange={(val) => setForm({ ...form, valores: { ...form.valores, [k]: val } })} />
              ))}
              <label className="flex flex-col gap-1 text-sm font-medium">
                Estado
                <select value={form.valores.estado} onChange={(e) => setForm({ ...form, valores: { ...form.valores, estado: e.target.value } })} className="rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
                  {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                {errores["estado"] && <span className="text-xs text-destructive">{errores["estado"]}</span>}
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2">
                Sinopsis
                <textarea rows={4} value={form.valores.sinopsis} disabled={form.modo === "editar"} onChange={(e) => setForm({ ...form, valores: { ...form.valores, sinopsis: e.target.value } })} className="rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
                {errores["sinopsis"] && <span className="text-xs text-destructive">{errores["sinopsis"]}</span>}
              </label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setForm(null)} className="rounded-md bg-secondary px-5 py-2 font-semibold hover:bg-muted">Cancelar</button>
              <button type="submit" disabled={cargando} className="rounded-md bg-gradient-primary px-5 py-2 font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
                {cargando ? "Guardando..." : form.modo === "crear" ? "Crear serie" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const etiquetas = { titulo: "Título", genero: "Género", plataforma: "Plataforma", anio_estreno: "Año de estreno (1900-2030)", temporadas: "Temporadas (1-20)", imagen_url: "URL de imagen (opcional)" };
const editables = ["temporadas", "imagen_url"];

function Dato({ k, v }: { k: string; v: string }) {
  return <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>;
}

function Campo(p: { label: string; value: string; onChange: (v: string) => void; error?: string | undefined; type?: string; min?: number | undefined; max?: number | undefined; disabled?: boolean }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {p.label}
      <input type={p.type ?? "text"} value={p.value} min={p.min} max={p.max} disabled={p.disabled} onChange={(e) => p.onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
      {p.error && <span className="text-xs text-destructive">{p.error}</span>}
    </label>
  );
}
