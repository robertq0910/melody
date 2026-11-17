-- Rename the group from "Harmonic Bridges" to "King County Music Collective" in
-- any stored content (performer and team bios, performance text).

UPDATE performers    SET bio = REPLACE(bio, 'Harmonic Bridges', 'King County Music Collective') WHERE bio LIKE '%Harmonic Bridges%';
UPDATE team_members  SET bio = REPLACE(bio, 'Harmonic Bridges', 'King County Music Collective') WHERE bio LIKE '%Harmonic Bridges%';
UPDATE performances  SET summary     = REPLACE(summary,     'Harmonic Bridges', 'King County Music Collective') WHERE summary     LIKE '%Harmonic Bridges%';
UPDATE performances  SET description = REPLACE(description, 'Harmonic Bridges', 'King County Music Collective') WHERE description LIKE '%Harmonic Bridges%';
