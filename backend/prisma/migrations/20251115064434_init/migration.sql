-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARENT', 'STUDENT', 'SUPPLIER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

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
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "parent_name" TEXT NOT NULL,
    "parent_email" TEXT NOT NULL,
    "total_ugx" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "markup_ugx" INTEGER NOT NULL,
    "mallory_share" INTEGER NOT NULL,
    "items_json" TEXT NOT NULL,
    "status" TEXT DEFAULT 'PENDING_PAYMENT',
    "tx_ref" TEXT,
    "payment_link" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "ChildUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" TEXT DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildAssignment" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "providerUrl" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderTag" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "addressLine" TEXT,
    "grandTotalUGX" INTEGER NOT NULL,
    "markupUGX" INTEGER NOT NULL,
    "fixedFeeUGX" INTEGER NOT NULL,
    "baseTotalUGX" INTEGER NOT NULL,
    "malloryUGX" INTEGER NOT NULL,
    "malloryGBP" DECIMAL(10,2) NOT NULL,
    "fxRateUGXtoGBP" DECIMAL(10,4) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "flutterwaveTxId" TEXT,
    "flutterwaveTxRef" TEXT,
    "flutterwaveStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "basePriceUGX" INTEGER NOT NULL,
    "retailPriceUGX" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentBook" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessCodeRaw" TEXT NOT NULL,
    "providerLink" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentBook_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "orders_tx_ref_key" ON "orders"("tx_ref");

-- CreateIndex
CREATE UNIQUE INDEX "parents_email_key" ON "parents"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ChildUser_username_key" ON "ChildUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderTag_key" ON "Order"("orderTag");

-- AddForeignKey
ALTER TABLE "book_details" ADD CONSTRAINT "book_details_isbn_fkey" FOREIGN KEY ("isbn") REFERENCES "books"("isbn") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category_lookup"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_book_isbn_fkey" FOREIGN KEY ("book_isbn") REFERENCES "books"("isbn") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChildAssignment" ADD CONSTRAINT "ChildAssignment_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBook" ADD CONSTRAINT "StudentBook_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
