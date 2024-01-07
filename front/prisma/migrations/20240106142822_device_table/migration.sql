-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "mac_address" VARCHAR(17) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);
