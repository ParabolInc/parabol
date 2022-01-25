import {GraphQLResolveInfo} from 'graphql'
import {GQLContext} from '../graphql/graphql'
import {getUserId} from '../utils/authorization'
import Task from '../database/types/Task'
import Team from '../database/types/Team'
import {AtlassianAuth} from '../postgres/queries/getAtlassianAuthByUserIdTeamId'
import {GitHubAuth} from '../postgres/queries/getGitHubAuthByUserIdTeamId'

type Auth = AtlassianAuth | GitHubAuth

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

  abstract createRemoteTaskAndUpdateDB(
    auth: Auth,
    taskId: string,
    projectId: string,
    viewerName: string,
    assigneeName: string
  )
}
