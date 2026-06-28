-- Cache for geocoded venue/location strings.
-- We turn the free-text "venue, location" of each performance into lat/lng via
-- OpenStreetMap's Nominatim service, then store the result here so a given
-- address is only ever looked up once (Nominatim's usage policy asks for this).
-- A row with NULL lat/lng means "geocoded, but no match" — so we don't re-query
-- addresses that don't resolve.
CREATE TABLE geocode_cache (
	query      TEXT PRIMARY KEY,   -- normalized address query (lowercased, trimmed)
	lat        REAL,               -- NULL = geocoded but no result
	lng        REAL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
