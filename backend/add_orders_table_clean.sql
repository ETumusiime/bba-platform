-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARENT', 'STUDENT', 'SUPPLIER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PARENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionStatus" TEXT DEFAULT 'trial',
    "trialEndDate" TIMESTAMP(3),
    "trialStartDate" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_details" (
    "id" SERIAL NOT NULL,
    "isbn" TEXT,
    "overview" TEXT,
    "features" TEXT[],
    "contents" TEXT[],
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT,
    "subject" TEXT,
    "code" TEXT,
    "edition" TEXT,
    "isbn" TEXT,
    "markup" DOUBLE PRECISION DEFAULT 0,
    "price" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "cover_url" TEXT,
    "category" TEXT,
    "year" TEXT,
    "type" TEXT,
    "price_gbp" DECIMAL,
    "price_ugx" DECIMAL,
    "level" TEXT,
    "published_date" DATE,
    "format" TEXT,
    "has_digital_access" BOOLEAN DEFAULT true,
    "publisher" TEXT DEFAULT 'Cambridge University Press',
    "grade_year" VARCHAR(20),
    "category_id" INTEGER,
    "author" TEXT,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_isbn" VARCHAR(20) NOT NULL,
    "quantity" INTEGER DEFAULT 1,
    "added_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_lookup" (
    "id" SERIAL NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "category_lookup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parents" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "trial_start_date" DATE DEFAULT CURRENT_DATE,
    "trial_end_date" DATE DEFAULT (CURRENT_DATE + '7 days'::interval),
    "is_trial_used" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "book_details_isbn_unique" ON "book_details"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "books"("isbn");

-- CreateIndex
CREATE INDEX "idx_books_isbn" ON "books"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "category_lookup_category_name_key" ON "category_lookup"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "parents_email_key" ON "parents"("email");

-- AddForeignKey
ALTER TABLE "book_details" ADD CONSTRAINT "book_details_isbn_fkey" FOREIGN KEY ("isbn") REFERENCES "books"("isbn") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category_lookup"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_book_isbn_fkey" FOREIGN KEY ("book_isbn") REFERENCES "books"("isbn") ON DELETE CASCADE ON UPDATE NO ACTION;

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL PRIMARY KEY,
    "parent_name" TEXT NOT NULL,
    "parent_email" TEXT NOT NULL,
    "total_ugx" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "markup_ugx" INTEGER NOT NULL,
    "mallory_share" INTEGER NOT NULL,
    "items_json" TEXT NOT NULL,
    "status" TEXT DEFAULT 'PENDING_PAYMENT',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
