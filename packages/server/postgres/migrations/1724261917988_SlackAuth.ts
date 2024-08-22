import {Kysely, PostgresDialect, sql} from 'kysely'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
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
    CREATE TABLE IF NOT EXISTS "SlackAuth" (
      "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "id" VARCHAR(100) PRIMARY KEY,
      "botUserId" VARCHAR(100) NOT NULL,
      "botAccessToken" VARCHAR(100),
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "defaultTeamChannelId" VARCHAR(100) NOT NULL,
      "teamId" VARCHAR(100) NOT NULL,
      "userId" VARCHAR(100) NOT NULL,
      "slackTeamId" VARCHAR(100) NOT NULL,
      "slackTeamName" VARCHAR(100) NOT NULL,
      "slackUserId" VARCHAR(100) NOT NULL,
      "slackUserName" VARCHAR(100) NOT NULL,
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_userId"
        FOREIGN KEY("userId")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      UNIQUE("teamId", "userId")
    );
    CREATE INDEX IF NOT EXISTS "idx_SlackAuth_teamId" ON "SlackAuth"("teamId");
    CREATE INDEX IF NOT EXISTS "idx_SlackAuth_userId" ON "SlackAuth"("userId");
    DROP TRIGGER IF EXISTS "update_SlackAuth_updatedAt" ON "SlackAuth";
    CREATE TRIGGER "update_SlackAuth_updatedAt" BEFORE UPDATE ON "SlackAuth" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  END $$;
`.execute(pg)

  const rAuths = await r.table('SlackAuth').coerceTo('array').run()

  await Promise.all(
    rAuths.map(async (auth) => {
      const {
        isActive,
        updatedAt,
        id,
        botUserId,
        botAccessToken,
        createdAt,
        defaultTeamChannelId,
        teamId,
        userId,
        slackTeamId,
        slackTeamName,
        slackUserId,
        slackUserName
      } = auth
      if (!botUserId || !botAccessToken) return
      try {
        return await pg
          .insertInto('SlackAuth')
          .values({
            isActive,
            updatedAt,
            id,
            botUserId,
            botAccessToken,
            createdAt,
            defaultTeamChannelId,
            teamId,
            userId,
            slackTeamId,
            slackTeamName,
            slackUserId,
            slackUserName
          })
          .onConflict((oc) => oc.doNothing())
          .execute()
      } catch (e) {
        if (e.constraint === 'fk_teamId' || e.constraint === 'fk_userId') {
          console.log(`Skipping ${auth.id} because it has no user/team`)
          return
        }
        console.log(e, auth)
      }
    })
  )
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "SlackAuth";
    ` /* Do undo magic */)
  await client.end()
}
