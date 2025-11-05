ï»¿-- ======================================================
-- Cambridge GO Book Insert Template for BBA Platform
-- ======================================================
-- How to use:
-- 1Ã¯Â¸ÂÃ¢Æ’Â£ Save cover image to D:\BBA Coursebook Images\highres\9781108888073.jpg
-- 2Ã¯Â¸ÂÃ¢Æ’Â£ This file is located at backend\seed\books\9781108888073.sql
-- 3Ã¯Â¸ÂÃ¢Æ’Â£ Run:  psql -U postgres -d bba -f "backend\seed\books\9781108888073.sql"
-- ======================================================

-- === 1. Insert Basic Book Details ===
INSERT INTO books (
  isbn, title, subject, category, level, edition, authors,
  published_date, format, cover_url, price, has_digital_access
) VALUES (
  '9781108888073',  -- ISBN
  'Cambridge IGCSE Physics Coursebook with Digital Access (2 Years)', -- Title
  'Physics',         -- Subject
  'Upper Secondary', -- Category
  'IGCSE',           -- Level
  '3rd Edition',     -- Edition
  'David Sang, Mike Follows, Sheila Tarpey', -- Authors
  '2021-04-01',      -- Published Date (YYYY-MM-DD)
  'Print + Digital', -- Format
  '/covers_highres/9781108888073.jpg',      -- Cover image URL
  85000,             -- Price (UGX)
  TRUE               -- has_digital_access
);

-- === 2. Insert Extended Details ===
INSERT INTO book_details (
  isbn, overview, features, contents
) VALUES (
  '9781108888073',  -- same ISBN

  $OV$
This coursebook provides complete coverage of the Cambridge IGCSEÃ¢â€žÂ¢ Physics syllabus (0625) and is fully endorsed by Cambridge Assessment International Education.
It helps students develop understanding of scientific concepts, builds investigative skills, and encourages critical thinking through engaging examples and exercises.
Each chapter includes clear explanations, worked examples, practice questions, and end-of-chapter exam-style problems to support effective preparation for assessment.
$OV$,

  ARRAY[
    'Endorsed by Cambridge Assessment International Education for full syllabus coverage',
    'Develops studentsÃ¢â‚¬â„¢ scientific enquiry skills through Ã¢â‚¬Å“Experimental SkillsÃ¢â‚¬Â features and practical examples',
    'Includes projects and investigations at the end of chapters to promote collaborative and applied learning',
    'Contains end-of-chapter exam-style questions to build student confidence and exam readiness',
    'Free teacher support materials and answers to all questions are available on Cambridge GO'
  ],

  ARRAY[
    'How to use this series',
    'How to use this book',
    'Introduction',
    '1. Making measurements',
    '2. Describing motion',
    '3. Forces and motion',
    '4. Turning effects of forces',
    '5. Forces and matter',
    '6. Energy transformations and transfers',
    '7. Energy resources',
    '8. Work and power',
    '9. The kinetic model of matter',
    '10. Thermal properties of matter',
    '11. Thermal energy transfers',
    '12. Sound',
    '13. Light',
    '14. Properties of waves',
    '15. The electromagnetic spectrum',
    '16. Magnetism',
    '17. Static electricity',
    '18. Electrical quantities',
    '19. Electrical circuits',
    '20. Electromagnetic forces',
    '21. Electromagnetic induction',
    '22. The nuclear atom',
    '23. Radioactivity',
    '24. Earth and the Solar System',
    '25. Stars and the Universe'
  ]
);
