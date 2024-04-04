import {DataLoaderInstance} from '../server/dataloader/RootDataLoader'
import type {DB} from '../server/postgres/pg'
import {JobQueueError} from './JobQueueError'
import type {EmbedWorkflow} from './workflows/EmbedWorkflow'
import type {RelatedDiscussionsWorkflow} from './workflows/RelatedDiscussionsWorkflow'

type TDist<T> = [T] extends [any] ? T : never

type Workflows = EmbedWorkflow | RelatedDiscussionsWorkflow

// keyof (A | B) = keyof A & keyof B, so we use a conditional type to make it distributive
type ExtractJobTypes<T> = T extends any ? `${T['name']}:${keyof T['steps']}` : never

export type JobType = ExtractJobTypes<Workflows>
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

export interface Workflow {
  name: string
  steps: Record<string, JobQueueStep<any>>
}
export type DBJob = Omit<Selectable<DB['EmbeddingsJobQueue']>, 'jobType'> & {
  jobType: JobType
}
