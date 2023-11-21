import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Kudos" (
      "id" SERIAL PRIMARY KEY,
      "senderUserId" VARCHAR(100) NOT NULL,
      "receiverUserId" VARCHAR(100) NOT NULL,
      "teamId" VARCHAR(100) NOT NULL,
      "reactableId" VARCHAR(100),
      "reactableType" VARCHAR(50),
      "emoji" VARCHAR(100),
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

    DROP TRIGGER IF EXISTS "update_Kudos_updatedAt" ON "Kudos";
    CREATE TRIGGER "update_Kudos_updatedAt" BEFORE UPDATE ON "Kudos" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "Kudos";
  `)
  await client.end()
}
