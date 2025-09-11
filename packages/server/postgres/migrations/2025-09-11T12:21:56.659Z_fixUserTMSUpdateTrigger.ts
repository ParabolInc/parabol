import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
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
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await sql`
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
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_Team_update_User_tms
AFTER INSERT OR UPDATE OF "isArchived" OR DELETE ON "Team"
FOR EACH ROW EXECUTE FUNCTION "updateUserTmsAfterTeam"();
  `.execute(db)
}
