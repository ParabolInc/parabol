import {sql, type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('AIPrompt')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('userId', 'varchar(100)', (col) => col.notNull())
    .addColumn('content', 'varchar(8192)', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('lastUsedAt', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema.createIndex('idx_AIPrompt_userId').on('AIPrompt').column('userId').execute()

  await sql`
	CREATE OR REPLACE FUNCTION "enforceAIPromptLimit"()
	RETURNS TRIGGER AS $$
	BEGIN
			-- Only delete the oldest prompt if the user has 20+ prompts
			IF (SELECT COUNT(*) FROM "AIPrompt" WHERE "userId" = NEW."userId") >= 20 THEN
					DELETE FROM "AIPrompt"
					WHERE id = (
							SELECT id FROM "AIPrompt"
							WHERE "userId" = NEW."userId"
							ORDER BY "lastUsedAt" ASC
							LIMIT 1
					);
			END IF;
			RETURN NEW;
	END;
	$$ LANGUAGE plpgsql;`.execute(db)

  await db
    .insertInto('AIPrompt')
    .values([
      {
        userId: 'aGhostUser',
        content: `You are an expert in agile retrospectives and project management.

Analyze this data and provide key insights on:
- The most significant **wins** in terms of completed work, team collaboration, or project improvements.
- The biggest **challenges** faced by the team.
- Any **trends** in the conversations (e.g., recurring blockers, common frustrations, or successful strategies).
- Suggestions for improving efficiency based on the data.

Use a structured response format with **Wins**, **Challenges**, and **Recommendations**. No yapping. No introductory sentence.
`
      }
    ])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('AIPrompt').execute()
}
