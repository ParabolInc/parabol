import {type Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('InspirationItem')
    // For retrospective meetings, the AI-chosen reflect prompt (column) the item belongs to.
    // Null for team prompt items, which have no reflect prompts.
    .addColumn('promptId', 'varchar(100)', (col) =>
      col.references('ReflectPrompt.id').onDelete('set null')
    )
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('InspirationItem').dropColumn('promptId').execute()
}
