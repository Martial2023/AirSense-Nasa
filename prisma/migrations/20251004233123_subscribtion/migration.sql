-- CreateTable
CREATE TABLE "UserNotification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);
