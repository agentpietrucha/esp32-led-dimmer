-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_userId_fkey";

-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
