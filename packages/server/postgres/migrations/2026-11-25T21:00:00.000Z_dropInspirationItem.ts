import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS "InspirationItem"`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS "InspirationItem" (
      "id" bigserial PRIMARY KEY,
      "meetingId" varchar(100) NOT NULL REFERENCES "NewMeeting"("id") ON DELETE CASCADE,
      "userId" varchar(100) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "service" varchar(255) NOT NULL,
      "title" varchar(255),
      "content" jsonb NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "promptId" varchar(100) REFERENCES "TemplatePrompt"("id") ON DELETE SET NULL
    )
  `.execute(db)
  await sql`
    CREATE INDEX IF NOT EXISTS "idx_InspirationItem_meetingId_userId_service"
    ON "InspirationItem" ("userId", "meetingId", "service")
  `.execute(db)
}
