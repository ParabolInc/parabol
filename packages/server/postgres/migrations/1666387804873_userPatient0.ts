import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "isPatient0" BOOLEAN DEFAULT FALSE;

    DROP TABLE IF EXISTS "tmp_patient0";
    SELECT DISTINCT ON ("domain") "domain", "id" INTO "tmp_patient0" FROM "User" ORDER BY "domain", "createdAt";
    ALTER TABLE "tmp_patient0" ADD PRIMARY KEY ("id");

    UPDATE "User" u
    SET "isPatient0" = COALESCE((SELECT true FROM "tmp_patient0" p0 WHERE u."id" = p0."id"), false) ;

    DROP TABLE "tmp_patient0";

    ALTER TABLE "User"
    ALTER COLUMN "isPatient0" SET NOT NULL
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "User"
    DROP COLUMN IF EXISTS "isPatient0"
  `)
  await client.end()
}
