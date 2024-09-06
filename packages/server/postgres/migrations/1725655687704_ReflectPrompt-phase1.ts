import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    CREATE TABLE IF NOT EXISTS "ReflectPrompt" (
      "id" VARCHAR(100) PRIMARY KEY,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "removedAt" TIMESTAMP WITH TIME ZONE,
      "description" VARCHAR(256) NOT NULL,
      "groupColor" VARCHAR(9) NOT NULL,
      "sortOrder" VARCHAR(64) NOT NULL COLLATE "C",
      "question" VARCHAR(100) NOT NULL,
      "teamId" VARCHAR(100) NOT NULL,
      "templateId" VARCHAR(100) NOT NULL,
      "parentPromptId" VARCHAR(100),
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_templateId"
        FOREIGN KEY("templateId")
          REFERENCES "MeetingTemplate"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_ReflectPrompt_teamId" ON "ReflectPrompt"("teamId");
    CREATE INDEX IF NOT EXISTS "idx_ReflectPrompt_templateId" ON "ReflectPrompt"("templateId");
    CREATE INDEX IF NOT EXISTS "idx_ReflectPrompt_parentPromptId" ON "ReflectPrompt"("templateId");
  END $$;
`)
  // TODO add constraint parentPromptId constraint
  //       CONSTRAINT "fk_parentPromptId"
  // FOREIGN KEY("parentPromptId")
  //   REFERENCES "MeetingTemplate"("id")
  //   ON DELETE CASCADE

  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE "Comment";
    ` /* Do undo magic */)
  await client.end()
}
