"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LearnNav } from "../LearnNav";

type Category = "hospital" | "transit" | "workspace" | "food";
type Match = { id: string; name: string; category: Category; latitude: number; longitude: number; distanceKm: number };
type SearchResponse = { data: { matches: Match[] }; meta: { engine: string; candidates: number; returned: number; elapsedMs: number } };

const categories: Category[] = ["hospital", "transit", "workspace", "food"];
const colors: Record<Category, string> = { hospital: "#ff6678", transit: "#58d7ff", workspace: "#c8ff3d", food: "#ffad42" };
const bounds = { minLat: 12.92, maxLat: 12.995, minLon: 77.555, maxLon: 77.66 };
const project = (latitude: number, longitude: number) => ({
  x: ((longitude - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 100,
  y: 100 - ((latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100,
});

export default function RustGisPage() {
  const [origin, setOrigin] = useState({ latitude: 12.9716, longitude: 77.5946 });
  const [radiusKm, setRadiusKm] = useState(4);
  const [selected, setSelected] = useState<Category[]>(categories);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/rustgis/nearby", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...origin, radiusKm, categories: selected, limit: 20 }),
      });
      if (!response.ok) throw new Error("Spatial query failed");
      setResult((await response.json()) as SearchResponse);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Spatial query failed");
    } finally {
      setLoading(false);
    }
  }, [origin, radiusKm, selected]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/rustgis/nearby", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ latitude: 12.9716, longitude: 77.5946, radiusKm: 4, categories, limit: 20 }),
      signal: controller.signal,
    })
      .then((response) => response.json() as Promise<SearchResponse>)
      .then((payload) => { if (!controller.signal.aborted) setResult(payload); })
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Spatial query failed"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const originPoint = project(origin.latitude, origin.longitude);
  const radiusPixels = useMemo(() => Math.min(43, radiusKm * 5.4), [radiusKm]);

  return (
    <main className="course-page rustgis-page">
      <LearnNav />
      <header className="rustgis-hero shell">
        <div>
          <span className="kicker">RUSTGIS / LIVE SPATIAL SYSTEM</span>
          <h1>Query space.<br /><em>See every result.</em></h1>
          <p>Interactive radius search backed by an R-tree contract and exact Haversine distance. Click anywhere on map to move query origin.</p>
        </div>
        <div className="rustgis-stack">
          <b>END-TO-END REQUEST</b>
          <span>React map → POST /nearby → R-tree envelope → geo distance → ranked JSON</span>
          <code>axum + geo + rstar</code>
        </div>
      </header>

      <section className="rustgis-lab shell">
        <aside className="rustgis-controls">
          <span>QUERY BUILDER</span>
          <label>Radius <b>{radiusKm.toFixed(1)} km</b><input type="range" min="1" max="8" step="0.5" value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))} /></label>
          <div className="rustgis-categories">
            {categories.map((category) => <button key={category} className={selected.includes(category) ? "active" : ""} style={{ "--category": colors[category] } as React.CSSProperties} onClick={() => setSelected((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])}><i />{category}</button>)}
          </div>
          <div className="rustgis-coordinates"><small>LATITUDE</small><code>{origin.latitude.toFixed(5)}</code><small>LONGITUDE</small><code>{origin.longitude.toFixed(5)}</code></div>
          <button className="rustgis-run" onClick={search} disabled={loading}>{loading ? "QUERYING INDEX…" : "RUN SPATIAL QUERY →"}</button>
          {result && <div className="rustgis-meta"><span><b>{result.meta.candidates}</b> candidates</span><span><b>{result.meta.returned}</b> matches</span><span><b>{result.meta.elapsedMs}</b> ms API</span></div>}
        </aside>

        <div className="rustgis-map" role="application" aria-label="Interactive Bengaluru proximity map" onPointerDown={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width; const y = (event.clientY - rect.top) / rect.height; setOrigin({ longitude: bounds.minLon + x * (bounds.maxLon - bounds.minLon), latitude: bounds.maxLat - y * (bounds.maxLat - bounds.minLat) }); }}>
          <div className="rustgis-grid" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M-5 76 C18 64 24 35 49 43 S76 77 106 48"/><path d="M12 -5 C25 25 58 20 70 42 S73 80 91 105"/><path d="M-5 29 C19 40 40 17 58 25 S83 36 105 18"/></svg>
          <span className="rustgis-district d1">MAJESTIC</span><span className="rustgis-district d2">CBD</span><span className="rustgis-district d3">INDIRANAGAR</span><span className="rustgis-district d4">KORAMANGALA</span>
          <div className="rustgis-radius" style={{ left: `${originPoint.x}%`, top: `${originPoint.y}%`, width: `${radiusPixels}%`, aspectRatio: "1" }} />
          <div className="rustgis-origin" style={{ left: `${originPoint.x}%`, top: `${originPoint.y}%` }}><i /><span>QUERY ORIGIN</span></div>
          {result?.data.matches.map((place, index) => { const point = project(place.latitude, place.longitude); return <button className="rustgis-marker" key={place.id} style={{ left: `${point.x}%`, top: `${point.y}%`, "--marker": colors[place.category], "--delay": `${index * 35}ms` } as React.CSSProperties} title={`${place.name} · ${place.distanceKm} km`} onPointerDown={(event) => event.stopPropagation()}><i>{index + 1}</i><span>{place.name}<small>{place.distanceKm} km</small></span></button>; })}
          <div className="rustgis-map-caption"><i /> BENGALURU SAMPLE INDEX <span>CLICK MAP TO SEARCH</span></div>
        </div>

        <aside className="rustgis-results">
          <header><span>NEAREST RESULTS</span><b>{loading ? "…" : result?.meta.returned ?? 0}</b></header>
          {error && <p className="rustgis-error">{error}</p>}
          <div>{result?.data.matches.map((place, index) => <article key={place.id}><i style={{ background: colors[place.category] }}>{index + 1}</i><div><b>{place.name}</b><small>{place.category}</small></div><strong>{place.distanceKm}<small> km</small></strong></article>)}</div>
          {!loading && !error && !result?.data.matches.length && <p className="rustgis-empty">No features inside radius. Expand range or enable categories.</p>}
        </aside>
      </section>

      <section className="rustgis-pipeline shell"><article><span>01</span><b>Envelope query</b><p>R-tree prunes features outside bounding box in logarithmic time.</p></article><article><span>02</span><b>Exact distance</b><p>Haversine validates candidates against earth curvature.</p></article><article><span>03</span><b>Filter + rank</b><p>Category predicates apply before stable nearest-first ordering.</p></article><article><span>04</span><b>Map response</b><p>Typed GeoJSON-ready records return with timing metadata.</p></article></section>
    </main>
  );
}
