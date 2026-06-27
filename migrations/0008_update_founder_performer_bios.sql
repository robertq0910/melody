-- Replace the leftover sample performer bios for the two co-founders with
-- accurate intros (matching the About Us team bios). Emily plays piano (not
-- violin), and David's bio no longer references the old sample name "Marcus".

UPDATE performers SET
	instrument = 'Piano',
	bio = 'Co-founder of Melody for Medicine and a rising 11th grader at Eastlake High School. Emily has played piano for 10 years and loves sharing classical favorites with new audiences.'
WHERE slug = 'emily-qi';

UPDATE performers SET
	instrument = 'Piano',
	bio = 'Co-founder of Melody for Medicine and a rising 10th grader. David has 8 years of piano experience.'
WHERE slug = 'david';
