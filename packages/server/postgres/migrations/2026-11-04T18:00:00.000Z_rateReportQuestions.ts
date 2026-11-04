import {type Kysely, sql} from 'kysely'

const RECENT_QUESTION_LIMIT = 20

const replaceTrimFunction = async (db: Kysely<any>, isRatedKept: boolean) => {
  await sql`
    CREATE OR REPLACE FUNCTION "trimReportQuestions"()
    RETURNS TRIGGER AS $$
    BEGIN
      DELETE FROM "ReportQuestion"
      WHERE "userId" = NEW."userId" AND "orgId" = NEW."orgId" ${isRatedKept ? sql`AND "rating" IS NULL` : sql``} AND id NOT IN (
        SELECT id FROM "ReportQuestion"
        WHERE "userId" = NEW."userId" AND "orgId" = NEW."orgId"
        ORDER BY "lastUsedAt" DESC, id DESC
        LIMIT ${sql.lit(RECENT_QUESTION_LIMIT)}
      );
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('ReportQuestionRatingEnum').asEnum(['good', 'bad']).execute()
  await db.schema
    .alterTable('ReportQuestion')
    .addColumn('rating', sql`"ReportQuestionRatingEnum"`)
    .addColumn('ratedAt', 'timestamptz')
    .execute()
  // a rating says how well AI answered, so it outlives the question leaving the recent list
  await replaceTrimFunction(db, true)
}

export async function down(db: Kysely<any>): Promise<void> {
  await replaceTrimFunction(db, false)
  await db.schema.alterTable('ReportQuestion').dropColumn('rating').dropColumn('ratedAt').execute()
  await db.schema.dropType('ReportQuestionRatingEnum').execute()
}
