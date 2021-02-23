/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TYPE "TierEnum" AS ENUM (
      'personal',
      'pro',
      'enterprise'
    );
    CREATE TYPE "AuthTokenRole" AS ENUM (
      'su'
    );
    CREATE EXTENSION citext;
    CREATE TABLE "User" (
      id VARCHAR(100) PRIMARY KEY,
      email "citext" UNIQUE NOT NULL,
      "createdAt" TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP NOT NULL,
      "inactive" BOOLEAN NOT NULL DEFAULT FALSE,
      "lastSeenAt" TIMESTAMP,
      "preferredName" VARCHAR(100) NOT NULL,
      tier "TierEnum" NOT NULL DEFAULT 'personal',
      picture VARCHAR(255) NOT NULL,
      tms VARCHAR(100)[] NOT NULL DEFAULT '{}',
      "featureFlags" VARCHAR(50)[] NOT NULL DEFAULT '{}',
      identities JSONB[] NOT NULL DEFAULT '{}',
      "lastSeenAtURLs" text[],
      "segmentId" VARCHAR(100),
      "newFeatureId" VARCHAR(100),
      "overLimitCopy" VARCHAR(500),
      "isRemoved" BOOLEAN NOT NULL DEFAULT FALSE,
      "reasonRemoved" VARCHAR(2000),
      rol "AuthTokenRole",
      "payLaterClickCount" SMALLINT NOT NULL DEFAULT 0
    );
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE "User";
    DROP TYPE "TierEnum";
    DROP TYPE "AuthTokenRole";
    DROP EXTENSION "citext";
  `)
}
