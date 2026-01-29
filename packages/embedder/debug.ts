// call with pnpm sucrase-node billing/debug.ts
import '../../scripts/webpack/utils/dotenv'
// import json from '../../../tipTapJson.json'
// import {TipTapChunker} from './TipTapChunker'

const debugFailedJob = async () => {
  // Test chunking
  // const chunker = new TipTapChunker()
  // const output = chunker.chunk(json as any)
  // console.log(output)
  // Test most recent failure
  // const pg = getKysely()
  // const failedJob = await pg
  //   .selectFrom('EmbeddingsFailures')
  //   .selectAll()
  //   .orderBy('lastFailedAt')
  //   .limit(1)
  //   .executeTakeFirst()
  // if (!failedJob) {
  //   Logger.log('No failed jobs found')
  //   return
  // }
  // Logger.log('Debugging job:', failedJob.id)
  // const orch = new WorkflowOrchestrator()
  // await orch.runStep(failedJob as any)
  // const man = getModelManager()
  // const model = man.embeddingModels.get('Embeddings_ember_1')
  // const res = await model?.chunkText('hey there')
}

debugFailedJob()
