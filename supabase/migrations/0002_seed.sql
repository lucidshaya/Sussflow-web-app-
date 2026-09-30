-- Sussflow catalogue seed — the current price list (prices in kobo).
-- Image paths point at the bundled storefront images (/images/*); replace them
-- from the admin dashboard by uploading to the product-images bucket.

insert into public.settings (id) values (1) on conflict (id) do nothing;

insert into public.categories (name, slug, description, sort) values
  ('Reusable Pads',          'reusable-pads',   'A smarter alternative to disposable sanitary pads.', 1),
  ('Pantyliners & Interlabial', 'liners',       'Everyday care for lighter days and extra protection.', 2),
  ('Period Underwear',       'period-underwear','Period protection without the feel of a traditional pad.', 3),
  ('Menstrual Cups',         'menstrual-cups',  'Reusable period care that goes with you.', 4),
  ('Cup Care',               'cup-care',        'Companions for menstrual cup care.', 5),
  ('Health & Preparedness',  'preparedness',    'Because menstrual care is more than a product.', 6),
  ('Bundles',                'bundles',         'Bundles designed around different period-care journeys.', 7)
on conflict (slug) do nothing;

-- Products ------------------------------------------------------------------
insert into public.products (category_id, name, slug, tagline, short_detail, description, perfect_for, image_url, is_active, featured, sort)
select c.id, v.name, v.slug, v.tagline, v.short_detail, v.description, v.perfect_for, v.image_url, v.is_active, v.featured, v.sort
from (values
  ('reusable-pads', 'Reusable Menstrual Pads', 'reusable-menstrual-pads',
   'A smarter alternative to disposable sanitary pads.',
   'Choose your length & pack · up to 100 washes',
   'For women and girls who want familiar period care with less waste and more reuse. Our reusable menstrual pads come in different lengths and absorbency levels to support different flow days. Use → rinse → wash → air-dry → reuse. With proper care they last up to 100 washes or about 2 years. Pad packs come in mixed colours. Our reusable sanitary pad line is SON certified.',
   'Pad lovers, heavy-flow days (14" or 16"), postpartum mums (16") and anyone switching from disposable pads.',
   '/images/pads.jpg', true, true, 1),
  ('liners', 'Reusable Pantyliners', 'reusable-pantyliners',
   'Everyday menstrual care for lighter days.',
   '5-pack · light flow & everyday freshness',
   'For lighter flow, everyday freshness and the moments between periods.',
   'Light days, spotting and everyday freshness.',
   '/images/pads.jpg', true, false, 2),
  ('liners', 'Interlabial Pads', 'interlabial-pads',
   'Additional protection for personalised period care.',
   '5-pack · complements your routine',
   'Designed to complement your existing menstrual care routine.',
   'Anyone who wants extra, personalised protection.',
   '/images/pads.jpg', true, false, 3),
  ('period-underwear', 'Period Underwear', 'period-underwear',
   'Period protection without the feel of a traditional pad.',
   'Comfortable · Discreet · Reusable · Black',
   'A practical option for women looking for an alternative to disposable sanitary pads. Wear for up to 8 hours depending on your flow. Lasts up to 3 years with proper care. Currently available in black. For extra-heavy flow, pair it with a reusable pad. We recommend starting with 3–4 pairs.',
   'Women who want pad-free protection that feels like normal underwear.',
   '/images/underwear.jpg', true, true, 4),
  ('menstrual-cups', 'Menstrual Cup', 'menstrual-cup',
   'Reusable period care that goes with you.',
   'Medical-grade silicone · up to 12hr wear · 5–10 years',
   'For women ready to explore a long-lasting alternative to disposable menstrual products. Made with medical-grade silicone and designed for years of use when properly cared for — approximately 5–10 years. Can generally be worn for up to 12 hours depending on your flow. Sterilize before first use.',
   'First-time cup users and women looking for long-term reusable period care.',
   '/images/cup.jpg', true, true, 5),
  ('cup-care', 'Cup Sister', 'cup-sister',
   'New to menstrual cups?',
   'Your transition companion',
   'A practical companion designed to make your transition into cup care easier.',
   'New cup users.',
   '/images/cup.jpg', true, false, 6),
  ('cup-care', 'Cup Mate', 'cup-mate',
   'Your simple companion for menstrual cup care.',
   'Simple everyday cup care',
   'Your simple companion for menstrual cup care.',
   'Every cup user.',
   '/images/cup.jpg', true, false, 7),
  ('cup-care', 'Menstrual Cup Sterilizer', 'menstrual-cup-sterilizer',
   'Care for your cup before and after your cycle.',
   'Sterilize between cycles',
   'A practical solution for caring for your menstrual cup before and after your cycle.',
   'Every cup user.',
   '/images/cup.jpg', true, false, 8),
  ('preparedness', 'My Period Record Book', 'my-period-record-book',
   'Understand your cycle. Record your period. Know your pattern.',
   'Offline menstrual health tracker',
   'A simple offline menstrual health tracker designed to help girls record their periods, notice patterns and build healthy cycle-awareness habits.',
   'Girls ages 13–18, parents, schools and menstrual health programmes.',
   '/images/kit.jpg', true, true, 9),
  -- Items without a published price are seeded as inactive drafts: set a price in the dashboard, then activate.
  ('preparedness', 'Back-to-School Kit', 'back-to-school-kit',
   'Because period days don''t stop when school resumes.',
   '1 period underwear · carry-on pouch · mini wipes',
   'A compact period-emergency kit to help girls feel prepared and confident managing their periods at school and away from home. Contains one period underwear, one carry-on pouch and mini wipes.',
   'Students, parents, schools and organisations supporting adolescent girls.',
   '/images/kit.jpg', false, false, 10),
  ('bundles', 'The Curious Switcher', 'the-curious-switcher',
   '“I know I want to switch. I just don''t know what suits me yet.”',
   'A carefully selected introduction to reusable care',
   'You''ve been thinking about moving away from disposable sanitary pads, but you don''t want to make a big leap without understanding your options. Start here — a carefully selected introduction to reusable menstrual care designed to help you discover what works for you.',
   'First-time switchers, beginners and anyone exploring reusable menstrual products.',
   '/images/kit.jpg', false, false, 11),
  ('bundles', 'The Pad Girl', 'the-pad-girl',
   '“Give me a pad. Just make it reusable.”',
   'A practical reusable pad setup',
   'You''re comfortable with pads, you don''t want to insert anything, and you''re ready for a long-term alternative to disposable sanitary pads. A practical reusable pad setup designed to support different days of your cycle.',
   'Pad lovers, comfort-first customers and women making the switch from disposable pads.',
   '/images/pads.jpg', false, false, 12),
  ('bundles', 'The Cup Convert', 'the-cup-convert',
   '“I''m ready for freedom.”',
   'Menstrual cup + essential cup care',
   'You''ve done the research. You''re ready to try a menstrual cup — or you already know cups are your thing. This bundle brings together your menstrual cup and essential cup-care products.',
   'First-time cup users and women looking for long-term reusable period care.',
   '/images/cup.jpg', false, false, 13),
  ('bundles', 'The Period Peace Kit', 'the-period-peace-kit',
   '“I don''t want to think about my period every month.”',
   'Different flow days. One thoughtful setup.',
   'You want your period care sorted. Different flow days. Different situations. One thoughtful setup. This is your “I''ve got this” period-care kit.',
   'Busy women, students, working professionals, travellers and anyone building a dependable period-care routine.',
   '/images/kit.jpg', false, false, 14),
  ('bundles', 'The First Period Box', 'the-first-period-box',
   '“I want her first period to feel normal — not scary.”',
   'Care, education & tools for up to 3 years',
   'For parents, guardians and loved ones preparing a young girl for menstruation. The First Period Box combines practical menstrual care, education and useful tools to help her understand menstruation and navigate her first periods with confidence — supporting her journey for up to 3 years depending on usage. You can add products to the box; standard items cannot be removed.',
   'Daughters, nieces, sisters, students and girls preparing for their first period.',
   '/images/kit.jpg', false, false, 15)
) as v(cat, name, slug, tagline, short_detail, description, perfect_for, image_url, is_active, featured, sort)
join public.categories c on c.slug = v.cat
on conflict (slug) do nothing;

-- Variants (price list) ------------------------------------------------------
insert into public.product_variants (product_id, length_label, pack_size, price, stock, sku, sort)
select p.id, v.length_label, v.pack_size, v.price * 100, v.stock, v.sku, v.sort
from (values
  -- Reusable pads: 16"
  ('reusable-menstrual-pads', '16"', 3,  7800, 50, 'PAD-16-3',  1),
  ('reusable-menstrual-pads', '16"', 5,  15500, 50, 'PAD-16-5', 2),
  ('reusable-menstrual-pads', '16"', 10, 22000, 50, 'PAD-16-10', 3),
  -- 14"
  ('reusable-menstrual-pads', '14"', 3,  7200, 50, 'PAD-14-3',  4),
  ('reusable-menstrual-pads', '14"', 5,  14500, 50, 'PAD-14-5', 5),
  ('reusable-menstrual-pads', '14"', 10, 20000, 50, 'PAD-14-10', 6),
  -- 12"
  ('reusable-menstrual-pads', '12"', 3,  5700, 50, 'PAD-12-3',  7),
  ('reusable-menstrual-pads', '12"', 5,  10500, 50, 'PAD-12-5', 8),
  ('reusable-menstrual-pads', '12"', 10, 15000, 50, 'PAD-12-10', 9),
  -- 10"
  ('reusable-menstrual-pads', '10"', 3,  5700, 50, 'PAD-10-3',  10),
  ('reusable-menstrual-pads', '10"', 5,  10500, 50, 'PAD-10-5', 11),
  ('reusable-menstrual-pads', '10"', 10, 15000, 50, 'PAD-10-10', 12),
  -- 8" (5-in-1 only)
  ('reusable-menstrual-pads', '8"', 5, 5000, 50, 'PAD-8-5', 13),
  -- 6" (5-in-1 only)
  ('reusable-menstrual-pads', '6"', 5, 3500, 50, 'PAD-6-5', 14),
  -- Pantyliners & interlabial (5-in-1 only)
  ('reusable-pantyliners', null, 5, 3500, 50, 'LINER-5', 1),
  ('interlabial-pads',     null, 5, 3500, 50, 'INTERLABIAL-5', 1),
  -- Singles
  ('period-underwear',          null, 1, 15000, 30, 'UNDERWEAR-BLK', 1),
  ('menstrual-cup',             null, 1, 12000, 30, 'CUP-1', 1),
  ('cup-sister',                null, 1, 10000, 30, 'CUP-SISTER', 1),
  ('cup-mate',                  null, 1, 8000,  30, 'CUP-MATE', 1),
  ('menstrual-cup-sterilizer',  null, 1, 8000,  30, 'CUP-STERILIZER', 1),
  ('my-period-record-book',     null, 1, 3000,  100, 'RECORD-BOOK', 1)
) as v(product_slug, length_label, pack_size, price, stock, sku, sort)
join public.products p on p.slug = v.product_slug
on conflict (sku) do nothing;
