/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CalendarIntegration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Goal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhoneVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reminder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CalendarIntegration" DROP CONSTRAINT "CalendarIntegration_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Conversation" DROP CONSTRAINT "Conversation_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Goal" DROP CONSTRAINT "Goal_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PhoneVerification" DROP CONSTRAINT "PhoneVerification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reminder" DROP CONSTRAINT "Reminder_taskId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_goalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_userId_fkey";

-- DropIndex
DROP INDEX "public"."User_phoneNumber_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phoneNumber",
DROP COLUMN "phoneVerified";

-- DropTable
DROP TABLE "public"."CalendarIntegration";

-- DropTable
DROP TABLE "public"."Conversation";

-- DropTable
DROP TABLE "public"."Goal";

-- DropTable
DROP TABLE "public"."Message";

-- DropTable
DROP TABLE "public"."PhoneVerification";

-- DropTable
DROP TABLE "public"."Reminder";

-- DropTable
DROP TABLE "public"."Task";
