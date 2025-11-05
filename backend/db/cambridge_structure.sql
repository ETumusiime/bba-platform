-- =========================================================
-- BBA Cambridge GO–style schema
-- =========================================================

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  isbn TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subject TEXT,
  category TEXT,
  level TEXT,
  edition TEXT,
  authors TEXT,
  published_date DATE,
  format TEXT,
  cover_url TEXT,
  price NUMERIC,
  has_digital_access BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_details (
  id SERIAL PRIMARY KEY,
  isbn TEXT REFERENCES books(isbn) ON DELETE CASCADE,
  overview TEXT,
  features TEXT[],
  contents TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- helpful indexes
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_tsv
  ON books USING gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(subject,'') || ' ' || coalesce(level,'') || ' ' || coalesce(isbn,'')));
