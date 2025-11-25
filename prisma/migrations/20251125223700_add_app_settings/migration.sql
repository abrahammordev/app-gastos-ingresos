-- CreateTable
CREATE TABLE "AppSettings" (
    "id" SERIAL NOT NULL,
    "startDayOfMonth" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);
