-- Remove Emily Qi's intro from the public Performers page.
UPDATE performers SET bio = NULL WHERE slug = 'emily-qi';
