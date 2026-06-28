-- Correct the About Us team bios for the two co-founders. The original 0006
-- migration was already applied to remote before its content was fixed, so the
-- corrected names/roles/bios never ran in production. These idempotent UPDATEs
-- bring every environment to the right values.

UPDATE team_members SET
	role = 'Co-Founder',
	bio  = 'Emily co-founded Melody for Medicine in 2026 to connect teen musicians with local seniors. A rising 11th grader at Eastlake High School, she has 10 years of piano experience.'
WHERE name = 'Emily Qi';

UPDATE team_members SET
	role = 'Co-Founder',
	bio  = 'David co-founded Melody for Medicine in 2026. A rising 10th grader, he has 8 years of piano experience.'
WHERE name = 'David';
