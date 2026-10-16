# RustGIS service

Spatial-search reference service used by the live RustGIS lesson.

- `rstar` performs bounding-envelope candidate pruning.
- `geo` computes exact Haversine distance for remaining points.
- `axum` exposes the typed `POST /api/v1/gis/nearby` contract.

Run with a Rust toolchain:

```bash
cargo run --manifest-path apps/rustgis/Cargo.toml
```

Or build the container:

```bash
docker build -t ship-it-rustgis apps/rustgis
docker run --rm -p 4100:4100 ship-it-rustgis
```

The Vercel-hosted lesson calls `/api/rustgis/nearby`, a TypeScript adapter with the same request, response, validation, and Haversine refinement so the frontend remains live without a separate container host. Set up a rewrite to the Rust service when deploying the container.
