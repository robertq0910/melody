-- General contact / inquiry messages from the public contact form.
CREATE TABLE contact_messages (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	name        TEXT NOT NULL,
	email       TEXT NOT NULL,
	subject     TEXT,
	message     TEXT NOT NULL,
	status      TEXT NOT NULL DEFAULT 'new',  -- new | read | replied | archived
	created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_contact_status ON contact_messages(status, created_at DESC);

-- A sample upcoming performance so the "Upcoming" section has content.
-- (The other seeded performances are in the past relative to mid-2026.)
INSERT INTO performances (title, slug, venue, location, event_date, summary, description) VALUES
	('Summer Afternoon Concert', 'summer-afternoon-concert', 'Golden Years Residence', 'Mountain View, CA', '2026-08-15',
	 'An open afternoon concert for residents and families — everyone welcome.',
	 'Our ensemble returns to Golden Years for a relaxed afternoon program of classical and popular favorites. Family and community members of residents are welcome to attend.');
