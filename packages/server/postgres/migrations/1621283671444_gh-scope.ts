import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE "GitHubAuth"
    ADD COLUMN IF NOT EXISTS "scope" VARCHAR(250);
  `)
  await pgm.db.query(`
    UPDATE "GitHubAuth"
    SET "scope" = 'admin:org_hook,read:org,repo,user:email,write:repo_hook'
  `)
  await pgm.db.query(`
    ALTER TABLE "GitHubAuth"
    ALTER COLUMN "scope" SET NOT NULL
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE "GitHubAuth"
    DROP COLUMN "scope";
  `)
}
