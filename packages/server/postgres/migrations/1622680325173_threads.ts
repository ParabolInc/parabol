import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiscussionTopicTypeEnum') THEN
        CREATE TYPE "DiscussionTopicTypeEnum" AS ENUM (
          'agendaItem',
          'reflectionGroup',
          'task',
          'githubIssue',
          'jiraIssue'
        );
      END IF;
      CREATE TABLE IF NOT EXISTS "Discussion" (
        "id" VARCHAR(50) PRIMARY KEY,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "teamId" VARCHAR(100) NOT NULL,
        "meetingId" VARCHAR(100) NOT NULL,
        "discussionTopicId" VARCHAR(100) NOT NULL,
        "discussionTopicType" "DiscussionTopicTypeEnum" NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "idx_Thread_teamId" ON "Discussion"("teamId");
      CREATE INDEX IF NOT EXISTS "idx_Thread_meetingId" ON "Discussion"("meetingId");
    END
    $$;
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    DROP TYPE "DiscussionTopicTypeEnum" CASCADE;
    DROP TABLE "Discussion";
  `)
}
