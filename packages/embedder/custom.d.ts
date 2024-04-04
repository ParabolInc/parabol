import {DataLoaderInstance} from '../server/dataloader/RootDataLoader'
import type {DB} from '../server/postgres/pg'

export type EmbeddingObjectType = DB['EmbeddingsMetadata']['objectType']

interface MessageToEmbedderRelatedDiscussions {
  jobType: 'relatedDiscussions:start'
  data: {meetingId: string}
}

export type MessageToEmbedder = {priority: number} & MessageToEmbedderRelatedDiscussions

type GetInputData<T> = T extends JobQueueStepRun<infer U> ? U : never
export type ParentJob<T> = GetInputData<T> | GetInputData<T>[]

interface StepContext<TData> {
  dataLoader: DataLoaderInstance
  data: TData
}

type StepResult = Record<string, any> | Record<string, any>[]
export type JobQueueStepRun<TData, TResult = StepResult> = (
  context: StepContext<TData>
  // false if the job completed without error, but the flow should not continue
  // e.g. could not create an embeddings because there wasn't enough text or it was in Russian
) => Promise<TResult | JobQueueError | false>

interface JobQueueStep<TData, TResult = StepResult> {
  run: JobQueueStepRun<TData, TResult>
  getNextStep?: (result: TResult) => StepName | Promise<StepName>
}

export interface Workflow {
  name: WorkflowName
  steps: Record<string, JobQueueStep<any>>
}

export type WorkflowName = 'relatedDiscussions'
export type StepName = 'start' | 'embed' | 'embedRerank' | 'getSimilarRetroTopics' | 'rerank'

export type JobType = `${WorkflowName}:${StepName}`
export type DBJob = Omit<Selectable<DB['EmbeddingsJobQueue']>, 'jobType'> & {
  jobType: JobType
}
