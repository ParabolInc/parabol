// call with yarn sucrase-node billing/debug.ts
import '../../scripts/webpack/utils/dotenv'
import getModelManager from './ai_models/ModelManager'

const debugFailedJob = async () => {
  const man = getModelManager()
  const model = man.embeddingModels.get('Embeddings_ember_1')!
  const res = await model?.chunkText(text)
  console.log({res})
}

debugFailedJob()
