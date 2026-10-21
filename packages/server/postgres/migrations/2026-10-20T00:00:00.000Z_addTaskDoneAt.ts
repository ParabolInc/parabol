import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // No backfill: rewriting every done task would bump updatedAt through update_Task_updatedAt and reorder task lists
  await db.schema.alterTable('Task').addColumn('doneAt', 'timestamptz').execute()
  await sql`
    CREATE OR REPLACE FUNCTION public."set_Task_doneAt"() RETURNS trigger
      LANGUAGE plpgsql
      AS $$
    BEGIN
      IF NEW."status" <> 'done' THEN
        NEW."doneAt" = NULL;
      ELSIF TG_OP = 'INSERT' OR OLD."status" <> 'done' THEN
        NEW."doneAt" = COALESCE(NEW."doneAt", now());
      END IF;
      RETURN NEW;
    END;
    $$;
  `.execute(db)
  await sql`
    CREATE TRIGGER "set_Task_doneAt" BEFORE INSERT OR UPDATE OF "status" ON "Task"
      FOR EACH ROW EXECUTE FUNCTION public."set_Task_doneAt"()
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS "set_Task_doneAt" ON "Task"`.execute(db)
  await sql`DROP FUNCTION IF EXISTS public."set_Task_doneAt"()`.execute(db)
  await db.schema.alterTable('Task').dropColumn('doneAt').execute()
}
