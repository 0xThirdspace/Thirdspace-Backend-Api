-- CreateEnum
CREATE TYPE "Department" AS ENUM ('management', 'marketing', 'engineering', 'product', 'research', 'finance', 'sales', 'operations', 'human_resource', 'other');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'admin', 'member');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profileImage" TEXT DEFAULT 'user.png';

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "department" "Department" NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_workspaceId_key" ON "teams"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_workspaceId_userId_key" ON "teams"("workspaceId", "userId");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
