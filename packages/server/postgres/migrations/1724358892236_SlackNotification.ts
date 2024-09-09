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
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SlackNotificationEventEnum') THEN
      CREATE TYPE "SlackNotificationEventEnum" AS ENUM (
        'meetingStart',
        'meetingEnd',
        'MEETING_STAGE_TIME_LIMIT_END',
        'MEETING_STAGE_TIME_LIMIT_START',
        'TOPIC_SHARED',
        'STANDUP_RESPONSE_SUBMITTED'
      );
    END IF;
    CREATE TABLE IF NOT EXISTS "SlackNotification" (
      "id" VARCHAR(100) PRIMARY KEY,
      "event" "SlackNotificationEventEnum" NOT NULL,
      "channelId" VARCHAR(100),
      "teamId" VARCHAR(100) NOT NULL,
      "userId" VARCHAR(100) NOT NULL,
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_userId"
        FOREIGN KEY("userId")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      UNIQUE("teamId", "userId", "event")
    );
    CREATE INDEX IF NOT EXISTS "idx_SlackNotification_teamId" ON "SlackNotification" ("teamId");
    CREATE INDEX IF NOT EXISTS "idx_SlackNotification_userId" ON "SlackNotification" ("userId");
  END $$;
`.execute(pg)

  const rNotifications = await r.table('SlackNotification').coerceTo('array').run()

  await Promise.all(
    rNotifications.map(async (notification) => {
      const {channelName, ...pgVal} = notification
      try {
        return await pg
          .insertInto('SlackNotification')
          .values(pgVal)
          .onConflict((oc) => oc.doNothing())
          .execute()
      } catch (e) {
        if (e.constraint === 'fk_teamId' || e.constraint === 'fk_userId') {
          console.log(`Skipping ${notification.id} because it has no user/team`)
          return
        }
        console.log(e, notification)
      }
    })
  )
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TYPE "SlackNotificationEventEnum" CASCADE;
    DROP TABLE IF EXISTS "SlackNotification";
    ` /* Do undo magic */)
  await client.end()
}
