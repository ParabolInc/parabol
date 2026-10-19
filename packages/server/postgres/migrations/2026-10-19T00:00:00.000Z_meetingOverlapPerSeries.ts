import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // The overlap guard catches a double-clicked start. Two series of one team can fall due on the
  // same tick, and processRecurrence opens them together, so only meetings of one series collide
  await sql`
    CREATE OR REPLACE FUNCTION public.prevent_meeting_overlap() RETURNS trigger
      LANGUAGE plpgsql
      AS $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM "NewMeeting"
        WHERE "teamId" = NEW."teamId"
        AND "meetingType" = NEW."meetingType"
        AND "meetingSeriesId" IS NOT DISTINCT FROM NEW."meetingSeriesId"
        AND ABS(EXTRACT(EPOCH FROM (NEW."createdAt" - "createdAt"))) < 2
      ) THEN
        RAISE EXCEPTION 'Cannot insert meeting. A meeting exists within a 2-second window.';
      END IF;
      RETURN NEW;
    END;
    $$;
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE OR REPLACE FUNCTION public.prevent_meeting_overlap() RETURNS trigger
      LANGUAGE plpgsql
      AS $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM "NewMeeting"
        WHERE "teamId" = NEW."teamId"
        AND "meetingType" = NEW."meetingType"
        AND ABS(EXTRACT(EPOCH FROM (NEW."createdAt" - "createdAt"))) < 2
      ) THEN
        RAISE EXCEPTION 'Cannot insert meeting. A meeting exists within a 2-second window.';
      END IF;
      RETURN NEW;
    END;
    $$;
  `.execute(db)
}
