use axum::{extract::State, http::StatusCode, routing::post, Json, Router};
use geo::{Haversine, Distance, Point};
use rstar::{RTree, RTreeObject, AABB};
use serde::{Deserialize, Serialize};
use std::{collections::HashSet, sync::Arc};
use tower_http::{cors::CorsLayer, trace::TraceLayer};

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct Place { id: &'static str, name: &'static str, category: &'static str, latitude: f64, longitude: f64 }

impl RTreeObject for Place {
    type Envelope = AABB<[f64; 2]>;
    fn envelope(&self) -> Self::Envelope { AABB::from_point([self.longitude, self.latitude]) }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct NearbyQuery { latitude: f64, longitude: f64, radius_km: f64, categories: Vec<String>, limit: Option<usize> }

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Match { #[serde(flatten)] place: Place, distance_km: f64 }

#[derive(Serialize)]
struct Data { origin: Origin, #[serde(rename = "radiusKm")] radius_km: f64, matches: Vec<Match> }
#[derive(Serialize)] struct Origin { latitude: f64, longitude: f64 }
#[derive(Serialize)] struct Meta { engine: &'static str, distance: &'static str, candidates: usize, returned: usize }
#[derive(Serialize)] struct Response { data: Data, meta: Meta }

async fn nearby(State(index): State<Arc<RTree<Place>>>, Json(query): Json<NearbyQuery>) -> Result<Json<Response>, StatusCode> {
    if !(-90.0..=90.0).contains(&query.latitude) || !(-180.0..=180.0).contains(&query.longitude) || !(0.0..=50.0).contains(&query.radius_km) { return Err(StatusCode::BAD_REQUEST); }
    let lat_delta = query.radius_km / 110.574;
    let lon_delta = query.radius_km / (111.320 * query.latitude.to_radians().cos().abs().max(0.01));
    let envelope = AABB::from_corners([query.longitude - lon_delta, query.latitude - lat_delta], [query.longitude + lon_delta, query.latitude + lat_delta]);
    let categories: HashSet<_> = query.categories.iter().map(String::as_str).collect();
    let origin = Point::new(query.longitude, query.latitude);
    let mut matches: Vec<_> = index.locate_in_envelope(&envelope).filter(|place| categories.is_empty() || categories.contains(place.category)).filter_map(|place| {
        let distance_km = Haversine.distance(origin, Point::new(place.longitude, place.latitude)) / 1000.0;
        (distance_km <= query.radius_km).then(|| Match { place: place.clone(), distance_km: (distance_km * 1000.0).round() / 1000.0 })
    }).collect();
    matches.sort_by(|a, b| a.distance_km.total_cmp(&b.distance_km));
    matches.truncate(query.limit.unwrap_or(20).min(20));
    let returned = matches.len();
    Ok(Json(Response { data: Data { origin: Origin { latitude: query.latitude, longitude: query.longitude }, radius_km: query.radius_km, matches }, meta: Meta { engine: "rust-rstar", distance: "haversine", candidates: index.size(), returned } }))
}

#[tokio::main]
async fn main() {
    let places = vec![
        Place { id: "cubbon", name: "Cubbon Workspace", category: "workspace", latitude: 12.9763, longitude: 77.5929 },
        Place { id: "church", name: "Church Street Social", category: "food", latitude: 12.9742, longitude: 77.6070 },
        Place { id: "bowring", name: "Bowring Hospital", category: "hospital", latitude: 12.9822, longitude: 77.6041 },
        Place { id: "mg-road", name: "MG Road Metro", category: "transit", latitude: 12.9756, longitude: 77.6067 },
        Place { id: "indiranagar", name: "Indiranagar Hub", category: "workspace", latitude: 12.9784, longitude: 77.6408 },
        Place { id: "trinity", name: "Trinity Metro", category: "transit", latitude: 12.9727, longitude: 77.6170 },
        Place { id: "manipal", name: "Manipal Hospital", category: "hospital", latitude: 12.9582, longitude: 77.6480 },
        Place { id: "koramangala", name: "Koramangala Kitchen", category: "food", latitude: 12.9352, longitude: 77.6245 },
    ];
    let app = Router::new().route("/api/v1/gis/nearby", post(nearby)).with_state(Arc::new(RTree::bulk_load(places))).layer(CorsLayer::permissive()).layer(TraceLayer::new_for_http());
    let listener = tokio::net::TcpListener::bind("0.0.0.0:4100").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
