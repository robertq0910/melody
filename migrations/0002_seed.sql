-- Sample content so the public pages render before any admin editing.
-- Safe to delete these rows once real content exists.

INSERT INTO performers (name, slug, instrument, bio, sort_order) VALUES
	('Ava Chen',      'ava-chen',      'Violin',  'A junior who has played violin for ten years and loves bringing classical favorites to new audiences.', 1),
	('Marcus Webb',   'marcus-webb',   'Piano',   'Pianist and the group''s arranger, Marcus adapts pop and jazz standards for our small ensembles.', 2),
	('Sofia Ramirez', 'sofia-ramirez', 'Cello',   'Sofia joined in her freshman year and has performed at over a dozen senior communities.', 3),
	('Liam Park',     'liam-park',     'Flute',   'Liam founded the woodwind trio and coordinates rehearsals.', 4);

INSERT INTO performances (title, slug, venue, location, event_date, summary, description) VALUES
	('Spring Recital at Sunrise', 'spring-recital-sunrise', 'Sunrise Senior Living', 'Fremont, CA', '2026-04-12',
	 'An afternoon of strings and piano for the Sunrise community.',
	 'Our quartet performed a mix of classical and golden-era favorites for about forty residents and their families. The afternoon closed with a sing-along the residents requested.'),
	('Holiday Concert', 'holiday-concert-2025', 'Maplewood Commons', 'San Jose, CA', '2025-12-18',
	 'Seasonal music and carols at Maplewood Commons.',
	 'Eight performers split into two ensembles for a holiday program of carols and light classical pieces, with residents joining in on the familiar tunes.'),
	('Summer Garden Performance', 'summer-garden', 'Lakeview Retirement', 'Palo Alto, CA', '2025-07-09',
	 'Outdoor chamber music in the Lakeview garden.',
	 'A relaxed outdoor set of duets and trios performed in the Lakeview garden courtyard on a warm summer evening.');

INSERT INTO performance_performers (performance_id, performer_id) VALUES
	(1, 1), (1, 2), (1, 3),
	(2, 1), (2, 2), (2, 3), (2, 4),
	(3, 2), (3, 4);

INSERT INTO team_members (name, role, bio, sort_order) VALUES
	('Ava Chen',    'Founder & President', 'Ava started the group in 2024 to connect teen musicians with local seniors.', 1),
	('Liam Park',   'Outreach Coordinator', 'Liam books performances and is the main contact for host communities.', 2),
	('Marcus Webb', 'Music Director',       'Marcus organizes repertoire and leads rehearsals.', 3);
