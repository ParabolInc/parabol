import {sql} from 'kysely'
import getKysely from 'parabol-server/postgres/getKysely'
import type {EmbeddingsJobQueueV2} from 'parabol-server/postgres/types'
import {getNewDataLoader} from '../server/dataloader/getNewDataLoader'
import type {ModelId} from './ai_models/modelIdDefinitions'
import type {JobType, StepResult, Workflow} from './custom'
import {EmbedderJobType} from './EmbedderJobType'
import {FAILED_JOB_PENALTY} from './getEmbedderJobPriority'
import {JobQueueError} from './JobQueueError'
import {embedMetadata} from './workflows/embedMetadata'
import {embedPage} from './workflows/embedPage'
import {embedQuery} from './workflows/embedQuery'
import {getSimilarRetroTopics} from './workflows/getSimilarRetroTopics'
import {relatedDiscussionsStart} from './workflows/relatedDiscussionsStart'
import {rerankRetroTopics} from './workflows/rerankRetroTopics'

export class WorkflowOrchestrator {
  workflows: Record<string, Workflow> = {
    userQuery: {
      start: {
        run: embedQuery
      }
    },
    embedPage: {
      start: {
        run: embedPage
      }
    },
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

  private failJob = async (
    jobId: number,
    error: JobQueueError,
    previousErrorMessage?: string | undefined | null
  ) => {
    const pg = getKysely()
    const {jobData, retry} = error
    const message = error.message.slice(0, 8192)
    if (!retry || previousErrorMessage === message) {
      await pg
        .updateTable('EmbeddingsJobQueueV2')
        .set((eb) => ({
          state: 'queued',
          stateMessage: message,
          priority: eb('priority', '+', FAILED_JOB_PENALTY),
          retryCount: eb('retryCount', '+', 1),
          jobData: jobData ? sql`jsonb_concat("jobData", ${JSON.stringify({jobData})})` : undefined
        }))
        .where('id', '=', jobId)
        .executeTakeFirstOrThrow()
      return
    }
    await pg
      .with('deletedJob', (qc) =>
        qc.deleteFrom('EmbeddingsJobQueueV2').where('id', '=', jobId).returningAll()
      )
      .insertInto('EmbeddingsFailures')
      .columns([
        'embeddingsMetadataId',
        'modelId',
        'message',
        'retryCount',
        'jobData',
        'jobType',
        'pageId'
      ])
      .expression(({selectFrom}) =>
        selectFrom('deletedJob').select(({ref}) => [
          ref('deletedJob.embeddingsMetadataId').as('embeddingsMetadataId'),
          ref('deletedJob.modelId').as('modelId'),
          sql.lit(message).as('message'),
          ref('deletedJob.retryCount').as('retryCount'),
          ref('deletedJob.jobData').as('jobData'),
          ref('deletedJob.jobType').as('jobType'),
          ref('deletedJob.pageId').as('pageId')
        ])
      )
      .execute()
  }

  private finishJob = async (jobId: number) => {
    const pg = getKysely()
    await pg.deleteFrom('EmbeddingsJobQueueV2').where('id', '=', jobId).executeTakeFirstOrThrow()
  }

  private addNextJob = async (jobType: JobType, priority: number, data: StepResult) => {
    const pg = getKysely()
    interface Datum {
      embeddingsMetadataId?: number
      jobType: JobType
      priority: number
      modelId: ModelId
      pageId?: number
    }
    const getValues = (datum: Datum, idx = 0) => {
      const {embeddingsMetadataId, modelId, pageId, ...jobData} = datum
      return {
        jobType,
        // increment by idx so the first item goes first
        priority: priority + idx,
        embeddingsMetadataId,
        modelId,
        pageId,
        jobData: JSON.stringify(jobData)
      }
    }
    const values = Array.isArray(data) ? data.map(getValues) : getValues(data)
    await pg.insertInto('EmbeddingsJobQueueV2').values(values).execute()
  }

  runStep = async (job: EmbeddingsJobQueueV2) => {
    const {
      id: jobId,
      jobData,
      jobType,
      priority,
      embeddingsMetadataId,
      modelId,
      pageId,
      stateMessage
    } = job
    const {workflowName, stepName} = EmbedderJobType.split(jobType)
    const workflow = this.workflows[workflowName]
    if (!workflow)
      return this.failJob(jobId, new JobQueueError(`Workflow ${workflowName} not found`))
    const step = workflow[stepName]
    if (!step) return this.failJob(jobId, new JobQueueError(`Step ${stepName} not found`))
    const {run, getNextStep} = step
    const dataLoader = getNewDataLoader('WorkflowOrchestrator')
    let result: Awaited<ReturnType<typeof run>> = false
    const data = {...jobData, embeddingsMetadataId, modelId, pageId}
    try {
      result = await run({dataLoader, data})
    } catch (e) {
      if (e instanceof Error) {
        result = new JobQueueError(`Uncaught error: ${e.message}`)
      }
    }
    dataLoader.dispose()
    if (result instanceof JobQueueError) return this.failJob(jobId, result, stateMessage)
    await this.finishJob(jobId)
    if (result === false) return
    const nextStepName = await getNextStep?.({
      dataLoader,
      data: {...data, ...result}
    })
    if (!nextStepName) return
    const nextJobType = EmbedderJobType.join(workflowName, nextStepName)
    await this.addNextJob(nextJobType, priority, result)
  }
}
