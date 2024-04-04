import {sql} from 'kysely'
import RootDataLoader from 'parabol-server/dataloader/RootDataLoader'
import getKysely from 'parabol-server/postgres/getKysely'
import {JobQueueError} from './JobQueueError'
import {DBJob, JobType, StepName, Workflow, WorkflowName} from './custom'

export class WorkflowOrchestrator {
  workflows: Record<string, Workflow> = {}
  constructor(workflows: Workflow[]) {
    workflows.forEach((workflow) => {
      this.workflows[workflow.name] = workflow
    })
  }

  private failJob = async (jobId: number, retryCount: number, error: JobQueueError) => {
    const pg = getKysely()
    const {message, retryDelay} = error
    const maxRetries = error.maxRetries ?? 1e6
    await pg
      .updateTable('EmbeddingsJobQueue')
      .set((eb) => ({
        state: 'failed',
        stateMessage: message,
        retryCount: eb('retryCount', '+', 1),
        retryAfter: retryDelay && retryCount < maxRetries ? new Date(Date.now() + retryDelay) : null
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
    flowId: number,
    data: Record<string, any> | Record<string, any>[]
  ) => {
    const pg = getKysely()
    // If this step creates many next steps, treat each as a new flow. Else, keep the same flow
    const values = Array.isArray(data)
      ? data.map((data, idx) => ({
          jobType,
          // increment by idx so the first item goes first
          priority: priority + idx,
          jobData: JSON.stringify(data),
          flowId: pg.selectNoFrom(({fn}) =>
            fn<number>('NEXTVAL', [sql.lit('"EmbeddingsJobQueue_flowId_seq"')]).as('flowId')
          )
        }))
      : {jobType, priority, jobData: JSON.stringify(data), flowId}
    await pg.insertInto('EmbeddingsJobQueue').values(values).execute()
  }

  runStep = async (job: DBJob) => {
    const {id: jobId, jobData, jobType, priority, flowId, retryCount} = job
    const [workflowName, stepName] = jobType.split(':') as [WorkflowName, StepName]
    const workflow = this.workflows[workflowName]
    if (!workflow)
      return this.failJob(
        jobId,
        retryCount,
        new JobQueueError(`Workflow ${workflowName} not found`)
      )
    const step = workflow.steps[stepName]
    if (!step)
      return this.failJob(jobId, retryCount, new JobQueueError(`Step ${stepName} not found`))
    const {run, getNextStep} = step
    const dataLoader = new RootDataLoader()
    let result: Awaited<ReturnType<typeof run>> | false = false
    try {
      result = await run({dataLoader, data: jobData})
    } catch (e) {
      if (e instanceof Error) {
        result = new JobQueueError(`Uncaught error: ${e.message}`)
        result.stack = e.stack
      }
    }
    if (result instanceof JobQueueError) return this.failJob(jobId, retryCount, result)
    if (result === false) return this.finishJob(jobId)
    const nextStepName = await getNextStep?.(result)
    if (!nextStepName) return this.finishJob(jobId)
    const nextJobType = `${workflowName}:${nextStepName}` as JobType
    await this.addNextJob(nextJobType, priority, flowId, result)
  }
}
