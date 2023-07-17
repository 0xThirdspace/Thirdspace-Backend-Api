/*
  Warnings:

  - A unique constraint covering the columns `[workspace_name]` on the table `workspaces` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "workspaces" ALTER COLUMN "workspace_name" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_workspace_name_key" ON "workspaces"("workspace_name");
