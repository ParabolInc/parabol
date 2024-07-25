import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    CREATE OR REPLACE FUNCTION "getEmbedderPriority"(IN "maxDelayInDays" INTEGER)
    RETURNS INTEGER LANGUAGE PLPGSQL AS $$
    BEGIN
      RETURN -(2 ^ 31) + FLOOR(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) / 1000) + "maxDelayInDays" * 86400;
    END
    $$;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP FUNCTION IF EXISTS "getEmbedderPriority"(IN INTEGER);
 `)
  await client.end()
}
