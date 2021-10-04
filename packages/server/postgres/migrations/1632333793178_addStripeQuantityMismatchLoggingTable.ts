import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  CREATE TABLE IF NOT EXISTS "StripeQuantityMismatchLogging" (
    "id" SERIAL,
    "userId" VARCHAR(120) NOT NULL,
    "eventTime" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "eventType" VARCHAR(20) NOT NULL,
    "stripePreviousQuantity" INT NOT NULL,
    "stripeNextQuantity" INT NOT NULL,
    "orgUsers" JSONB[] NOT NULL
  );
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "StripeQuantityMismatchLogging";
  `)
  await client.end()
}
