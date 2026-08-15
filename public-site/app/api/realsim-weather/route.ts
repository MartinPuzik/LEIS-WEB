const latitudes = [-70, -50, -30, -10, 10, 30, 50, 70];
const longitudes = Array.from({ length: 18 }, (_, index) => -170 + index * 20);
const sites = latitudes.flatMap((lat) => longitudes.map((lon) => ({ lat, lon })));
const variables = "temperature_2m,weather_code,cloud_cover,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,wind_speed_250hPa,wind_direction_250hPa";
const freshForMs = 10 * 60 * 1000;

type WeatherCache = {
  payload: unknown;
  fetchedAt: number;
};

const cacheKey = "__leisRealSimWeatherV1";

function cache() {
  return (globalThis as typeof globalThis & Record<string, WeatherCache | undefined>)[cacheKey];
}

function setCache(value: WeatherCache) {
  (globalThis as typeof globalThis & Record<string, WeatherCache | undefined>)[cacheKey] = value;
}

function providerUrl() {
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

function reply(payload: unknown, status: "LIVE" | "CACHED" | "STALE") {
  return Response.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=1800",
      "X-LEIS-Weather": status,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET() {
  const stored = cache();
  if (stored && Date.now() - stored.fetchedAt < freshForMs) return reply(stored.payload, "CACHED");

  try {
    const response = await fetch(providerUrl(), {
      headers: { Accept: "application/json", "User-Agent": "LEIS-realSIM-Earth/1.0" },
    });
    if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
    const payload = await response.json();
    setCache({ payload, fetchedAt: Date.now() });
    return reply(payload, "LIVE");
  } catch {
    if (stored) return reply(stored.payload, "STALE");
    return Response.json({ status: "UNAVAILABLE" }, {
      status: 503,
      headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  }
}
