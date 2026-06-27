import type { APIRoute } from "astro";
import { getDb, listUpcomingPerformances } from "../lib/db";
import { SITE_TITLE } from "../consts";

export const prerender = false;

// Escapes text for an iCalendar value (RFC 5545).
function ics(text: string): string {
	return text
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\r?\n/g, "\\n");
}

// An all-day VEVENT uses DATE values (YYYYMMDD), DTEND being the day after.
function toDateValue(iso: string): string {
	return iso.replace(/-/g, "").slice(0, 8);
}
function nextDay(iso: string): string {
	const d = new Date(iso + "T00:00:00Z");
	d.setUTCDate(d.getUTCDate() + 1);
	return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export const GET: APIRoute = async ({ locals, site }) => {
	const db = getDb(locals);
	const upcoming = await listUpcomingPerformances(db);
	const origin = site?.origin ?? "https://example.com";
	const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

	const lines: string[] = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		`PRODID:-//${ics(SITE_TITLE)}//Events//EN`,
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		`X-WR-CALNAME:${ics(SITE_TITLE)} Performances`,
	];

	for (const p of upcoming) {
		if (!p.event_date) continue;
		const location = [p.venue, p.location].filter(Boolean).join(", ");
		lines.push(
			"BEGIN:VEVENT",
			`UID:performance-${p.id}@${new URL(origin).host}`,
			`DTSTAMP:${stamp}`,
			`DTSTART;VALUE=DATE:${toDateValue(p.event_date)}`,
			`DTEND;VALUE=DATE:${nextDay(p.event_date)}`,
			`SUMMARY:${ics(p.title)}`,
			...(location ? [`LOCATION:${ics(location)}`] : []),
			...(p.summary ? [`DESCRIPTION:${ics(p.summary)}`] : []),
			`URL:${origin}/performances/${p.slug}`,
			"END:VEVENT",
		);
	}

	lines.push("END:VCALENDAR");
	// iCalendar requires CRLF line endings.
	const body = lines.join("\r\n") + "\r\n";

	return new Response(body, {
		headers: {
			"content-type": "text/calendar; charset=utf-8",
			"content-disposition": 'inline; filename="events.ics"',
		},
	});
};
