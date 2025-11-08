/*
  Warnings:

  - You are about to drop the column `companyId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Job` DROP FOREIGN KEY `Job_companyId_fkey`;

-- DropIndex
DROP INDEX `Job_companyId_fkey` ON `Job`;

-- AlterTable
ALTER TABLE `Job` DROP COLUMN `companyId`,
    ADD COLUMN `companyName` VARCHAR(191) NULL,
    ADD COLUMN `isPublic` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `Company`;
