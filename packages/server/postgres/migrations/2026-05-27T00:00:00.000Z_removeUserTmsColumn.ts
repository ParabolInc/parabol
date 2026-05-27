import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    DROP TRIGGER IF EXISTS trg_Team_update_User_tms ON "Team";
    DROP TRIGGER IF EXISTS trg_TeamMember_update_User_tms ON "TeamMember";
    DROP FUNCTION IF EXISTS "updateUserTmsAfterTeam"();
    DROP FUNCTION IF EXISTS "updateUserTmsAfterTeamMember"();
    DROP FUNCTION IF EXISTS arr_append_uniq(anyarray, anyelement);
    ALTER TABLE "User" DROP COLUMN IF EXISTS tms;
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS tms character varying(100)[] DEFAULT '{}'::character varying[] NOT NULL;
    UPDATE "User" u
    SET tms = COALESCE(
      (SELECT array_agg(tm."teamId")
       FROM "TeamMember" tm
       JOIN "Team" t ON t.id = tm."teamId"
       WHERE tm."userId" = u.id
         AND tm."isNotRemoved" = true
         AND t."isArchived" = false),
      '{}'
    );

    -- Restore triggers from 2025-06-24T13:42:32.158Z_addTMSTriggers.ts and
    -- 2025-09-11T12:21:56.659Z_fixUserTMSUpdateTrigger.ts (latest version of updateUserTmsAfterTeam),
    -- and arr_append_uniq from 2025-01-08T00:27:52.203Z_init.ts
    CREATE FUNCTION public.arr_append_uniq(anyarray, anyelement) RETURNS anyarray
      LANGUAGE sql IMMUTABLE
      AS $_$SELECT CASE WHEN array_position($1, $2) iS NULL THEN $1 || $2 ELSE $1 END;$_$;

    CREATE OR REPLACE FUNCTION "updateUserTmsAfterTeam"()
    RETURNS TRIGGER AS $$
    DECLARE
      "_teamId" VARCHAR := COALESCE(NEW.id, OLD.id);
    BEGIN
      IF TG_OP = 'DELETE' OR NEW."isArchived" = true THEN
        UPDATE "User"
        SET tms = array_remove(tms, "_teamId")
        WHERE id IN (
          SELECT tm."userId"
          FROM "TeamMember" tm
          WHERE tm."teamId" = "_teamId"
        );
      ELSE
        UPDATE "User"
        SET tms = arr_append_uniq(tms, "_teamId")
        WHERE id IN (
          SELECT tm."userId"
          FROM "TeamMember" tm
          WHERE tm."teamId" = "_teamId"
          AND tm."isNotRemoved" = true
        );
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    CREATE OR REPLACE TRIGGER trg_Team_update_User_tms
    AFTER INSERT OR UPDATE OF "isArchived" OR DELETE ON "Team"
    FOR EACH ROW EXECUTE FUNCTION "updateUserTmsAfterTeam"();

    CREATE OR REPLACE FUNCTION "updateUserTmsAfterTeamMember"()
    RETURNS TRIGGER AS $$
    DECLARE
      "_teamId" VARCHAR := COALESCE(NEW."teamId", OLD."teamId");
      "_userId" VARCHAR := COALESCE(NEW."userId", OLD."userId");
    BEGIN
      IF TG_OP = 'DELETE' OR NEW."isNotRemoved" = false OR (SELECT "isArchived" FROM "Team" WHERE id = "_teamId") THEN
        UPDATE "User"
        SET tms = array_remove(tms, "_teamId")
        WHERE id = "_userId";
      ELSE
        UPDATE "User"
        SET tms = arr_append_uniq(tms, "_teamId")
        WHERE id = "_userId";
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    CREATE OR REPLACE TRIGGER trg_TeamMember_update_User_tms
    AFTER INSERT OR UPDATE OF "isNotRemoved" OR DELETE ON "TeamMember"
    FOR EACH ROW EXECUTE FUNCTION "updateUserTmsAfterTeamMember"();
  `.execute(db)
}
