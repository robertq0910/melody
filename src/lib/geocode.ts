// Turn a free-text address ("venue, location") into coordinates, cached in D1.
// Uses OpenStreetMap's Nominatim service — free, no API key. Each unique query
// is looked up at most once and the result (or a null "no match") is cached in
// the `geocode_cache` table (migration 0010), which keeps us well within
// Nominatim's usage policy. See src/pages/api/performance-locations.json.ts.

export interface LatLng {
	lat: number;
	lng: number;
}

// Nominatim asks callers to identify themselves with a descriptive User-Agent.
const USER_AGENT = "MelodyForMedicine/1.0 (community performance map; +https://github.com/)";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

function normalize(query: string): string {
	return query.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Resolve an address to coordinates, using the D1 cache first.
 * Returns null when the address is empty, doesn't resolve, or the lookup fails
 * transiently (transient failures are NOT cached, so a later request retries).
 */
export async function geocodeAddress(
	db: D1Database,
	rawQuery: string,
): Promise<LatLng | null> {
	const query = normalize(rawQuery);
	if (!query) return null;

	const cached = await db
		.prepare("SELECT lat, lng FROM geocode_cache WHERE query = ?")
		.bind(query)
		.first<{ lat: number | null; lng: number | null }>();
	if (cached) {
		return cached.lat != null && cached.lng != null
			? { lat: cached.lat, lng: cached.lng }
			: null;
	}

	let lat: number | null = null;
	let lng: number | null = null;
	try {
		const url = new URL(NOMINATIM_URL);
		url.searchParams.set("q", rawQuery);
		url.searchParams.set("format", "jsonv2");
		url.searchParams.set("limit", "1");
		const res = await fetch(url, {
			headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
		});
		if (!res.ok) return null; // transient (e.g. 429/5xx) — don't cache, allow retry
		const data = (await res.json()) as Array<{ lat: string; lon: string }>;
		if (data.length > 0) {
			const parsedLat = Number(data[0].lat);
			const parsedLng = Number(data[0].lon);
			if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
				lat = parsedLat;
				lng = parsedLng;
			}
		}
	} catch {
		return null; // network error — don't cache, allow retry next time
	}

	// Cache the outcome — including a null result for addresses that don't resolve.
	await db
		.prepare("INSERT OR REPLACE INTO geocode_cache (query, lat, lng) VALUES (?, ?, ?)")
		.bind(query, lat, lng)
		.run();

	return lat != null && lng != null ? { lat, lng } : null;
}
