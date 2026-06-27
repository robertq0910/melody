// Typed access to the D1 database and shared row types.
// Every dynamic page/endpoint gets the binding via `Astro.locals.runtime.env.DB`.

export interface Performer {
	id: number;
	name: string;
	slug: string;
	instrument: string | null;
	bio: string | null;
	photo_key: string | null;
	sort_order: number;
	published: number;
	created_at: string;
}

export interface Performance {
	id: number;
	title: string;
	slug: string;
	venue: string | null;
	location: string | null;
	event_date: string | null;
	summary: string | null;
	description: string | null;
	cover_key: string | null;
	published: number;
	created_at: string;
}

export interface TeamMember {
	id: number;
	name: string;
	role: string | null;
	bio: string | null;
	photo_key: string | null;
	sort_order: number;
	created_at: string;
}

export interface HostingRequest {
	id: number;
	org_name: string;
	contact_name: string;
	email: string;
	phone: string | null;
	location: string | null;
	preferred_date: string | null;
	message: string | null;
	status: string;
	created_at: string;
}

export interface VolunteerApplication {
	id: number;
	name: string;
	email: string;
	phone: string | null;
	age: number | null;
	instrument: string | null;
	experience: string | null;
	message: string | null;
	status: string;
	created_at: string;
}

export interface PerformancePhoto {
	id: number;
	performance_id: number;
	photo_key: string;
	caption: string | null;
	sort_order: number;
	created_at: string;
}

export interface ContactMessage {
	id: number;
	name: string;
	email: string;
	subject: string | null;
	message: string;
	status: string;
	created_at: string;
}

export function getDb(locals: App.Locals): D1Database {
	const db = locals.runtime?.env?.DB;
	if (!db) {
		throw new Error(
			"D1 binding `DB` is missing. Run `wrangler d1 migrations apply melody-db --local` and start via `astro dev` or `wrangler dev`.",
		);
	}
	return db;
}

// ---- Public reads -------------------------------------------------------

export async function listPerformers(db: D1Database): Promise<Performer[]> {
	const { results } = await db
		.prepare("SELECT * FROM performers WHERE published = 1 ORDER BY sort_order, name")
		.all<Performer>();
	return results ?? [];
}

export async function listPerformances(db: D1Database): Promise<Performance[]> {
	const { results } = await db
		.prepare(
			"SELECT * FROM performances WHERE published = 1 ORDER BY event_date DESC, created_at DESC",
		)
		.all<Performance>();
	return results ?? [];
}

const TODAY = "date('now')";

// Upcoming = published, dated, and on/after today — soonest first.
export async function listUpcomingPerformances(db: D1Database): Promise<Performance[]> {
	const { results } = await db
		.prepare(
			`SELECT * FROM performances
			 WHERE published = 1 AND event_date IS NOT NULL AND date(event_date) >= ${TODAY}
			 ORDER BY date(event_date) ASC`,
		)
		.all<Performance>();
	return results ?? [];
}

// Past = published and either before today or undated — most recent first.
export async function listPastPerformances(db: D1Database): Promise<Performance[]> {
	const { results } = await db
		.prepare(
			`SELECT * FROM performances
			 WHERE published = 1 AND (event_date IS NULL OR date(event_date) < ${TODAY})
			 ORDER BY event_date DESC, created_at DESC`,
		)
		.all<Performance>();
	return results ?? [];
}

export async function getPerformanceBySlug(
	db: D1Database,
	slug: string,
): Promise<Performance | null> {
	return db
		.prepare("SELECT * FROM performances WHERE slug = ? AND published = 1")
		.bind(slug)
		.first<Performance>();
}

export async function getPerformerById(db: D1Database, id: number): Promise<Performer | null> {
	return db.prepare("SELECT * FROM performers WHERE id = ?").bind(id).first<Performer>();
}

export async function getPerformanceById(
	db: D1Database,
	id: number,
): Promise<Performance | null> {
	return db.prepare("SELECT * FROM performances WHERE id = ?").bind(id).first<Performance>();
}

// IDs of performers linked to a performance (for pre-selecting the edit form).
export async function performerIdsForPerformance(
	db: D1Database,
	performanceId: number,
): Promise<number[]> {
	const { results } = await db
		.prepare("SELECT performer_id FROM performance_performers WHERE performance_id = ?")
		.bind(performanceId)
		.all<{ performer_id: number }>();
	return (results ?? []).map((r) => r.performer_id);
}

export async function listPerformancePhotos(
	db: D1Database,
	performanceId: number,
): Promise<PerformancePhoto[]> {
	const { results } = await db
		.prepare(
			"SELECT * FROM performance_photos WHERE performance_id = ? ORDER BY sort_order, id",
		)
		.bind(performanceId)
		.all<PerformancePhoto>();
	return results ?? [];
}

export async function performersForPerformance(
	db: D1Database,
	performanceId: number,
): Promise<Performer[]> {
	const { results } = await db
		.prepare(
			`SELECT p.* FROM performers p
			 JOIN performance_performers pp ON pp.performer_id = p.id
			 WHERE pp.performance_id = ? AND p.published = 1
			 ORDER BY p.sort_order, p.name`,
		)
		.bind(performanceId)
		.all<Performer>();
	return results ?? [];
}

export async function listTeam(db: D1Database): Promise<TeamMember[]> {
	const { results } = await db
		.prepare("SELECT * FROM team_members ORDER BY sort_order, name")
		.all<TeamMember>();
	return results ?? [];
}

// ---- Admin reads --------------------------------------------------------

export async function listHostingRequests(db: D1Database): Promise<HostingRequest[]> {
	const { results } = await db
		.prepare("SELECT * FROM hosting_requests ORDER BY created_at DESC")
		.all<HostingRequest>();
	return results ?? [];
}

export async function listVolunteerApplications(
	db: D1Database,
): Promise<VolunteerApplication[]> {
	const { results } = await db
		.prepare("SELECT * FROM volunteer_applications ORDER BY created_at DESC")
		.all<VolunteerApplication>();
	return results ?? [];
}

export async function listContactMessages(db: D1Database): Promise<ContactMessage[]> {
	const { results } = await db
		.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC")
		.all<ContactMessage>();
	return results ?? [];
}

export async function countNew(
	db: D1Database,
): Promise<{ hosting: number; volunteer: number; contact: number }> {
	const hosting = await db
		.prepare("SELECT COUNT(*) AS n FROM hosting_requests WHERE status = 'new'")
		.first<{ n: number }>();
	const volunteer = await db
		.prepare("SELECT COUNT(*) AS n FROM volunteer_applications WHERE status = 'new'")
		.first<{ n: number }>();
	const contact = await db
		.prepare("SELECT COUNT(*) AS n FROM contact_messages WHERE status = 'new'")
		.first<{ n: number }>();
	return { hosting: hosting?.n ?? 0, volunteer: volunteer?.n ?? 0, contact: contact?.n ?? 0 };
}
