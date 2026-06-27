-- Multiple gallery photos per performance (in addition to the single cover_key).
CREATE TABLE performance_photos (
	id             INTEGER PRIMARY KEY AUTOINCREMENT,
	performance_id INTEGER NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
	photo_key      TEXT NOT NULL,        -- R2 object key
	caption        TEXT,
	sort_order     INTEGER NOT NULL DEFAULT 0,
	created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_photos_performance ON performance_photos(performance_id, sort_order);
