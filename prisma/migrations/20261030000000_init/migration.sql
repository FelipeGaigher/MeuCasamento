-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'EDITOR');

-- CreateEnum
CREATE TYPE "WeddingStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "EventKind" AS ENUM ('CERIMONIA', 'RECEPCAO', 'NOIVADO', 'CHA', 'OUTRO');

-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('PENDENTE', 'CONFIRMADO', 'RECUSADO');

-- CreateEnum
CREATE TYPE "GiftKind" AS ENUM ('COTA', 'PRODUTO');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CARTAO');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDENTE', 'EM_ANALISE', 'ATIVA', 'RECUSADA');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('PEDIDO_PAGO', 'RSVP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('ENVIADA', 'FALHOU', 'IGNORADA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wedding" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coupleNames" TEXT NOT NULL,
    "status" "WeddingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notifyPhone" TEXT,
    "notifyEmail" TEXT,
    "notifyOnOrder" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnRsvp" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Wedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingMember" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'OWNER',

    CONSTRAINT "WeddingMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "kind" "EventKind" NOT NULL DEFAULT 'CERIMONIA',
    "title" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "venueName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mapsUrl" TEXT,
    "dressCode" TEXT,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "collectionKey" TEXT NOT NULL DEFAULT 'cereja',
    "fontPairKey" TEXT NOT NULL DEFAULT 'classica',
    "sections" JSONB NOT NULL,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "story" TEXT,
    "heroImageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "collectionKey" TEXT NOT NULL DEFAULT 'cereja',
    "pages" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "household" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "maxCompanions" INTEGER NOT NULL DEFAULT 0,
    "group" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rsvp" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "status" "RsvpStatus" NOT NULL DEFAULT 'PENDENTE',
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "Rsvp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gift" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "priceCents" INTEGER NOT NULL,
    "kind" "GiftKind" NOT NULL DEFAULT 'COTA',
    "storeUrl" TEXT,
    "quantity" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "message" TEXT,
    "totalCents" INTEGER NOT NULL,
    "feeCents" INTEGER NOT NULL,
    "coupleCents" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDENTE',
    "method" "PaymentMethod" NOT NULL DEFAULT 'PIX',
    "gatewayId" TEXT,
    "pixCopyPaste" TEXT,
    "pixQrBase64" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "unitCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutAccount" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "asaasAccountId" TEXT,
    "walletId" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDENTE',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "kind" "NotificationKind" NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_provider_eventId_key" ON "WebhookEvent"("provider", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Wedding_slug_key" ON "Wedding"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingMember_weddingId_userId_key" ON "WeddingMember"("weddingId", "userId");

-- CreateIndex
CREATE INDEX "Event_weddingId_idx" ON "Event"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_weddingId_key" ON "SiteSettings"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_weddingId_key" ON "Invitation"("weddingId");

-- CreateIndex
CREATE INDEX "Guest_weddingId_idx" ON "Guest"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "Rsvp_guestId_key" ON "Rsvp"("guestId");

-- CreateIndex
CREATE INDEX "Rsvp_weddingId_idx" ON "Rsvp"("weddingId");

-- CreateIndex
CREATE INDEX "Gift_weddingId_idx" ON "Gift"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_gatewayId_key" ON "Order"("gatewayId");

-- CreateIndex
CREATE INDEX "Order_weddingId_status_idx" ON "Order"("weddingId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Order_weddingId_number_key" ON "Order"("weddingId", "number");

-- CreateIndex
CREATE INDEX "OrderItem_weddingId_idx" ON "OrderItem"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutAccount_weddingId_key" ON "PayoutAccount"("weddingId");

-- CreateIndex
CREATE INDEX "Notification_weddingId_createdAt_idx" ON "Notification"("weddingId", "createdAt");

-- AddForeignKey
ALTER TABLE "WeddingMember" ADD CONSTRAINT "WeddingMember_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingMember" ADD CONSTRAINT "WeddingMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gift" ADD CONSTRAINT "Gift_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutAccount" ADD CONSTRAINT "PayoutAccount_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

