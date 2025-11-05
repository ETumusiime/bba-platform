-- ======================================================
-- Cambridge GO Book Insert Template for BBA Platform
-- ======================================================
-- How to use:
-- 1?? Save cover image to D:\BBA Coursebook Images\highres\978XXXXXXXXXXX.jpg
-- 2?? Copy this file to backend\seed\books\978XXXXXXXXXXX.sql
-- 3?? Replace all placeholders with real data from Cambridge GO
-- 4?? Run:  psql -U postgres -d bba -f ""backend\seed\books\978XXXXXXXXXXX.sql""
-- ======================================================

-- === 1. Insert Basic Book Details ===
INSERT INTO books (
  isbn, title, subject, category, level, edition, authors,
  published_date, format, cover_url, price, has_digital_access
) VALUES (
  '978XXXXXXXXXXX',  -- ISBN
  'Cambridge IGCSE Physics Coursebook with Digital Access (2 Years)', -- Title
  'Physics',         -- Subject
  'Upper Secondary', -- Category
  'IGCSE',           -- Level
  '3rd Edition',     -- Edition
  'David Sang, Mike Follows, Sheila Tarpey', -- Authors
  '2021-04-01',      -- Published Date (YYYY-MM-DD)
  'Print + Digital', -- Format
  '/covers_highres/978XXXXXXXXXXX.jpg',      -- Cover image URL
  85000,             -- Price (UGX)
  TRUE               -- has_digital_access
);

-- === 2. Insert Extended Details ===
INSERT INTO book_details (
  isbn, overview, features, contents
) VALUES (
  '978XXXXXXXXXXX',  -- same ISBN

  $
Paste the full Overview paragraph from Cambridge GO here.
$,

  ARRAY[
    'Paste each Feature bullet as a single-quoted string',
    'Separate each with a comma',
    'Do not remove the ARRAY[ ... ] wrapper'
  ],

  ARRAY[
    'Paste each Contents chapter as a single-quoted string',
    'e.g., 1. Making measurements',
    'e.g., 2. Describing motion',
    '…and so on'
  ]
);
