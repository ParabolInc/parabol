import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Kudoses" (
      "id" SERIAL PRIMARY KEY,
      "senderUserId" VARCHAR(100) NOT NULL,
      "receiverUserId" VARCHAR(100) NOT NULL,
      "teamId" VARCHAR(100) NOT NULL,
      "reactableId" TEXT,
      "reactableType" TEXT,
      "emoji" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY("senderUserId")
        REFERENCES "User"("id")
        ON DELETE CASCADE,
      FOREIGN KEY("receiverUserId")
        REFERENCES "User"("id")
        ON DELETE CASCADE,
      FOREIGN KEY("teamId")
        REFERENCES "Team"("id")
        ON DELETE CASCADE
    );

    DROP TRIGGER IF EXISTS "update_Kudoses_updatedAt" ON "Kudoses";
    CREATE TRIGGER "update_Kudoses_updatedAt" BEFORE UPDATE ON "Kudoses" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "Kudoses";
  `)
  await client.end()
}
