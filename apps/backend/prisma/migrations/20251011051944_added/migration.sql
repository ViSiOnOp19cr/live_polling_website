/*
  Warnings:

  - Added the required column `correctOption` to the `Poll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "correctOption" TEXT NOT NULL;
