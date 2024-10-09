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
    CREATE TABLE IF NOT EXISTS "MassInvitation" (
      "id" CHAR(12) NOT NULL PRIMARY KEY,
      "expiration" TIMESTAMP WITH TIME ZONE NOT NULL,
      "meetingId" VARCHAR(100),
      "teamMemberId" VARCHAR(100) NOT NULL,
      CONSTRAINT "fk_meetingId"
        FOREIGN KEY("meetingId")
          REFERENCES "NewMeeting"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_teamMemberId"
        FOREIGN KEY("teamMemberId")
          REFERENCES "TeamMember"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_MassInvitation_meetingId" ON "MassInvitation"("meetingId") WHERE "meetingId" IS NOT NULL;
    CREATE INDEX IF NOT EXISTS "idx_MassInvitation_teamMemberId" ON "MassInvitation"("teamMemberId");
  END $$;
`.execute(pg)

  const rRequests = await r
    .table('MassInvitation')
    .filter((row) => row('expiration').ge(r.now()))
    .coerceTo('array')
    .run()

  const insertRow = async (row) => {
    try {
      await pg
        .insertInto('MassInvitation')
        .values(row)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      if (e.constraint === 'fk_meetingId') {
        return insertRow({...row, meetingId: null})
      }
      if (e.constraint === 'fk_teamMemberId') {
        console.log('MassInvitation has no teamMember, skipping insert', row.id)
        return
      }
      throw e
    }
  }
  await Promise.all(rRequests.map(async (row) => insertRow(row)))
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "MassInvitation";
    ` /* Do undo magic */)
  await client.end()
}
