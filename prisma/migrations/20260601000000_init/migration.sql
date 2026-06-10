-- ============================================================
-- Baseline migration — representa o estado inicial do banco
-- criado via prisma db push. Este arquivo NÃO deve ser
-- executado no banco existente; use:
--   npx prisma migrate resolve --applied 20260601000000_init
-- Em bancos novos, prisma migrate deploy o executa normalmente.
-- ============================================================

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
    "name"         TEXT         NOT NULL,
    "email"        TEXT         NOT NULL,
    "passwordHash" TEXT         NOT NULL,
    "role"         "Role"       NOT NULL DEFAULT 'EDITOR',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authors" (
    "id"        UUID         NOT NULL DEFAULT gen_random_uuid(),
    "name"      TEXT         NOT NULL,
    "slug"      TEXT         NOT NULL,
    "bio"       TEXT,
    "avatarUrl" TEXT,
    "role"      TEXT,
    "active"    BOOLEAN      NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
    "name"        TEXT         NOT NULL,
    "slug"        TEXT         NOT NULL,
    "description" TEXT,
    "order"       INTEGER      NOT NULL DEFAULT 0,
    "active"      BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id"                UUID            NOT NULL DEFAULT gen_random_uuid(),
    "title"             TEXT            NOT NULL,
    "slug"              TEXT            NOT NULL,
    "chapeu"            TEXT,
    "lead"              TEXT,
    "body"              TEXT            NOT NULL,
    "coverImageUrl"     TEXT,
    "coverImageCaption" TEXT,
    "status"            "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "breaking"          BOOLEAN         NOT NULL DEFAULT false,
    "views"             INTEGER         NOT NULL DEFAULT 0,
    "publishedAt"       TIMESTAMP(3),
    "createdAt"         TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3)    NOT NULL,
    "authorId"          UUID            NOT NULL,
    "categoryId"        UUID            NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_images" (
    "id"        UUID         NOT NULL DEFAULT gen_random_uuid(),
    "url"       TEXT         NOT NULL,
    "caption"   TEXT,
    "order"     INTEGER      NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" UUID         NOT NULL,

    CONSTRAINT "article_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_slots" (
    "id"        UUID         NOT NULL DEFAULT gen_random_uuid(),
    "slotKey"   TEXT         NOT NULL,
    "articleId" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id"        UUID         NOT NULL DEFAULT gen_random_uuid(),
    "key"       TEXT         NOT NULL,
    "value"     TEXT         NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "authors_slug_key" ON "authors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "featured_slots_slotKey_key" ON "featured_slots"("slotKey");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "authors"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_images" ADD CONSTRAINT "article_images_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "articles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_slots" ADD CONSTRAINT "featured_slots_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "articles"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
