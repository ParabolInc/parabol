import {DeepPartial} from 'rethinkdb-ts/lib/internal-types'
import Task from '../database/types/Task'
import {RValue} from '../database/stricterR'

export type CreateTaskResponse = {
  error?: {
    message: string
  }
  integrationData?: RValue<DeepPartial<Task>>
}

export default abstract class BaseTaskIntegrationManager {
  // FIXME
  // abstract createTask(
  //   auth: Auth,
  //   projectId: string,
  //   createdBySomeoneElseComment?: string | Doc
  // ): Promise<CreateTaskResponse>
  //
  // abstract getCreatedBySomeoneElseComment(
  //   viewerName: string,
  //   assigneeName: string,
  //   teamName: string,
  //   teamDashboardUrl: string
  // ): any
}
