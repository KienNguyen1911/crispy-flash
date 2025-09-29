/*
  Warnings:

  - Made the column `ownerId` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_ownerId_fkey";

-- AlterTable
ALTER TABLE "public"."Project" ALTER COLUMN "ownerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
