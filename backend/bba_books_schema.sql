-- BBA Books Table Schema (v2)

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,

    -- Basic book information
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    publisher VARCHAR(255),
    edition VARCHAR(100),
    isbn VARCHAR(50),

    -- Classification details
    subject VARCHAR(100),
    curriculum_level VARCHAR(100),
    code VARCHAR(50),

    -- Pricing and business details
    base_price NUMERIC(10,2),
    markup NUMERIC(5,2) DEFAULT 0,
    final_price NUMERIC(10,2),

    -- Stock & availability
    available_stock INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',

    -- File & image data
    cover_image_url TEXT,
    pdf_catalogue_page INT,
    pdf_extract_path TEXT,

    -- System tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_modtime
BEFORE UPDATE ON books
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
