import type {DataLoaderInstance} from '../server/dataloader/RootDataLoader'
import type {DB} from '../server/postgres/types/pg'
import {JobQueueError} from './JobQueueError'

export type EmbeddingObjectType = DB['EmbeddingsMetadata']['objectType']

type GetInputData<T> = T extends JobQueueStepRun<infer U> ? U : never
export type ParentJob<T> = GetInputData<T> | GetInputData<T>[]

interface StepContext<TData> {
  dataLoader: DataLoaderInstance
  data: TData
}

type StepResult = Record<string, unknown> | Record<string, unknown>[]
export type JobQueueStepRun<TData, TResult = StepResult> = (
  context: StepContext<TData>
  // false if the job completed without error, but the flow should not continue
  // e.g. could not create an embeddings because there wasn't enough text or it was in Russian
) => Promise<TResult | JobQueueError | false>

interface JobQueueStep<TData, TResult = StepResult> {
  run: JobQueueStepRun<TData, TResult>
  getNextStep?: (result: StepContext<TResult>) => string | Promise<string>
}

export type JobType = `${string}:${string}`
export type Workflow = Record<string, JobQueueStep<any>>
export type DBJob = Selectable<DB['EmbeddingsJobQueue']>
