/*
  Warnings:

  - You are about to drop the column `file` on the `chats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chats" DROP COLUMN "file";

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "file" TEXT;
