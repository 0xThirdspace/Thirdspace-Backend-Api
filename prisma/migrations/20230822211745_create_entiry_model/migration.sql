/*
  Warnings:

  - You are about to drop the column `file` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "file",
ADD COLUMN     "imageUrl" TEXT;
