-- Apex Fitness Club — starter content.
-- Real: business name, address, phone, email and the four confirmed program names.
-- Everything else is a clearly marked placeholder (is_placeholder = 1 or NULL values).
-- No prices, schedule sessions, trainers, testimonials or opening hours are invented.

INSERT OR REPLACE INTO settings (key, value) VALUES
  ('site.name',         'Apex Fitness Club'),
  ('site.tagline',      'Built to move. Driven to be stronger.'),
  ('contact.phone',     '+1 (309) 657-6728'),
  ('contact.phoneHref', '+13096576728'),
  ('contact.email',     'apexfitnessclub@gmail.com'),
  ('contact.street',    '3627 River Avenue'),
  ('contact.city',      'Napa, CA 94559'),
  ('contact.country',   'USA'),
  ('contact.mapQuery',  '3627 River Avenue, Napa, CA 94559'),
  ('club.story',        ''),
  ('privacy.url',       '');

INSERT INTO programs (slug, name, summary, details, image, accent, sort_order, is_placeholder) VALUES
  ('strength', 'Strength Training', 'Build power and resilience through progressive resistance training.', '[How strength training works at Apex — who it''s for, what a session looks like, and any confirmed benefits.]', '/art/scene-barbell.svg', 'lime',   1, 1),
  ('cardio',   'Cardio Training',   'Build endurance and keep your heart working for you.',                 '[How cardio training works at Apex — who it''s for, what a session looks like, and any confirmed benefits.]', '/art/scene-cardio.svg',  'lime',   2, 1),
  ('group',    'Group Classes',     'Train alongside others and feed off the energy of the room.',          '[Which group classes run at Apex, their style and level — added once confirmed.]',                           '/art/scene-group.svg',   'orange', 3, 1),
  ('personal', 'Personal Training', 'One-to-one coaching focused on your goals and your pace.',             '[How personal training is arranged at Apex — booking, session structure and coaching approach.]',           '/art/scene-coach.svg',   'lime',   4, 1);

INSERT INTO plans (slug, name, price_cents, billing, facilities, services, benefits, sort_order, is_placeholder) VALUES
  ('plan-a', '[Plan A]', NULL, '[billing frequency]', '["[Included facilities]"]', '["[Included services]"]', '["[Membership benefits]"]', 1, 1),
  ('plan-b', '[Plan B]', NULL, '[billing frequency]', '["[Included facilities]"]', '["[Included services]"]', '["[Membership benefits]"]', 2, 1),
  ('plan-c', '[Plan C]', NULL, '[billing frequency]', '["[Included facilities]"]', '["[Included services]"]', '["[Membership benefits]"]', 3, 1);

INSERT INTO benefits (title, detail, icon, sort_order, is_placeholder) VALUES
  ('[Facility access]',           'To be confirmed', 'access', 1, 1),
  ('[Group class access]',        'To be confirmed', 'group',  2, 1),
  ('[Access hours]',              'To be confirmed', 'clock',  3, 1),
  ('[Personal training options]', 'To be confirmed', 'coach',  4, 1);

INSERT INTO facilities (name, description, image, sort_order, is_placeholder) VALUES
  ('[Main training floor]',  '[Short description once confirmed]', '/art/scene-space.svg',      1, 1),
  ('[Strength area]',        '', '/art/scene-barbell.svg',    2, 1),
  ('[Cardio area]',          '', '/art/scene-rower.svg',      3, 1),
  ('[Group training space]', '', '/art/scene-group.svg',      4, 1),
  ('[Training equipment]',   '', '/art/scene-dumbbells.svg',  5, 1);

INSERT INTO gallery_images (title, category, image, alt, ratio, featured, sort_order, is_placeholder) VALUES
  ('[Training floor]',        'Training Environment', '/art/scene-space.svg',      'Graphic of an open training floor with a rig', '4 / 5', 0, 1, 1),
  ('[Barbell station]',       'Strength Training',    '/art/scene-barbell.svg',    'Graphic of a loaded barbell on a rack',        '4 / 3', 1, 2, 1),
  ('[Dumbbell rack]',         'Gym Equipment',        '/art/scene-dumbbells.svg',  'Graphic of a dumbbell rack',                   '1 / 1', 0, 3, 1),
  ('[Cardio equipment]',      'Cardio',               '/art/scene-cardio.svg',     'Graphic of a treadmill',                       '4 / 3', 0, 4, 1),
  ('[Group training space]',  'Group Activities',     '/art/scene-group.svg',      'Graphic of mats, steps and an interval timer', '3 / 4', 1, 5, 1),
  ('[Kettlebells]',           'Gym Equipment',        '/art/scene-kettlebell.svg', 'Graphic of kettlebells',                       '4 / 3', 0, 6, 1),
  ('[Rowing machine]',        'Cardio',               '/art/scene-rower.svg',      'Graphic of a rowing machine',                  '1 / 1', 1, 7, 1),
  ('[Coaching corner]',       'Training Environment', '/art/scene-coach.svg',      'Graphic of a clipboard and stopwatch',         '4 / 5', 0, 8, 1);

INSERT INTO hours (label, value, sort_order) VALUES
  ('Monday – Friday', NULL, 1),
  ('Saturday',        NULL, 2),
  ('Sunday',          NULL, 3),
  ('Holidays',        NULL, 4);
