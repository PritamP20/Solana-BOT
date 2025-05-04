/*
  Warnings:

  - The values [NEXTJS] on the enum `ProjectType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `type` to the `Prompt` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PromptType" AS ENUM ('USER', 'SYSTEM');

-- AlterEnum
BEGIN;
CREATE TYPE "ProjectType_new" AS ENUM ('SOLANA', 'REACT', 'REACT_NATIVE');
ALTER TABLE "Project" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "type" TYPE "ProjectType_new" USING ("type"::text::"ProjectType_new");
ALTER TYPE "ProjectType" RENAME TO "ProjectType_old";
ALTER TYPE "ProjectType_new" RENAME TO "ProjectType";
DROP TYPE "ProjectType_old";
ALTER TABLE "Project" ALTER COLUMN "type" SET DEFAULT 'SOLANA';
COMMIT;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "type" SET DEFAULT 'SOLANA';

-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "type" "PromptType" NOT NULL;
