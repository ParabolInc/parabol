// call with yarn sucrase-node billing/debug.ts
import '../../scripts/webpack/utils/dotenv'
import getKysely from '../server/postgres/getKysely'
import {WorkflowOrchestrator} from './WorkflowOrchestrator'
import {Logger} from '../server/utils/Logger'

const debugFailedJob = async () => {
  const pg = getKysely()
  const failedJob = await pg
    .selectFrom('EmbeddingsJobQueue')
    .selectAll()
    .orderBy(['priority'])
    .where('state', '=', 'failed')
    .limit(1)
    .executeTakeFirst()

  if (!failedJob) {
    Logger.log('No failed jobs found')
    return
  }

  Logger.log('Debugging job:', failedJob.id)
  const orch = new WorkflowOrchestrator()
  await orch.runStep(failedJob as any)
  // const man = getModelManager()
  // const model = man.embeddingModels.get('Embeddings_ember_1')
  // const res = await model?.chunkText('hey there')
}

debugFailedJob()
