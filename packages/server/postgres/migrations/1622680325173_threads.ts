import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(): Promise<void> {
  // use the client here so the next migration runs in serial
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
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
  await client.end()
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    DROP TYPE IF EXISTS "DiscussionTopicTypeEnum" CASCADE;
    DROP TABLE IF EXISTS "Discussion";
  `)
}
