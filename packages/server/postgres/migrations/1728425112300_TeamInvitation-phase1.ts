import {Kysely, PostgresDialect, sql} from 'kysely'
import {Client} from 'pg'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'
import getPgConfig from '../getPgConfig'

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`
  DO $$
  BEGIN
    CREATE TABLE IF NOT EXISTS "TeamInvitation" (
      "id" VARCHAR(100) NOT NULL PRIMARY KEY,
      "acceptedAt" TIMESTAMP WITH TIME ZONE,
      "acceptedBy" VARCHAR(100),
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
      "email" "citext" NOT NULL,
      "invitedBy" VARCHAR(100) NOT NULL,
      "isMassInvite" BOOLEAN NOT NULL DEFAULT FALSE,
      "meetingId" VARCHAR(100),
      "teamId" VARCHAR(100) NOT NULL,
      "token" VARCHAR(200) NOT NULL,
      CONSTRAINT "fk_meetingId"
        FOREIGN KEY("meetingId")
          REFERENCES "NewMeeting"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_invitedBy"
        FOREIGN KEY("invitedBy")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_acceptedBy"
        FOREIGN KEY("acceptedBy")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_TeamInvitation_email" ON "TeamInvitation"("email");
    CREATE INDEX IF NOT EXISTS "idx_TeamInvitation_teamId" ON "TeamInvitation"("teamId");
    CREATE INDEX IF NOT EXISTS "idx_TeamInvitation_token" ON "TeamInvitation"("token");
  END $$;
`.execute(pg)
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "TeamInvitation";
    ` /* Do undo magic */)
  await client.end()
}
