-- Rename the seeded sample performers to the real roster.
-- Matched by their original slug so this is safe to re-run order-wise.

UPDATE performers SET name = 'Emily Qi', slug = 'emily-qi', instrument = 'Piano'  WHERE slug = 'ava-chen';
UPDATE performers SET name = 'David',    slug = 'david',    instrument = 'Piano'  WHERE slug = 'marcus-webb';
UPDATE performers SET name = 'Andrew',   slug = 'andrew',   instrument = 'Violin' WHERE slug = 'sofia-ramirez';
UPDATE performers SET name = 'Olivia',   slug = 'olivia',   instrument = 'Vocal'  WHERE slug = 'liam-park';
