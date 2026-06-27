-- Trim the roster to the real performers and rename the About Us team.
-- Keep only Emily Qi and David as performers; remove Andrew and Olivia.
-- Replace the sample team members (Ava Chen, Liam Park, Marcus Webb) with Emily Qi and David.

-- Remove Andrew and Olivia from any performances they were linked to, then delete them.
DELETE FROM performance_performers
WHERE performer_id IN (SELECT id FROM performers WHERE slug IN ('andrew', 'olivia'));

DELETE FROM performers WHERE slug IN ('andrew', 'olivia');

-- Rename the About Us team to Emily Qi and David (co-founders), and drop the extra third member.
UPDATE team_members
SET name = 'Emily Qi',
    role = 'Co-Founder',
    bio  = 'Emily co-founded Melody for Medicine in 2026 to connect teen musicians with local seniors. A rising 11th grader at Eastlake High School, she has 10 years of piano experience.'
WHERE name = 'Ava Chen';

UPDATE team_members
SET name = 'David',
    role = 'Co-Founder',
    bio  = 'David co-founded Melody for Medicine in 2026. A rising 10th grader, he has 8 years of piano experience.'
WHERE name = 'Marcus Webb';

DELETE FROM team_members WHERE name = 'Liam Park';
