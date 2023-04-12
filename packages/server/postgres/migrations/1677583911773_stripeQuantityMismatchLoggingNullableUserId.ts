import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "StripeQuantityMismatchLogging"
      ADD COLUMN IF NOT EXISTS "orgId" VARCHAR(100),
      ALTER COLUMN "userId" DROP NOT NULL,
      ALTER COLUMN "userId" SET DEFAULT NULL;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    UPDATE "StripeQuantityMismatchLogging" SET "userId" = '' WHERE "userId" IS NULL;
    ALTER TABLE "StripeQuantityMismatchLogging"
      DROP COLUMN IF EXISTS "orgId",
      ALTER COLUMN "userId" DROP DEFAULT,
      ALTER COLUMN "userId" SET NOT NULL;
  `)
  await client.end()
}
