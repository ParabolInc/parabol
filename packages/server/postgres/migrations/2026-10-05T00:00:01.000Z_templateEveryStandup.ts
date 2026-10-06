import {type Kysely, sql} from 'kysely'
import type {MigrationConfig} from 'kysely/migration'

// Backfills run as autocommitting keyset batches so no lock outlives a batch. Every step is
// guarded so a rerun resumes from wherever a crash left off, including after the final transaction.
// The FK & CHECK are added NOT VALID and validated outside any transaction.
export const config: MigrationConfig = {transaction: false}

const DEFAULT_PROMPT = 'What are you working on today? Stuck on anything?'
const CANONICAL_TEMPLATE_ID = 'teamPrompt'
const CANONICAL_PROMPT_ID = 'teamPromptTemplate:workingOnPrompt'
const BEFORE_FIRST_STANDUP = new Date('2022-01-01T00:00:00.000Z')
const JADE_400 = '#66BC8C'
const BATCH_SIZE = 1000

const legacyTemplateId = sql`'legacyStandup:' || md5("teamId" || ':' || "meetingPrompt")`

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "TemplatePrompt" ALTER COLUMN "question" TYPE varchar(255)`.execute(db)
  await sql`
    ALTER TABLE "TeamPromptResponse"
      ADD COLUMN IF NOT EXISTS "promptId" varchar(100),
      ADD COLUMN IF NOT EXISTS "sharedAt" timestamptz
  `.execute(db)
  await sql`
    DO $$ BEGIN
      ALTER TABLE "TeamPromptResponse" ADD CONSTRAINT "fk_promptId"
        FOREIGN KEY ("promptId") REFERENCES "TemplatePrompt"("id") ON DELETE CASCADE NOT VALID;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `.execute(db)

  await db
    .updateTable('TemplatePrompt')
    .set({createdAt: BEFORE_FIRST_STANDUP})
    .where('id', '=', CANONICAL_PROMPT_ID)
    .execute()

  await sql`
    WITH "LegacyPrompt" AS (
      SELECT m."teamId", m."meetingPrompt", t."orgId",
        MIN(m."createdAt") - interval '1 second' AS "createdAt"
      FROM "NewMeeting" m
      JOIN "Team" t ON t."id" = m."teamId"
      WHERE m."meetingType" = 'teamPrompt'
        AND m."templateId" IS NULL
        AND m."meetingPrompt" <> ${DEFAULT_PROMPT}
      GROUP BY m."teamId", m."meetingPrompt", t."orgId"
    ), "InsertedTemplate" AS (
      INSERT INTO "MeetingTemplate" ("id", "name", "type", "mainCategory", "teamId", "orgId", "scope",
        "isActive", "isStarter", "isFree", "parentTemplateId", "illustrationUrl", "createdAt", "updatedAt")
      SELECT ${legacyTemplateId}, LEFT("meetingPrompt", 250), 'teamPrompt', 'standup', "teamId", "orgId", 'TEAM',
        false, false, true, ${CANONICAL_TEMPLATE_ID},
        '/assets/Organization/aGhostOrg/template/teamPrompt.png', "createdAt", "createdAt"
      FROM "LegacyPrompt"
      ON CONFLICT ("id") DO NOTHING
    )
    INSERT INTO "TemplatePrompt" ("id", "templateId", "teamId", "question", "description", "groupColor",
      "sortOrder", "createdAt", "updatedAt")
    SELECT ${legacyTemplateId} || ':prompt', ${legacyTemplateId}, "teamId", "meetingPrompt", '', ${JADE_400},
      '"', "createdAt", "createdAt"
    FROM "LegacyPrompt"
    ON CONFLICT ("id") DO NOTHING
  `.execute(db)

  let lastMeetingId = ''
  while (true) {
    const meetings: {id: string}[] = await db
      .selectFrom('NewMeeting')
      .select('id')
      .where('meetingType', '=', 'teamPrompt')
      .where('templateId', 'is', null)
      .where('id', '>', lastMeetingId)
      .orderBy('id')
      .limit(BATCH_SIZE)
      .execute()
    const lastMeeting = meetings.at(-1)
    if (!lastMeeting) break
    await sql`
      UPDATE "NewMeeting" SET "templateId" = CASE
        WHEN "meetingPrompt" = ${DEFAULT_PROMPT} THEN ${CANONICAL_TEMPLATE_ID}
        ELSE ${legacyTemplateId} END
      WHERE "id" IN (${sql.join(meetings.map(({id}) => id))})
    `.execute(db)
    lastMeetingId = lastMeeting.id
  }

  await sql`
    UPDATE "MeetingSeries" s SET "templateId" = (
      SELECT m."templateId" FROM "NewMeeting" m
      WHERE m."meetingSeriesId" = s."id" ORDER BY m."createdAt" DESC LIMIT 1
    )
    WHERE s."meetingType" = 'teamPrompt' AND s."templateId" IS NULL
  `.execute(db)
  await db
    .updateTable('MeetingSeries')
    .set({templateId: CANONICAL_TEMPLATE_ID})
    .where('meetingType', '=', 'teamPrompt')
    .where('templateId', 'is', null)
    .execute()

  await sql`
    UPDATE "MeetingTemplate" t SET "isActive" = true
    WHERE t."id" LIKE 'legacyStandup:%' AND (
      EXISTS (SELECT 1 FROM "NewMeeting" m WHERE m."templateId" = t."id" AND m."endedAt" IS NULL)
      OR EXISTS (
        SELECT 1 FROM "MeetingSeries" s WHERE s."templateId" = t."id" AND s."cancelledAt" IS NULL
      )
      OR t."id" = (
        SELECT m."templateId" FROM "NewMeeting" m
        WHERE m."teamId" = t."teamId" AND m."meetingType" = 'teamPrompt'
        ORDER BY m."createdAt" DESC LIMIT 1
      )
    )
  `.execute(db)

  let lastResponseId = 0
  while (true) {
    const responses: {id: number}[] = await db
      .selectFrom('TeamPromptResponse')
      .select('id')
      .where('promptId', 'is', null)
      .where('id', '>', lastResponseId)
      .orderBy('id')
      .limit(BATCH_SIZE)
      .execute()
    const lastResponse = responses.at(-1)
    if (!lastResponse) break
    await sql`
      UPDATE "TeamPromptResponse" r SET
        "promptId" = CASE WHEN m."templateId" = ${CANONICAL_TEMPLATE_ID} THEN ${CANONICAL_PROMPT_ID}
          ELSE "firstPrompt"."id" END,
        "sharedAt" = CASE WHEN r."plaintextContent" <> '' THEN r."createdAt" END
      FROM "NewMeeting" m
      JOIN LATERAL (
        SELECT p."id" FROM "TemplatePrompt" p
        WHERE p."templateId" = m."templateId"
          AND p."createdAt" < m."createdAt"
          AND (p."removedAt" IS NULL OR m."createdAt" < p."removedAt")
        ORDER BY p."sortOrder"
        LIMIT 1
      ) "firstPrompt" ON true
      WHERE m."id" = r."meetingId" AND r."id" IN (${sql.join(responses.map(({id}) => id))})
    `.execute(db)
    lastResponseId = lastResponse.id
  }

  const unresolvedResponses: {id: number}[] = await db
    .selectFrom('TeamPromptResponse')
    .select('id')
    .where('promptId', 'is', null)
    .orderBy('id')
    .limit(10)
    .execute()
  if (unresolvedResponses.length > 0) {
    const ids = unresolvedResponses.map(({id}) => id).join(', ')
    throw new Error(
      `templateEveryStandup: TeamPromptResponse rows found no prompt inside their meeting's frozen window, e.g. ids ${ids}`
    )
  }

  await db.transaction().execute(async (trx) => {
    await sql`
      ALTER TABLE "TeamPromptResponse"
        ALTER COLUMN "promptId" SET NOT NULL,
        DROP CONSTRAINT IF EXISTS "TeamPromptResponse_meetingIdUserId_unique";
      DO $$ BEGIN
        ALTER TABLE "TeamPromptResponse"
          ADD CONSTRAINT "TeamPromptResponse_meetingIdUserIdPromptId_unique" UNIQUE ("meetingId", "userId", "promptId");
      EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;
      DO $$ BEGIN
        ALTER TABLE "NewMeeting" ADD CONSTRAINT "NewMeeting_teamPrompt_templateId"
          CHECK ("meetingType" <> 'teamPrompt' OR "templateId" IS NOT NULL) NOT VALID;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `.execute(trx)
  })

  await sql`
    ALTER TABLE "TeamPromptResponse" VALIDATE CONSTRAINT "fk_promptId";
    ALTER TABLE "NewMeeting" VALIDATE CONSTRAINT "NewMeeting_teamPrompt_templateId";
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.transaction().execute(async (trx) => {
    await sql`
      ALTER TABLE "NewMeeting" DROP CONSTRAINT "NewMeeting_teamPrompt_templateId";
      DELETE FROM "TeamPromptResponse" r USING "TeamPromptResponse" keep
        WHERE r."meetingId" = keep."meetingId" AND r."userId" = keep."userId" AND r."id" > keep."id";
      ALTER TABLE "TeamPromptResponse"
        DROP CONSTRAINT "TeamPromptResponse_meetingIdUserIdPromptId_unique",
        ADD CONSTRAINT "TeamPromptResponse_meetingIdUserId_unique" UNIQUE ("meetingId", "userId"),
        DROP COLUMN "promptId",
        DROP COLUMN "sharedAt";
      UPDATE "MeetingSeries" SET "templateId" = NULL
        WHERE "meetingType" = 'teamPrompt' AND ("templateId" = 'teamPrompt' OR "templateId" LIKE 'legacyStandup:%');
      UPDATE "NewMeeting" SET "templateId" = NULL
        WHERE "meetingType" = 'teamPrompt' AND ("templateId" = 'teamPrompt' OR "templateId" LIKE 'legacyStandup:%');
      DELETE FROM "TemplatePrompt" WHERE "templateId" LIKE 'legacyStandup:%';
      DELETE FROM "MeetingTemplate" WHERE "id" LIKE 'legacyStandup:%';
    `.execute(trx)
  })
}
