-- Initial schema for the music-outreach site.
-- All content (performers, performances, team) and all inbound submissions
-- (hosting requests, volunteer applications) live in D1.

-- Performers: the teen musicians featured on the site.
CREATE TABLE performers (
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	name         TEXT NOT NULL,
	slug         TEXT NOT NULL UNIQUE,
	instrument   TEXT,
	bio          TEXT,
	photo_key    TEXT,            -- R2 object key for the headshot
	sort_order   INTEGER NOT NULL DEFAULT 0,
	published    INTEGER NOT NULL DEFAULT 1,  -- 0 = hidden, 1 = visible
	created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Performances: past (and upcoming) events to showcase.
CREATE TABLE performances (
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	title        TEXT NOT NULL,
	slug         TEXT NOT NULL UNIQUE,
	venue        TEXT,            -- e.g. "Sunrise Senior Living"
	location     TEXT,            -- city / area
	event_date   TEXT,            -- ISO date of the performance
	summary      TEXT,            -- short blurb for cards
	description  TEXT,            -- full write-up
	cover_key    TEXT,            -- R2 object key for the cover photo
	published    INTEGER NOT NULL DEFAULT 1,
	created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Many-to-many: which performers played in which performance.
CREATE TABLE performance_performers (
	performance_id INTEGER NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
	performer_id   INTEGER NOT NULL REFERENCES performers(id) ON DELETE CASCADE,
	PRIMARY KEY (performance_id, performer_id)
);

-- Team / leadership for the About Us page.
CREATE TABLE team_members (
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	name         TEXT NOT NULL,
	role         TEXT,            -- e.g. "Founder", "Outreach Lead"
	bio          TEXT,
	photo_key    TEXT,
	sort_order   INTEGER NOT NULL DEFAULT 0,
	created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Inbound: a senior-living/community asking us to perform.
CREATE TABLE hosting_requests (
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	org_name      TEXT NOT NULL,
	contact_name  TEXT NOT NULL,
	email         TEXT NOT NULL,
	phone         TEXT,
	location      TEXT,
	preferred_date TEXT,
	message       TEXT,
	status        TEXT NOT NULL DEFAULT 'new',  -- new | contacted | scheduled | done | declined
	created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Inbound: a teen wanting to volunteer / join.
CREATE TABLE volunteer_applications (
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	name          TEXT NOT NULL,
	email         TEXT NOT NULL,
	phone         TEXT,
	age           INTEGER,
	instrument    TEXT,
	experience    TEXT,
	message       TEXT,
	status        TEXT NOT NULL DEFAULT 'new',  -- new | reviewing | accepted | declined
	created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_performances_date ON performances(event_date DESC);
CREATE INDEX idx_hosting_status ON hosting_requests(status, created_at DESC);
CREATE INDEX idx_volunteer_status ON volunteer_applications(status, created_at DESC);
