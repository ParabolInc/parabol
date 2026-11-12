import getModelManager from '../../packages/embedder/ai_models/ModelManager'
import getKysely from '../../packages/server/postgres/getKysely'
import {pgEnsureExtensions} from './pgEnsureExtensions'

// The embedder makes these tables when it starts. A database that no embedder has run against needs them
// before `pnpm pg:generate` can type them or a test can query them
const createEmbeddingsTables = async () => {
  await pgEnsureExtensions()
  const pg = getKysely()
  const embeddingModels = [...getModelManager().embeddingModels.values()]
  await Promise.all(embeddingModels.map((model) => model.createVectorTables(pg)))
  await pg.destroy()
  process.exit()
}

createEmbeddingsTables()
