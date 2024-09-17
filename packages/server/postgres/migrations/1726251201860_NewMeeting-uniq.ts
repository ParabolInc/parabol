import {Kysely, PostgresDialect, sql} from 'kysely'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  // Doing this as a trigger instead of making unique teamId/meetingType/createdAt because rounding createdAt to the nearest 5 seconds felt bad
  sql`
  CREATE OR REPLACE FUNCTION prevent_meeting_overlap()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Check if a meeting exists within a 2-second window of the new start_time
    IF EXISTS (
      SELECT 1 FROM "NewMeeting"
      WHERE "teamId" = NEW."teamId"
      AND "meetingType" = NEW."meetingType"
      AND ABS(EXTRACT(EPOCH FROM (NEW.start_time - start_time))) < 2
    ) THEN
      RAISE EXCEPTION 'Cannot insert meeting. A meeting exists within a 2-second window.';
    END IF;
    -- If no conflict, allow the insert
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  DROP TRIGGER IF EXISTS check_meeting_overlap;
  CREATE TRIGGER check_meeting_overlap
  BEFORE INSERT ON "NewMeeting"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_meeting_overlap();
  `.execute(pg)
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`DROP TRIGGER IF EXISTS "check_meeting_overlap" ON "NewMeeting";`.execute(pg)
}
