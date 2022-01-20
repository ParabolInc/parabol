import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    CREATE OR REPLACE FUNCTION "set_updatedAt"()
    RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
    BEGIN
      NEW."updatedAt" = now();
        RETURN NEW;
    END
    $$;
    DROP TRIGGER IF EXISTS "update_User_updatedAt" ON "User";
    CREATE TRIGGER "update_User_updatedAt" BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_User_updatedAt" ON "User";
    DROP FUNCTION IF EXISTS "set_updatedAt"();
  `)
  await client.end()
}
