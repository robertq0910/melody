// Request-time feed of performance locations for the map widget.
// Returns geocoded points for upcoming + past performances, tagged by kind so
// the map can show distinct pins. Geocoding is cached in D1 (see geocode.ts),
// so only the first request after a new/changed venue does any outbound work.

import type { APIRoute } from "astro";
import { getDb, listUpcomingPerformances, listPastPerformances } from "../../lib/db";
import { geocodeAddress } from "../../lib/geocode";

export const prerender = false;

interface MapPoint {
	slug: string;
	title: string;
	venue: string | null;
	location: string | null;
	date: string | null;
	kind: "upcoming" | "past";
	lat: number;
	lng: number;
}

export const GET: APIRoute = async ({ locals }) => {
	const db = getDb(locals);
	const [upcoming, past] = await Promise.all([
		listUpcomingPerformances(db),
		listPastPerformances(db),
	]);

	const rows = [
		...upcoming.map((p) => ({ p, kind: "upcoming" as const })),
		...past.map((p) => ({ p, kind: "past" as const })),
	];

	const points: MapPoint[] = [];
	// Sequential (not Promise.all) so cold-cache lookups hit Nominatim politely,
	// one at a time, instead of bursting.
	for (const { p, kind } of rows) {
		const full = [p.venue, p.location].filter(Boolean).join(", ");
		if (!full) continue;
		// Try the full "venue, location" first; if that venue name doesn't resolve,
		// fall back to just the location (city/zip) so the pin still lands in town.
		let coords = await geocodeAddress(db, full);
		if (!coords && p.location && p.location !== full) {
			coords = await geocodeAddress(db, p.location);
		}
		if (!coords) continue;
		points.push({
			slug: p.slug,
			title: p.title,
			venue: p.venue,
			location: p.location,
			date: p.event_date,
			kind,
			lat: coords.lat,
			lng: coords.lng,
		});
	}

	return new Response(JSON.stringify({ points }), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			// Short cache only — geocoding is already cached server-side in D1, so
			// the feed is cheap to recompute and newly-added performances show up
			// on the map within a minute rather than being stuck for an hour.
			"Cache-Control": "public, max-age=60",
		},
	});
};
