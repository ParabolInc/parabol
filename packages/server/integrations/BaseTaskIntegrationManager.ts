import {GraphQLResolveInfo} from 'graphql'
import {DataLoaderWorker, GQLContext} from '../graphql/graphql'
import {getUserId} from '../utils/authorization'
import Task from '../database/types/Task'

export default abstract class BaseTaskIntegrationManager {
  readonly dataLoader: DataLoaderWorker
  readonly context: GQLContext
  readonly info: GraphQLResolveInfo
  readonly teamId: string
  readonly viewerId: string
  readonly userId: string | null
  readonly task: Task
  readonly rawContentStr: string
  auth: any
  accessUserId: string | null | undefined
  public team: any
  public teamMembers: any
  public teamMember: any
  public viewerName: any
  public assigneeName: any

  constructor(task: Task, context: GQLContext, info: GraphQLResolveInfo) {
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)
    const {content: rawContentStr, teamId, userId} = task

    this.rawContentStr = rawContentStr
    this.task = task
    this.dataLoader = dataLoader
    this.teamId = teamId
    this.viewerId = viewerId
    this.userId = userId
    this.context = context
    this.info = info
  }

  abstract getAuthLoader()

  abstract createRemoteTaskAndUpdateDB(taskId: string, projectId: string)

  async init() {
    const [viewerAuth, assigneeAuth, team, teamMembers] = await Promise.all([
      this.getAuthLoader().load({teamId: this.teamId, userId: this.viewerId}),
      this.userId ? this.getAuthLoader().load({teamId: this.teamId, userId: this.userId}) : null,
      this.dataLoader.get('teams').load(this.teamId),
      this.dataLoader.get('teamMembersByTeamId').load(this.teamId)
    ])

    this.auth = viewerAuth ?? assigneeAuth
    this.accessUserId = viewerAuth ? this.viewerId : assigneeAuth ? this.userId : null
    this.team = team
    this.teamMembers = teamMembers
    this.teamMember = teamMembers.find(({userId}) => userId === this.viewerId)

    if (this.teamMember) {
      this.viewerName = this.teamMember.preferredName
      this.assigneeName =
        (this.userId && teamMembers.find((user) => user.userId === this.userId)) || {}
    }
  }
}
