/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE "OrganizationUserAudit" (
      id SERIAL PRIMARY KEY,
      "orgId" VARCHAR(100) NOT NULL,
      "userId" VARCHAR(100) NOT NULL,
      "eventDate" TIMESTAMP WITH TIME ZONE NOT NULL,
      "eventType" INT NOT NULL
    );
  `)
  pgm.sql(`
    CREATE INDEX "idx_OrganizationUserAudit_orgId" ON "OrganizationUserAudit"("orgId");
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE "OrganizationUserAudit";
  `)
}
