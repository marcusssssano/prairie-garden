-- Prairie Garden — seed data
-- 14 placeholder plants, no real photos yet (image_url left null —
-- PlantCard renders a generated leaf placeholder in that case).
-- Prices are in centavos (price_cents), PHP.
-- Run after supabase/schema.sql in the Supabase SQL editor.

insert into plants (name, description, price_cents, stock, image_url, category, light_needs, size, care_level)
values
  ('Fiddle Leaf Fig', 'Tall and dramatic, with broad violin-shaped leaves that make a statement in any room.', 150000, 12, null, 'Statement', 'Bright Indirect', 'Large', 'Moderate'),
  ('Golden Pothos', 'A trailing classic that forgives missed waterings and thrives almost anywhere.', 25000, 40, null, 'Foliage', 'Low Light', 'Small', 'Easy'),
  ('Snake Plant', 'Architectural upright leaves and near-indestructible care needs — a great first plant.', 35000, 35, null, 'Foliage', 'Low Light', 'Medium', 'Easy'),
  ('Moon Cactus', 'A vivid grafted cactus topped with a bright pink or yellow crown.', 18000, 28, null, 'Succulent & Cacti', 'Full Sun', 'Small', 'Easy'),
  ('Echeveria Rosette', 'A tidy blue-green rosette that stores water in plump, sculptural leaves.', 15000, 45, null, 'Succulent & Cacti', 'Full Sun', 'Small', 'Easy'),
  ('Peace Lily', 'Glossy dark leaves and elegant white blooms — tells you when it needs water by drooping slightly.', 45000, 22, null, 'Flowering', 'Low Light', 'Medium', 'Moderate'),
  ('African Violet', 'Compact and ever-blooming, with soft fuzzy leaves and clusters of purple flowers.', 28000, 30, null, 'Flowering', 'Bright Indirect', 'Small', 'Fussy'),
  ('Orchid (Phalaenopsis)', 'Long-lasting arching sprays of blooms over glossy strap-like leaves.', 65000, 18, null, 'Flowering', 'Bright Indirect', 'Medium', 'Fussy'),
  ('Tillandsia Ionantha', 'A soil-free air plant that just needs a weekly misting and bright light.', 15000, 60, null, 'Air Plants', 'Bright Indirect', 'Small', 'Easy'),
  ('Tillandsia Xerographica', 'The king of air plants — a slow-growing silvery rosette with curling leaves.', 55000, 15, null, 'Air Plants', 'Bright Indirect', 'Medium', 'Moderate'),
  ('Monstera Deliciosa', 'Iconic split leaves that get more dramatic as the plant matures.', 120000, 20, null, 'Statement', 'Bright Indirect', 'Large', 'Easy'),
  ('Bird of Paradise', 'Broad banana-like leaves on tall stems, built to anchor a bright corner.', 220000, 8, null, 'Statement', 'Full Sun', 'Large', 'Moderate'),
  ('String of Pearls', 'Trailing strands of tiny bead-like leaves, lovely spilling from a hanging pot.', 32000, 25, null, 'Succulent & Cacti', 'Bright Indirect', 'Small', 'Moderate'),
  ('ZZ Plant', 'Waxy, deep green leaves on a plant that tolerates low light and neglect equally well.', 48000, 32, null, 'Foliage', 'Low Light', 'Medium', 'Easy');
