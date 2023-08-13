-- CreateEnum
CREATE TYPE "Department" AS ENUM ('management', 'marketing', 'engineering', 'product', 'research', 'finance', 'sales', 'operations', 'human_resource', 'other');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'admin', 'member');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'inProgress', 'Done');

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

-- CreateTable
CREATE TABLE "kenbanboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "kenbanboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "attachments" TEXT DEFAULT 'attachment.png',
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "KenbanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comments" (
    "id" TEXT NOT NULL,
    "comment" VARCHAR(255) NOT NULL,
    "userId" TEXT NOT NULL,
    "TakId" TEXT NOT NULL,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Assignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_workspaceId_key" ON "teams"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_workspaceId_userId_key" ON "teams"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_title_key" ON "tasks"("title");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_description_key" ON "tasks"("description");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_KenbanId_key" ON "tasks"("KenbanId");

-- CreateIndex
CREATE UNIQUE INDEX "Comments_comment_key" ON "Comments"("comment");

-- CreateIndex
CREATE UNIQUE INDEX "Comments_TakId_key" ON "Comments"("TakId");

-- CreateIndex
CREATE UNIQUE INDEX "_Assignees_AB_unique" ON "_Assignees"("A", "B");

-- CreateIndex
CREATE INDEX "_Assignees_B_index" ON "_Assignees"("B");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kenbanboard" ADD CONSTRAINT "kenbanboard_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kenbanboard" ADD CONSTRAINT "kenbanboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_KenbanId_fkey" FOREIGN KEY ("KenbanId") REFERENCES "kenbanboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_TakId_fkey" FOREIGN KEY ("TakId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Assignees" ADD CONSTRAINT "_Assignees_A_fkey" FOREIGN KEY ("A") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Assignees" ADD CONSTRAINT "_Assignees_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
