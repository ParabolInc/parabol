import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE FUNCTION public.arr_append_uniq(anyarray, anyelement) RETURNS anyarray
      LANGUAGE sql IMMUTABLE
      AS $_$SELECT CASE WHEN array_position($1, $2) iS NULL THEN $1 || $2 ELSE $1 END;$_$;
  `.execute(db)
}
