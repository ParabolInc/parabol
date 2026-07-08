import {type Kysely, sql} from 'kysely'

const SEED_DATE = new Date('2026-07-08T00:00:00.000Z')

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // NOTE: 'teamHealth' cannot be used by any row insert in this migration batch —
  // pg forbids using an enum value added inside the still-open transaction
  await sql`ALTER TYPE public."MeetingTypeEnum" ADD VALUE IF NOT EXISTS 'teamHealth'`.execute(db)
  await db.schema.createType('TeamHealthQuestionTypeEnum').asEnum(['likert']).execute()

  await db.schema
    .createTable('TeamHealthCategory')
    .ifNotExists()
    .addColumn('id', 'bigserial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('description', 'varchar(500)')
    .addColumn('sortOrder', 'smallint', (col) => col.notNull().defaultTo(0))
    // seeded/built-in categories belong to 'aGhostOrg'
    .addColumn('orgId', 'varchar(100)', (col) =>
      col.notNull().references('Organization.id').onDelete('cascade')
    )
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('removedAt', 'timestamptz')
    .execute()

  await db.schema
    .createIndex('uniq_TeamHealthCategory_orgId_name')
    .ifNotExists()
    .on('TeamHealthCategory')
    .unique()
    .columns(['orgId', sql`lower(name)`])
    .where(sql.ref('removedAt'), 'is', null)
    .execute()
  await db.schema
    .createIndex('idx_TeamHealthCategory_orgId')
    .ifNotExists()
    .on('TeamHealthCategory')
    .column('orgId')
    .execute()

  await db.schema
    .createTable('TeamHealthQuestionPack')
    .ifNotExists()
    .addColumn('id', 'bigserial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(250)', (col) => col.notNull())
    .addColumn('description', 'varchar(2000)')
    .addColumn('source', 'varchar(255)')
    .addColumn('sourceUrl', 'varchar(2048)')
    // exactly one of teamId/orgId is set: teamId = team pack, orgId = org pack, orgId 'aGhostOrg' = built-in
    .addColumn('teamId', 'varchar(100)', (col) => col.references('Team.id').onDelete('cascade'))
    .addColumn('orgId', 'varchar(100)', (col) =>
      col.references('Organization.id').onDelete('cascade')
    )
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('removedAt', 'timestamptz')
    .addCheckConstraint(
      'ck_TeamHealthQuestionPack_teamId_orgId_xor',
      sql`("teamId" IS NULL) <> ("orgId" IS NULL)`
    )
    .execute()

  await db.schema
    .createIndex('idx_TeamHealthQuestionPack_teamId')
    .ifNotExists()
    .on('TeamHealthQuestionPack')
    .column('teamId')
    .where(sql.ref('teamId'), 'is not', null)
    .execute()
  await db.schema
    .createIndex('idx_TeamHealthQuestionPack_orgId')
    .ifNotExists()
    .on('TeamHealthQuestionPack')
    .column('orgId')
    .where(sql.ref('orgId'), 'is not', null)
    .execute()

  await db.schema
    .createTable('TeamHealthQuestion')
    .ifNotExists()
    .addColumn('id', 'bigserial', (col) => col.primaryKey())
    .addColumn('packId', 'bigint', (col) =>
      col.notNull().references('TeamHealthQuestionPack.id').onDelete('cascade')
    )
    // no cascade: categories soft-delete; a hard delete must not destroy questions across packs
    .addColumn('categoryId', 'bigint', (col) => col.notNull().references('TeamHealthCategory.id'))
    .addColumn('question', 'varchar(500)', (col) => col.notNull())
    .addColumn('description', 'varchar(1000)')
    .addColumn('questionType', sql`"TeamHealthQuestionTypeEnum"`, (col) =>
      col.notNull().defaultTo('likert')
    )
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('removedAt', 'timestamptz')
    .execute()

  await db.schema
    .createIndex('idx_TeamHealthQuestion_packId')
    .ifNotExists()
    .on('TeamHealthQuestion')
    .column('packId')
    .execute()
  await db.schema
    .createIndex('idx_TeamHealthQuestion_categoryId')
    .ifNotExists()
    .on('TeamHealthQuestion')
    .column('categoryId')
    .execute()
  await db.schema
    .createIndex('uniq_TeamHealthQuestion_packId_question')
    .ifNotExists()
    .on('TeamHealthQuestion')
    .unique()
    .columns(['packId', sql`lower(question)`])
    .where(sql.ref('removedAt'), 'is', null)
    .execute()

  await db.schema
    .createTable('TeamHealthTemplateQuestion')
    .ifNotExists()
    .addColumn('id', 'bigserial', (col) => col.primaryKey())
    .addColumn('templateId', 'varchar(100)', (col) =>
      col.notNull().references('MeetingTemplate.id').onDelete('cascade')
    )
    .addColumn('questionId', 'bigint', (col) =>
      col.notNull().references('TeamHealthQuestion.id').onDelete('cascade')
    )
    // the unique btree's leading templateId column also serves list-by-template queries
    .addUniqueConstraint('uniq_TeamHealthTemplateQuestion_templateId_questionId', [
      'templateId',
      'questionId'
    ])
    .execute()

  await db.schema
    .createIndex('idx_TeamHealthTemplateQuestion_questionId')
    .ifNotExists()
    .on('TeamHealthTemplateQuestion')
    .column('questionId')
    .execute()

  await db.schema
    .createTable('TeamHealthResponse')
    .ifNotExists()
    .addColumn('id', 'bigserial', (col) => col.primaryKey())
    .addColumn('meetingId', 'varchar(100)', (col) =>
      col.notNull().references('NewMeeting.id').onDelete('cascade')
    )
    .addColumn('questionId', 'bigint', (col) =>
      col.notNull().references('TeamHealthQuestion.id').onDelete('cascade')
    )
    .addColumn('userId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    // null score = skipped, or a future non-likert questionType
    .addColumn('score', 'smallint')
    .addColumn('comment', 'varchar(2000)')
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint('uniq_TeamHealthResponse_meetingId_questionId_userId', [
      'meetingId',
      'questionId',
      'userId'
    ])
    .addCheckConstraint('ck_TeamHealthResponse_score', sql`"score" BETWEEN 1 AND 5`)
    .execute()

  await db.schema
    .createIndex('idx_TeamHealthResponse_questionId')
    .ifNotExists()
    .on('TeamHealthResponse')
    .column('questionId')
    .execute()
  await db.schema
    .createIndex('idx_TeamHealthResponse_userId')
    .ifNotExists()
    .on('TeamHealthResponse')
    .column('userId')
    .execute()

  await db.schema
    .alterTable('MeetingSeries')
    .addColumn('templateId', 'varchar(100)', (col) =>
      col.references('MeetingTemplate.id').onDelete('set null')
    )
    .execute()
  await db.schema
    .createIndex('idx_MeetingSeries_templateId')
    .ifNotExists()
    .on('MeetingSeries')
    .column('templateId')
    .where(sql.ref('templateId'), 'is not', null)
    .execute()

  await db
    .insertInto('TeamHealthCategory')
    .values([
      {
        name: 'Psychological Safety',
        sortOrder: 1,
        orgId: 'aGhostOrg',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        name: 'Dependability',
        sortOrder: 2,
        orgId: 'aGhostOrg',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        name: 'Structure & Clarity',
        sortOrder: 3,
        orgId: 'aGhostOrg',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        name: 'Meaning',
        sortOrder: 4,
        orgId: 'aGhostOrg',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        name: 'Impact',
        sortOrder: 5,
        orgId: 'aGhostOrg',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      }
    ])
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('TeamHealthResponse').ifExists().execute()
  await db.schema.dropTable('TeamHealthTemplateQuestion').ifExists().execute()
  await db.schema.dropTable('TeamHealthQuestion').ifExists().execute()
  await db.schema.dropTable('TeamHealthQuestionPack').ifExists().execute()
  await db.schema.dropTable('TeamHealthCategory').ifExists().execute()

  await db.schema.alterTable('MeetingSeries').dropColumn('templateId').execute()
  await sql`DROP TYPE IF EXISTS public."TeamHealthQuestionTypeEnum"`.execute(db)

  // remove 'teamHealth' from MeetingTypeEnum: purge rows using it, then rebuild the type
  await sql`DELETE FROM public."NewMeeting" WHERE "meetingType" = 'teamHealth'`.execute(db)
  await sql`DELETE FROM public."MeetingMember" WHERE "meetingType" = 'teamHealth'`.execute(db)
  await sql`DELETE FROM public."MeetingSettings" WHERE "meetingType" = 'teamHealth'`.execute(db)
  await sql`DELETE FROM public."MeetingSeries" WHERE "meetingType" = 'teamHealth'`.execute(db)
  await sql`DELETE FROM public."MeetingTemplate" WHERE "type" = 'teamHealth'`.execute(db)
  await sql`UPDATE public."Team" SET "lastMeetingType" = 'retrospective' WHERE "lastMeetingType" = 'teamHealth'`.execute(
    db
  )

  await sql`ALTER TYPE public."MeetingTypeEnum" RENAME TO "MeetingTypeEnum_old"`.execute(db)
  await sql`
    CREATE TYPE public."MeetingTypeEnum" AS ENUM (
      'action',
      'retrospective',
      'poker',
      'teamPrompt'
    )
  `.execute(db)
  await sql`
    ALTER TABLE public."NewMeeting"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingMember"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingSettings"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingSeries"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingTemplate"
    ALTER COLUMN "type" TYPE public."MeetingTypeEnum"
    USING "type"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`ALTER TABLE public."Team" ALTER COLUMN "lastMeetingType" DROP DEFAULT`.execute(db)
  await sql`
    ALTER TABLE public."Team"
    ALTER COLUMN "lastMeetingType" TYPE public."MeetingTypeEnum"
    USING "lastMeetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`ALTER TABLE public."Team" ALTER COLUMN "lastMeetingType" SET DEFAULT 'retrospective'`.execute(
    db
  )
  await sql`DROP TYPE public."MeetingTypeEnum_old"`.execute(db)
}
