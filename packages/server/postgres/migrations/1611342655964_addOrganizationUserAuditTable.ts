import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.sql(`
    CREATE TYPE "OrganizationUserAuditEventTypeEnum" AS ENUM (
      'added',
      'activated',
      'inactivated',
      'removed'
    );
    CREATE TABLE "OrganizationUserAudit" (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      "orgId" VARCHAR(100) NOT NULL,
      "userId" VARCHAR(100) NOT NULL,
      "eventDate" TIMESTAMP NOT NULL,
      "eventType" "OrganizationUserAuditEventTypeEnum" NOT NULL
    );
    CREATE INDEX "idx_OrganizationUserAudit_orgId" ON "OrganizationUserAudit"("orgId");
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.sql(`
    DROP TYPE "OrganizationUserAuditEventTypeEnum" CASCADE;
    DROP TABLE "OrganizationUserAudit";
  `)
}
