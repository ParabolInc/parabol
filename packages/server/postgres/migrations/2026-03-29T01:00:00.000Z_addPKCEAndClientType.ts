import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Add clientType to OAuthAPIProvider (default 'confidential' for existing apps)
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'OAuthAPIProvider' AND column_name = 'clientType'
      ) THEN
        ALTER TABLE "OAuthAPIProvider" ADD COLUMN "clientType" varchar(20) NOT NULL DEFAULT 'confidential';
      END IF;
    END $$
  `.execute(db)

  // Add PKCE columns to OAuthAPICode
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'OAuthAPICode' AND column_name = 'codeChallenge'
      ) THEN
        ALTER TABLE "OAuthAPICode" ADD COLUMN "codeChallenge" varchar(128);
        ALTER TABLE "OAuthAPICode" ADD COLUMN "codeChallengeMethod" varchar(10);
      END IF;
    END $$
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "OAuthAPICode" DROP COLUMN IF EXISTS "codeChallengeMethod"`.execute(db)
  await sql`ALTER TABLE "OAuthAPICode" DROP COLUMN IF EXISTS "codeChallenge"`.execute(db)
  await sql`ALTER TABLE "OAuthAPIProvider" DROP COLUMN IF EXISTS "clientType"`.execute(db)
}
