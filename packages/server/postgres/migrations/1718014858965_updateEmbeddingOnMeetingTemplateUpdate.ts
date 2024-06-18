import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    CREATE OR REPLACE FUNCTION "updateEmbedding"()
    RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
    DECLARE
      "metadataId" INTEGER;
    BEGIN
      BEGIN
        SELECT id FROM "EmbeddingsMetadata" WHERE "objectType" = 'meetingTemplate' AND "refId" = NEW.id INTO STRICT "metadataId";
      EXCEPTION
        WHEN NO_DATA_FOUND THEN
          INSERT INTO "EmbeddingsMetadata" ("objectType", "refId", "teamId", "refUpdatedAt") VALUES ('meetingTemplate', NEW.id, NEW."teamId", NEW."updatedAt") RETURNING id INTO "metadataId";
      END;
      INSERT INTO "EmbeddingsJobQueue" ("embeddingsMetadataId", "jobType", "priority", "model") VALUES ("metadataId", 'embed:start', "getEmbedderPriority"(1), 'Embeddings_ember_1') ON CONFLICT DO NOTHING;
      RETURN NEW;
    END
    $$;
    DROP TRIGGER IF EXISTS "update_embedding_on_MeetingTemplate" ON "MeetingTemplate";
    CREATE TRIGGER "update_embedding_on_MeetingTemplate" AFTER INSERT OR UPDATE ON "MeetingTemplate" FOR EACH ROW EXECUTE PROCEDURE "updateEmbedding"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_embedding_on_MeetingTemplate" ON "User";
    DROP FUNCTION IF EXISTS "update_embedding_on_MeetingTemplate"();
  `)
  await client.end()
}
