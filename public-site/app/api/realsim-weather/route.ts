import { env } from "cloudflare:workers";

const latitudes = [-70, -50, -30, -10, 10, 30, 50, 70];
const longitudes = Array.from({ length: 18 }, (_, index) => -170 + index * 20);
const sites = latitudes.flatMap((lat) => longitudes.map((lon) => ({ lat, lon })));
const variables = "temperature_2m,weather_code,cloud_cover,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,wind_speed_250hPa,wind_direction_250hPa";
const freshForMs = 3 * 60 * 60 * 1000;
const retryAfterMs = 30 * 60 * 1000;
const metSites = [-60, -20, 20, 60].flatMap((lat) =>
  [-157.5, -112.5, -67.5, -22.5, 22.5, 67.5, 112.5, 157.5].map((lon) => ({ lat, lon })),
);

type DeliveryState = "LIVE" | "SNAPSHOT" | "PARTIAL" | "STALE";
type WeatherSample = {
  lat: number;
  lon: number;
  temperature: number;
  weatherCode: number;
  cloud: number;
  precipitation: number;
  wind: number;
  windDirection: number;
  gust: number;
  jetWind: number;
  jetDirection: number;
  observedAt: string;
};
type WeatherSnapshot = {
  schema: "leis_realsim_weather_v2";
  provider: "open-meteo" | "met-norway";
  provider_label: string;
  provider_url: string;
  generated_at: string;
  refreshed_at: string;
  grid_count: number;
  source_cell_count: number;
  spatial_method: "direct_model_cells" | "nearest_from_32_surface_cells";
  jet_available: boolean;
  simulated_between_snapshots: true;
  samples: WeatherSample[];
};
type StoredSnapshot = {
  payload: WeatherSnapshot;
  fetchedAt: string;
  lastAttemptAt: string;
};

function finite(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function age(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? Date.now() - timestamp : Number.POSITIVE_INFINITY;
}

function openMeteoUrl() {
  const params = new URLSearchParams({
    latitude: sites.map(({ lat }) => lat).join(","),
    longitude: sites.map(({ lon }) => lon).join(","),
    current: variables,
    wind_speed_unit: "kmh",
    forecast_days: "1",
    cell_selection: "nearest",
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

async function ensureTable() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS realsim_weather_snapshot (
    id INTEGER PRIMARY KEY NOT NULL,
    payload_json TEXT NOT NULL,
    fetched_at TEXT NOT NULL,
    last_attempt_at TEXT NOT NULL,
    provider TEXT NOT NULL
  )`).run();
}

async function readStored(): Promise<StoredSnapshot | null> {
  const row = await env.DB.prepare(
    "SELECT payload_json, fetched_at, last_attempt_at FROM realsim_weather_snapshot WHERE id = 1",
  ).first<{ payload_json: string; fetched_at: string; last_attempt_at: string }>();
  if (!row) return null;
  try {
    return { payload: JSON.parse(row.payload_json), fetchedAt: row.fetched_at, lastAttemptAt: row.last_attempt_at };
  } catch {
    return null;
  }
}

async function markAttempt(now: string) {
  await env.DB.prepare(
    "UPDATE realsim_weather_snapshot SET last_attempt_at = ? WHERE id = 1",
  ).bind(now).run();
}

async function store(snapshot: WeatherSnapshot, now: string) {
  await env.DB.prepare(`INSERT INTO realsim_weather_snapshot
    (id, payload_json, fetched_at, last_attempt_at, provider)
    VALUES (1, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      payload_json = excluded.payload_json,
      fetched_at = excluded.fetched_at,
      last_attempt_at = excluded.last_attempt_at,
      provider = excluded.provider`).bind(JSON.stringify(snapshot), now, now, snapshot.provider).run();
}

function reply(snapshot: WeatherSnapshot, state: DeliveryState) {
  return Response.json({ ...snapshot, delivery_state: state }, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=1800, stale-while-revalidate=10800",
      "X-LEIS-Weather": state,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function fromOpenMeteo(now: string): Promise<WeatherSnapshot> {
  const response = await fetch(openMeteoUrl(), {
    headers: { Accept: "application/json", "User-Agent": "LEIS-realSIM-Earth/1.2 (+https://leis-understanding-system.puzik.chatgpt.site/realsim)" },
  });
  if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload : [payload];
  if (rows.length < sites.length) throw new Error("Open-Meteo incomplete grid");
  const samples = sites.map((site, index) => {
    const current = rows[index]?.current ?? {};
    return {
      ...site,
      temperature: finite(current.temperature_2m),
      weatherCode: finite(current.weather_code),
      cloud: finite(current.cloud_cover),
      precipitation: finite(current.precipitation),
      wind: finite(current.wind_speed_10m),
      windDirection: finite(current.wind_direction_10m),
      gust: finite(current.wind_gusts_10m),
      jetWind: finite(current.wind_speed_250hPa),
      jetDirection: finite(current.wind_direction_250hPa),
      observedAt: String(current.time ?? now),
    };
  });
  return {
    schema: "leis_realsim_weather_v2",
    provider: "open-meteo",
    provider_label: "Open-Meteo Forecast API",
    provider_url: "https://open-meteo.com/en/docs",
    generated_at: now,
    refreshed_at: now,
    grid_count: sites.length,
    source_cell_count: sites.length,
    spatial_method: "direct_model_cells",
    jet_available: true,
    simulated_between_snapshots: true,
    samples,
  };
}

function coordinateDistance(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const lonDelta = Math.min(Math.abs(a.lon - b.lon), 360 - Math.abs(a.lon - b.lon));
  return Math.hypot(a.lat - b.lat, lonDelta * Math.cos(a.lat * Math.PI / 180));
}

async function fromMetNorway(now: string): Promise<WeatherSnapshot> {
  const source = await Promise.all(metSites.map(async (site) => {
    const response = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${site.lat}&lon=${site.lon}`, {
      headers: { Accept: "application/json", "User-Agent": "LEIS-realSIM-Earth/1.2 contact: leis.community" },
    });
    if (!response.ok) throw new Error(`MET Norway ${response.status}`);
    const payload = await response.json();
    const entry = payload?.properties?.timeseries?.[0];
    const details = entry?.data?.instant?.details ?? {};
    const precipitation = finite(entry?.data?.next_1_hours?.details?.precipitation_amount);
    const cloud = finite(details.cloud_area_fraction);
    const wind = finite(details.wind_speed) * 3.6;
    return {
      ...site,
      temperature: finite(details.air_temperature),
      weatherCode: precipitation > 0 ? 51 : cloud >= 70 ? 3 : cloud >= 25 ? 2 : 0,
      cloud,
      precipitation,
      wind,
      windDirection: finite(details.wind_from_direction),
      gust: finite(details.wind_speed_of_gust, finite(details.wind_speed)) * 3.6,
      jetWind: 0,
      jetDirection: 0,
      observedAt: String(entry?.time ?? now),
    } satisfies WeatherSample;
  }));
  const samples = sites.map((site) => {
    const nearest = source.reduce((best, sample) =>
      coordinateDistance(sample, site) < coordinateDistance(best, site) ? sample : best,
    );
    return { ...nearest, ...site };
  });
  return {
    schema: "leis_realsim_weather_v2",
    provider: "met-norway",
    provider_label: "MET Norway Locationforecast",
    provider_url: "https://api.met.no/weatherapi/locationforecast/2.0/documentation",
    generated_at: now,
    refreshed_at: now,
    grid_count: sites.length,
    source_cell_count: metSites.length,
    spatial_method: "nearest_from_32_surface_cells",
    jet_available: false,
    simulated_between_snapshots: true,
    samples,
  };
}

export async function GET() {
  try {
    await ensureTable();
    const stored = await readStored();
    if (stored && age(stored.fetchedAt) < freshForMs) {
      return reply(stored.payload, stored.payload.jet_available ? "SNAPSHOT" : "PARTIAL");
    }
    if (stored && age(stored.lastAttemptAt) < retryAfterMs) return reply(stored.payload, "STALE");

    const now = new Date().toISOString();
    if (stored) await markAttempt(now);
    try {
      const snapshot = await fromOpenMeteo(now);
      await store(snapshot, now);
      return reply(snapshot, "LIVE");
    } catch {
      try {
        const snapshot = await fromMetNorway(now);
        await store(snapshot, now);
        return reply(snapshot, "PARTIAL");
      } catch {
        if (stored) return reply(stored.payload, "STALE");
        return Response.json({ status: "UNAVAILABLE" }, {
          status: 503,
          headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
        });
      }
    }
  } catch {
    return Response.json({ status: "UNAVAILABLE" }, {
      status: 503,
      headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  }
}
