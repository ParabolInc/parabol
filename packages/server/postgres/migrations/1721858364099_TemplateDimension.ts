import {Kysely, PostgresDialect, sql} from 'kysely'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const START_CHAR_CODE = 32
  const END_CHAR_CODE = 126

  function positionAfter(pos: string) {
    for (let i = pos.length - 1; i >= 0; i--) {
      const curCharCode = pos.charCodeAt(i)
      if (curCharCode < END_CHAR_CODE) {
        return pos.substr(0, i) + String.fromCharCode(curCharCode + 1)
      }
    }
    return pos + String.fromCharCode(START_CHAR_CODE + 1)
  }

  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`
  DO $$
  BEGIN
    CREATE TABLE IF NOT EXISTS "TemplateDimension" (
      "id" VARCHAR(100) PRIMARY KEY,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "name" VARCHAR(50) NOT NULL,
      "description" VARCHAR(256) NOT NULL DEFAULT '',
      "teamId" VARCHAR(100) NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "templateId" VARCHAR(100) NOT NULL,
      "scaleId" VARCHAR(100) NOT NULL,
      "sortOrder" VARCHAR(64) NOT NULL COLLATE "C",
      "removedAt" TIMESTAMP WITH TIME ZONE,
      UNIQUE ("teamId","name"),
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_templateId"
        FOREIGN KEY("templateId")
          REFERENCES "MeetingTemplate"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_scaleId"
        FOREIGN KEY("scaleId")
          REFERENCES "TemplateScale"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_TemplateDimension_teamId" ON "TemplateDimension"("teamId") WHERE "removedAt" IS NULL;
    CREATE INDEX IF NOT EXISTS "idx_TemplateDimension_scaleId" ON "TemplateDimension"("scaleId") WHERE "removedAt" IS NULL;
    CREATE INDEX IF NOT EXISTS "idx_TemplateDimension_templateId" ON "TemplateDimension"("templateId") WHERE "removedAt" IS NULL;
    DROP TRIGGER IF EXISTS "update_TemplateDimension_updatedAt" ON "TemplateDimension";
    CREATE TRIGGER "update_TemplateDimension_updatedAt" BEFORE UPDATE ON "TemplateDimension" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
    CREATE OR REPLACE FUNCTION "set_TemplateDimension_updatedAt"()
      RETURNS TRIGGER AS $t$
      BEGIN
          -- Update the updatedAt column in TemplateDimension
          UPDATE "TemplateDimension"
          SET "updatedAt" = CURRENT_TIMESTAMP
          WHERE "scaleId" = NEW."id";
          RETURN NEW;
      END;
      $t$ LANGUAGE plpgsql;
    CREATE OR REPLACE TRIGGER "update_TemplateDimension_updatedAt_from_TemplateScale"
    AFTER INSERT OR UPDATE OR DELETE ON "TemplateScale"
    FOR EACH ROW
    EXECUTE FUNCTION "set_TemplateDimension_updatedAt"();

    CREATE OR REPLACE FUNCTION "set_MeetingTemplate_updatedAt"()
      RETURNS TRIGGER AS $t$
      BEGIN
          -- Update the updatedAt column in MeetingTemplate
          UPDATE "MeetingTemplate"
          SET "updatedAt" = CURRENT_TIMESTAMP
          WHERE "id" = NEW."templateId";
          RETURN NEW;
      END;
      $t$ LANGUAGE plpgsql;
    CREATE OR REPLACE TRIGGER "update_MeetingTemplate_updatedAt_from_TemplateDimension"
    AFTER INSERT OR UPDATE OR DELETE ON "TemplateDimension"
    FOR EACH ROW
    EXECUTE FUNCTION "set_MeetingTemplate_updatedAt"();
  END $$;
`.execute(pg)

  const rDimensions = await r
    .table('TemplateDimension')
    .orderBy('sortOrder')
    .coerceTo('array')
    .run()
  const chunk = (arr: any[], size: number) =>
    Array.from({length: Math.ceil(arr.length / size)}, (_, i) =>
      arr.slice(i * size, i * size + size)
    )
  const curSortOrder = positionAfter('')
  const dimensions = rDimensions.map((dimension) => {
    const sortOrder = positionAfter(curSortOrder)
    return {
      ...dimension,
      sortOrder,
      description: dimension.description || ''
    }
  })
  const chunks = chunk(dimensions, 5000)

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        return await pg.insertInto('TemplateDimension').values(chunk).execute()
      } catch (e) {
        await Promise.all(
          chunk.map(async (row) => {
            try {
              await pg
                .insertInto('TemplateDimension')
                .values(row)
                .onConflict((oc) => oc.doNothing())
                .execute()
            } catch (e) {
              console.log(e, row)
            }
          })
        )
      }
    })
  )
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "TemplateDimension";
    ` /* Do undo magic */)
  await client.end()
}
