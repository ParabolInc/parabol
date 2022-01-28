import {GraphQLResolveInfo} from 'graphql'
import {DeepPartial} from 'rethinkdb-ts/lib/internal-types'
import {GQLContext} from '../graphql/graphql'
import {getUserId} from '../utils/authorization'
import Task from '../database/types/Task'
import Team from '../database/types/Team'
import {AtlassianAuth} from '../postgres/queries/getAtlassianAuthByUserIdTeamId'
import {GitHubAuth} from '../postgres/queries/getGitHubAuthByUserIdTeamId'
import {RValue} from '../database/stricterR'
import {Doc} from '../utils/convertContentStateToADF'

type Auth = AtlassianAuth | GitHubAuth

export type CreateTaskResponse = {
  error?: {
    message: string
  }
  integrationData?: RValue<DeepPartial<Task>>
}

export default abstract class BaseTaskIntegrationManager {
  readonly context: GQLContext
  readonly info: GraphQLResolveInfo
  readonly teamId: string
  readonly viewerId: string
  readonly userId: string | null
  readonly task: Task
  readonly team: Team
  readonly rawContentStr: string
  readonly createdBySomeoneElse: boolean
  readonly accessUserId: string

  constructor(
    task: Task,
    team: Team,
    accessUserId: string,
    context: GQLContext,
    info: GraphQLResolveInfo
  ) {
    const {authToken} = context
    const viewerId = getUserId(authToken)
    const {content: rawContentStr, teamId, userId} = task
    this.createdBySomeoneElse = userId ? viewerId !== userId : false

    this.task = task
    this.team = team
    this.accessUserId = accessUserId
    this.context = context
    this.info = info

    this.rawContentStr = rawContentStr
    this.teamId = teamId
    this.viewerId = viewerId
    this.userId = userId
  }

  abstract createTask(
    auth: Auth,
    projectId: string,
    createdBySomeoneElseComment?: string | Doc
  ): Promise<CreateTaskResponse>

  abstract getCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string
  ): any
}
