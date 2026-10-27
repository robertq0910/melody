-- Rename the group from "Melody for Medicine" to "Harmonic Bridges" in any
-- stored content (performer and team bios, performance text).

UPDATE performers    SET bio = REPLACE(bio, 'Melody for Medicine', 'Harmonic Bridges') WHERE bio LIKE '%Melody for Medicine%';
UPDATE team_members  SET bio = REPLACE(bio, 'Melody for Medicine', 'Harmonic Bridges') WHERE bio LIKE '%Melody for Medicine%';
UPDATE performances  SET summary     = REPLACE(summary,     'Melody for Medicine', 'Harmonic Bridges') WHERE summary     LIKE '%Melody for Medicine%';
UPDATE performances  SET description = REPLACE(description, 'Melody for Medicine', 'Harmonic Bridges') WHERE description LIKE '%Melody for Medicine%';
