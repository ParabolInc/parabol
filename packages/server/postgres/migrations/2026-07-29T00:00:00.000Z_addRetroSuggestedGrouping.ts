import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('SuggestedGroupsModeEnum').asEnum(['similarity', 'ai']).execute()

  // A retro's active grouping — the arrangement a grouper proposed, plus the config that produced
  // it. One row carries many groups, in the jsonb column below.
  // Only successful runs are recorded: a failure is thrown back to the caller, never persisted.
  // meetingId is the primary key because a meeting has exactly one active grouping — regenerating
  // replaces it rather than accumulating history.
  await db.schema
    .createTable('RetroSuggestedGrouping')
    .ifNotExists()
    .addColumn('meetingId', 'varchar(100)', (col) =>
      col.primaryKey().references('NewMeeting.id').onDelete('cascade')
    )
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('createdByUserId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('mode', sql`"SuggestedGroupsModeEnum"`, (col) => col.notNull())
    // Matches the MAX_USER_PROMPT_LENGTH the generateSuggestedGroups mutation enforces
    .addColumn('userPrompt', 'varchar(2000)')
    .addColumn('sameColumnOnly', 'boolean', (col) => col.notNull().defaultTo(false))
    // sha256 of the sorted ids of the reflections fed to the grouper. Lets an identical request
    // reuse the stored answer instead of paying for another LLM call
    .addColumn('inputHash', 'varchar(64)', (col) => col.notNull())
    // AutogroupReflectionGroupType[]: [{groupTitle, reflectionIds}]
    .addColumn('groups', 'jsonb', (col) => col.notNull())
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('RetroSuggestedGrouping').ifExists().execute()
  await db.schema.dropType('SuggestedGroupsModeEnum').ifExists().execute()
}
