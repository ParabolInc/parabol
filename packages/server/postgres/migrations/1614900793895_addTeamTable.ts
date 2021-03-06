/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TYPE "MeetingTypeEnum" AS ENUM (
      'action',
      'retrospective',
      'poker'
    );

    CREATE TABLE "Team" (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      "createdAt" TIMESTAMP NOT NULL,
      "createdBy" VARCHAR(100) NOT NULL,
      "isArchived" BOOLEAN NOT NULL DEFAULT FALSE,
      "isPaid" BOOLEAN NOT NULL DEFAULT TRUE,
      "jiraDimensionFields" JSONB[] NOT NULL DEFAULT '{}',
      "lastMeetingType" "MeetingTypeEnum" NOT NULL DEFAULT 'retrospective',
      tier "TierEnum" NOT NULL,
      "orgId" VARCHAR(100) NOT NULL,
      "isOnboardTeam" BOOLEAN NOT NULL DEFAULT FALSE,
      "updatedAt" TIMESTAMP NOT NULL,

      CONSTRAINT "fk_createdBy"
        FOREIGN KEY("createdBy") REFERENCES "User"(id)
    );

    CREATE INDEX "idx_Team_orgId" ON "Team"("orgId");
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE "Team";
    DROP TYPE "MeetingTypeEnum";
  `)
}
