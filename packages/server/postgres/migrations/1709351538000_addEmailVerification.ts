import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    CREATE TABLE "EmailVerification" (
      "id" SERIAL PRIMARY KEY,
      "email" "citext" NOT NULL,
      "expiration" TIMESTAMP WITH TIME ZONE NOT NULL,
      "token" VARCHAR(100) NOT NULL,
      "hashedPassword" VARCHAR(100),
      "invitationToken" VARCHAR(100),
      "pseudoId" VARCHAR(100)
    );

    CREATE INDEX IF NOT EXISTS "idx_EmailVerification_email" ON "EmailVerification"("email");
    CREATE INDEX IF NOT EXISTS "idx_EmailVerification_token" ON "EmailVerification"("token");
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "EmailVerification";
  `)
  await client.end()
}
