/*
  Warnings:

  - A unique constraint covering the columns `[mac_address]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Device_mac_address_key" ON "Device"("mac_address");
