import {GraphQLResolveInfo} from 'graphql'
import {Doc} from '../utils/convertContentStateToADF'
import {GQLContext} from '../graphql/graphql'
import {TaskIntegration} from '../database/types/Task'

export type CreateTaskResponse =
  | {
      integrationHash: string
      integration: TaskIntegration
    }
  | Error

export default abstract class AbstractTaskIntegrationManager {
  abstract title: string

  abstract createTask(params: {
    rawContentStr: string
    integrationRepoId: string
    createdBySomeoneElseComment?: Doc | string
    context?: GQLContext
    info?: GraphQLResolveInfo
  }): Promise<CreateTaskResponse>
}
