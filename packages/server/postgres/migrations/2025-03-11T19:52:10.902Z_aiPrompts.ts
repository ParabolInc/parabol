import {sql, type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('AIPrompt')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('userId', 'varchar(100)', (col) => col.notNull())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
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
        title: 'Wins, Challenges, and Recommendations',
        content: `You are an expert in agile retrospectives and project management.

Analyze this data and provide key insights on:
- The most significant **wins** in terms of completed work, team collaboration, or project improvements.
- The biggest **challenges** faced by the team.
- Any **trends** in the conversations (e.g., recurring blockers, common frustrations, or successful strategies).
- Suggestions for improving efficiency based on the data.

Use a structured response format with **Wins**, **Challenges**, and **Recommendations**. No yapping. No introductory sentence.`
      },
      {
        userId: 'aGhostUser',
        title: 'Psychological Safety & Team Dynamics',
        content: `Analyze the retrospective discussions, sprint poker meetings, and daily standups to assess the level of psychological safety within the teams. Identify signs of open communication, hesitancy in raising concerns, and patterns of dominant voices versus silent participants. Provide insights on how team dynamics influence decision-making and suggest actionable steps to improve collaboration and inclusivity. No yapping. Try for about 300 words.`
      },
      {
        userId: 'aGhostUser',
        title: 'Sprint Predictability & Estimation Accuracy',
        content: `Evaluate how well our sprint planning aligns with actual execution by analyzing the consistency of our sprint poker estimates versus completed work. Identify patterns where underestimation or overestimation is common, and assess whether work spillover trends indicate scope creep, bottlenecks, or blockers. Provide recommendations to improve sprint predictability and estimation accuracy. No yapping. Try for about 300 words.`
      },
      {
        userId: 'aGhostUser',
        title: 'Sentiment & Morale Trends Over Time',
        content: `Perform a sentiment analysis of the team's discussions during retrospectives, standups, and sprint poker meetings. Identify changes in morale, motivation, and stress levels over the past three months. Highlight any correlations between team sentiment and sprint outcomes, workload, or external factors. Provide insights on how to boost team morale and engagement. No yapping. Try for about 300 words.`
      }
    ])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('AIPrompt').execute()
}
