-- Per-performance order for the line-up (set by dragging on the admin edit page).
-- Existing links start out in each performer's global order, so nothing changes visibly.
ALTER TABLE performance_performers ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE performance_performers
SET sort_order = (SELECT sort_order FROM performers WHERE performers.id = performance_performers.performer_id);
