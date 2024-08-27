import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    CREATE TABLE IF NOT EXISTS "Comment" (
      "id" VARCHAR(100) PRIMARY KEY,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      "isAnonymous" BOOLEAN NOT NULL DEFAULT FALSE,
      "threadParentId" VARCHAR(100),
      "reactjis" "Reactji"[] NOT NULL DEFAULT array[]::"Reactji"[],
      "content" JSONB NOT NULL,
      "createdBy" VARCHAR(100) NOT NULL,
      "plaintextContent" VARCHAR(2000) NOT NULL,
      "discussionId" VARCHAR(100) NOT NULL,
      "threadSortOrder" INTEGER NOT NULL,
      CONSTRAINT "fk_createdBy"
        FOREIGN KEY("createdBy")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_discussionId"
        FOREIGN KEY("discussionId")
          REFERENCES "Discussion"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_Comment_threadParentId" ON "Comment"("threadParentId");
    CREATE INDEX IF NOT EXISTS "idx_Comment_createdBy" ON "Comment"("createdBy");
    CREATE INDEX IF NOT EXISTS "idx_Comment_discussionId" ON "Comment"("discussionId");
  END $$;
`)
  // TODO add constraint threadParentId in phase 2
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
