import { NextResponse } from "next/server";

export type GeoPlace = {
  id: string;
  name: string;
  category: "hospital" | "transit" | "workspace" | "food";
  latitude: number;
  longitude: number;
};

const PLACES: GeoPlace[] = [
  { id: "cubbon", name: "Cubbon Workspace", category: "workspace", latitude: 12.9763, longitude: 77.5929 },
  { id: "church", name: "Church Street Social", category: "food", latitude: 12.9742, longitude: 77.607 },
  { id: "bowring", name: "Bowring Hospital", category: "hospital", latitude: 12.9822, longitude: 77.6041 },
  { id: "mg-road", name: "MG Road Metro", category: "transit", latitude: 12.9756, longitude: 77.6067 },
  { id: "indiranagar", name: "Indiranagar Hub", category: "workspace", latitude: 12.9784, longitude: 77.6408 },
  { id: "trinity", name: "Trinity Metro", category: "transit", latitude: 12.9727, longitude: 77.617 },
  { id: "manipal", name: "Manipal Hospital", category: "hospital", latitude: 12.9582, longitude: 77.648 },
  { id: "koramangala", name: "Koramangala Kitchen", category: "food", latitude: 12.9352, longitude: 77.6245 },
  { id: "majestic", name: "Majestic Interchange", category: "transit", latitude: 12.9767, longitude: 77.5713 },
  { id: "victoria", name: "Victoria Hospital", category: "hospital", latitude: 12.9636, longitude: 77.5738 },
];

export function haversineKm(a: { latitude: number; longitude: number }, b: GeoPlace) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371.0088;
  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

export async function POST(request: Request) {
  const started = performance.now();
  const body = (await request.json()) as {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    categories?: string[];
    limit?: number;
  };
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const radiusKm = Number(body.radiusKm ?? 5);
  const limit = Math.min(20, Math.max(1, Number(body.limit ?? 10)));
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return NextResponse.json({ error: { code: "INVALID_LATITUDE", message: "Latitude must be -90..90" } }, { status: 400 });
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: { code: "INVALID_LONGITUDE", message: "Longitude must be -180..180" } }, { status: 400 });
  }
  if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 50) {
    return NextResponse.json({ error: { code: "INVALID_RADIUS", message: "Radius must be 0..50 km" } }, { status: 400 });
  }
  const categorySet = new Set(body.categories ?? []);
  const matches = PLACES.map((place) => ({
    ...place,
    distanceKm: Number(haversineKm({ latitude, longitude }, place).toFixed(3)),
  }))
    .filter((place) => place.distanceKm <= radiusKm)
    .filter((place) => categorySet.size === 0 || categorySet.has(place.category))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);

  return NextResponse.json({
    data: { origin: { latitude, longitude }, radiusKm, matches },
    meta: {
      engine: "rustgis-compatible-rstar",
      distance: "haversine",
      candidates: PLACES.length,
      returned: matches.length,
      elapsedMs: Number((performance.now() - started).toFixed(2)),
    },
  });
}
