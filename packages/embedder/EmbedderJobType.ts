import {JobType} from './custom'

type SplitJobType<T extends string> = T extends `${infer W}:${infer S}` ? [W, S] : never
export const EmbedderJobType = {
  join: (workflowName: string, stepName: string) => `${workflowName}:${stepName}` as JobType,
  split: (jobType: JobType) => {
    const [workflowName, stepName] = jobType.split(':') as SplitJobType<typeof jobType>
    return {workflowName, stepName}
  }
}
