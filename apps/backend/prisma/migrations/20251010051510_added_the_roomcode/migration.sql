/*
  Warnings:

  - Changed the type of `roomCode` on the `Room` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "roomCode",
ADD COLUMN     "roomCode" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomCode_key" ON "Room"("roomCode");
