import {sql} from 'kysely'
import type {ModelId} from '../../../embedder/ai_models/modelIdDefinitions'
import TextEmbeddingsInference from '../../../embedder/ai_models/TextEmbeddingsInference'
import getKysely from '../../postgres/getKysely'

jest.mock('../../../embedder/ai_models/modelIdDefinitions', () => {
  const actual = jest.requireActual<
    typeof import('../../../embedder/ai_models/modelIdDefinitions')
  >('../../../embedder/ai_models/modelIdDefinitions')
  return {
    ...actual,
    modelIdDefinitions: {
      ...actual.modelIdDefinitions,
      createTableTest: {
        ...actual.modelIdDefinitions['Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8#v3'],
        tableSuffix: 'create_table_test'
      }
    }
  }
})

const pg = getKysely()
const modelId = 'createTableTest' as ModelId

afterAll(async () => {
  await pg.deleteFrom('EmbeddingsJobQueueV2').where('modelId', '=', modelId).execute()
  await sql`DROP TABLE IF EXISTS "EmbeddingsPages_create_table_test", "Embeddings_create_table_test"`.execute(
    pg
  )
  await pg.destroy()
})

it("creates a generation's tables without queueing jobs", async () => {
  await new TextEmbeddingsInference(modelId, 'http://localhost:3040/', 2048).createTable()
  const {rows} = await sql<{tablename: string}>`
    SELECT tablename FROM pg_tables
    WHERE tablename IN ('Embeddings_create_table_test', 'EmbeddingsPages_create_table_test')
  `.execute(pg)
  expect(rows).toHaveLength(2)
  const {count} = await pg
    .selectFrom('EmbeddingsJobQueueV2')
    .select(sql<number>`count(*)::int`.as('count'))
    .where('modelId', '=', modelId)
    .executeTakeFirstOrThrow()
  expect(count).toBe(0)
})
