import {sql} from 'kysely'
import getKysely from 'parabol-server/postgres/getKysely'
import {getNewDataLoader} from '../server/dataloader/getNewDataLoader'
import {EmbedderJobType} from './EmbedderJobType'
import {JobQueueError} from './JobQueueError'
import {DBJob, JobType, Workflow} from './custom'
import {embedMetadata} from './workflows/embedMetadata'
import {getSimilarRetroTopics} from './workflows/getSimilarRetroTopics'
import {relatedDiscussionsStart} from './workflows/relatedDiscussionsStart'
import {rerankRetroTopics} from './workflows/rerankRetroTopics'

export class WorkflowOrchestrator {
  workflows: Record<string, Workflow> = {
    embed: {
      start: {
        run: embedMetadata
      }
    },
    relatedDiscussions: {
      start: {
        run: relatedDiscussionsStart,
        getNextStep: () => 'embed'
      },
      embed: {
        run: embedMetadata,
        getNextStep: () => 'getSimilarRetroTopics'
      },
      getSimilarRetroTopics: {
        run: getSimilarRetroTopics,
        getNextStep: () => 'rerank'
      },
      rerank: {
        run: rerankRetroTopics
      }
    }
  }

  private failJob = async (jobId: number, retryCount: number, error: JobQueueError) => {
    const pg = getKysely()
    const {message, retryDelay, jobData} = error
    const maxRetries = error.maxRetries ?? 10
    await pg
      .updateTable('EmbeddingsJobQueue')
      .set((eb) => ({
        state: 'failed',
        stateMessage: message,
        retryCount: eb('retryCount', '+', 1),
        retryAfter:
          retryDelay && retryCount < maxRetries ? new Date(Date.now() + retryDelay) : null,
        jobData: jobData ? sql`jsonb_concat("jobData", ${JSON.stringify({jobData})})` : undefined
      }))
      .where('id', '=', jobId)
      .executeTakeFirstOrThrow()
  }

  private finishJob = async (jobId: number) => {
    const pg = getKysely()
    await pg.deleteFrom('EmbeddingsJobQueue').where('id', '=', jobId).executeTakeFirstOrThrow()
  }

  private addNextJob = async (
    jobType: JobType,
    priority: number,
    data: Record<string, any> | Record<string, any>[]
  ) => {
    const pg = getKysely()
    const getValues = (datum: any, idx = 0) => {
      const {embeddingsMetadataId, model, ...jobData} = datum
      return {
        jobType,
        // increment by idx so the first item goes first
        priority: priority + idx,
        embeddingsMetadataId,
        model,
        jobData: JSON.stringify(jobData)
      }
    }
    const values = Array.isArray(data) ? data.map(getValues) : getValues(data)
    await pg.insertInto('EmbeddingsJobQueue').values(values).execute()
  }

  runStep = async (job: DBJob) => {
    const {id: jobId, jobData, jobType, priority, retryCount, embeddingsMetadataId, model} = job
    const {workflowName, stepName} = EmbedderJobType.split(jobType)
    const workflow = this.workflows[workflowName]
    if (!workflow)
      return this.failJob(
        jobId,
        retryCount,
        new JobQueueError(`Workflow ${workflowName} not found`)
      )
    const step = workflow[stepName]
    if (!step)
      return this.failJob(jobId, retryCount, new JobQueueError(`Step ${stepName} not found`))
    const {run, getNextStep} = step
    const dataLoader = getNewDataLoader()
    let result: Awaited<ReturnType<typeof run>> = false
    const data = {...jobData, embeddingsMetadataId, model}
    try {
      result = await run({dataLoader, data})
    } catch (e) {
      if (e instanceof Error) {
        result = new JobQueueError(`Uncaught error: ${e.message}`)
        result.stack = e.stack
      }
    }
    dataLoader.dispose()
    if (result instanceof JobQueueError) return this.failJob(jobId, retryCount, result)
    await this.finishJob(jobId)
    if (result === false) return
    const nextStepName = await getNextStep?.({dataLoader, data: {...data, ...result}})
    if (!nextStepName) return
    const nextJobType = EmbedderJobType.join(workflowName, nextStepName)
    await this.addNextJob(nextJobType, priority, result)
  }
}
