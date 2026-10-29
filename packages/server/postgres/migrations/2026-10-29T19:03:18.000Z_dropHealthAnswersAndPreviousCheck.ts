import {type Kysely, sql} from 'kysely'

// Reports no longer have the Health answers measure or the Previous check comparison, and a saved spec naming either
// can't be read. Each comparison moves to the period before, and Health answers leaves the reports it shared with
// other measures. A pin or question that measured only Health answers has nothing left to show, so it goes
// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  for (const table of ['PinnedReport', 'ReportQuestion']) {
    await sql`
      UPDATE ${sql.table(table)}
      SET spec = jsonb_set(spec, '{compareTo}', '"PREVIOUS_PERIOD"')
      WHERE spec->>'compareTo' = 'PREVIOUS_CHECK'
    `.execute(db)
    await sql`
      UPDATE ${sql.table(table)}
      SET spec = spec || jsonb_build_object(
        'measures', (spec->'measures') - 'HEALTH_ANSWERS',
        'where', COALESCE(
          (
            SELECT jsonb_agg(condition)
            FROM jsonb_array_elements(spec->'where') AS condition
            WHERE condition->>'measure' <> 'HEALTH_ANSWERS'
          ),
          '[]'::jsonb
        )
      )
      WHERE spec->'measures' ? 'HEALTH_ANSWERS' AND jsonb_array_length(spec->'measures') > 1
    `.execute(db)
  }
  await sql`
    UPDATE "PinnedReport"
    SET "removedAt" = CURRENT_TIMESTAMP
    WHERE "removedAt" IS NULL AND spec->'measures' ? 'HEALTH_ANSWERS'
  `.execute(db)
  await sql`DELETE FROM "ReportQuestion" WHERE spec->'measures' ? 'HEALTH_ANSWERS'`.execute(db)
}

// the specs changed in place, and the old ones aren't kept
export async function down(): Promise<void> {}
