-- Move the sample performances to real senior living communities near
-- Sammamish 98074 (Redmond / Sammamish, WA) and re-date them around now
-- so the home page shows both recent and upcoming events.
--
-- Rows are UPDATEd in place so existing performance_performers links (by id)
-- stay intact. As of this migration, today is 2026-06-27.

-- id 1 — Upcoming: Aegis Living Redmond
UPDATE performances SET
	title       = 'Summer Afternoon at Aegis Living Redmond',
	slug        = 'summer-aegis-redmond',
	venue       = 'Aegis Living Redmond',
	location    = 'Redmond, WA 98052',
	event_date  = '2026-07-18',
	summary     = 'An afternoon of strings and piano for the Aegis Living Redmond community.',
	description = 'Our ensemble brings a mix of classical and golden-era favorites to the residents of Aegis Living Redmond, closing with a sing-along of the songs they request most.'
WHERE slug = 'spring-recital-sunrise';

-- id 2 — Upcoming: Spiritwood at Pine Lake (Sammamish 98074)
UPDATE performances SET
	title       = 'Garden Concert at Spiritwood at Pine Lake',
	slug        = 'garden-spiritwood-pine-lake',
	venue       = 'Spiritwood at Pine Lake',
	location    = 'Sammamish, WA 98074',
	event_date  = '2026-08-22',
	summary     = 'Outdoor chamber music for the Spiritwood at Pine Lake community in Sammamish.',
	description = 'A relaxed set of duets and trios performed in the Spiritwood at Pine Lake courtyard on a warm late-summer afternoon, with residents and their families joining in on familiar tunes.'
WHERE slug = 'holiday-concert-2025';

-- id 3 — Recent past: Emerald Heights, Redmond
UPDATE performances SET
	title       = 'Spring Recital at Emerald Heights',
	slug        = 'spring-recital-emerald-heights',
	venue       = 'Emerald Heights',
	location    = 'Redmond, WA 98052',
	event_date  = '2026-06-06',
	summary     = 'A spring program of strings and piano at Emerald Heights in Redmond.',
	description = 'Our quartet performed for residents of Emerald Heights, mixing classical pieces with golden-era standards. The afternoon ended with a resident-requested sing-along.'
WHERE slug = 'summer-garden';

-- Upcoming: Fairwinds - Redmond (this row was added via admin, not seed;
-- the UPDATE is a harmless no-op on a fresh database).
UPDATE performances SET
	title       = 'Summer Afternoon at Fairwinds - Redmond',
	slug        = 'summer-afternoon-fairwinds-redmond',
	venue       = 'Fairwinds - Redmond',
	location    = 'Redmond, WA 98052',
	summary     = 'A summer afternoon of music for the Fairwinds - Redmond community.',
	description = 'Our performers share a program of light classical and popular standards with the residents of Fairwinds - Redmond on a summer afternoon.'
WHERE slug = 'summer-afternoon-concert';
