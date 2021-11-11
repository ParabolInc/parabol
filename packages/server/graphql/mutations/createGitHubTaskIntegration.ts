import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import GitHubIssueId from '../../../client/shared/gqlIds/GitHubIssueId'
import GitHubRepoId from '../../../client/shared/gqlIds/GitHubRepoId'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext, GQLResolveInfo} from '../graphql'
import CreateGitHubTaskIntegrationPayload from '../types/CreateGitHubTaskIntegrationPayload'
import createGitHubTask from './helpers/createGitHubTask'
import makeCreateGitHubTaskComment from '../../utils/makeCreateGitHubTaskComment'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../appOrigin'

type CreateGitHubTaskIntegrationMutationVariables = {
  nameWithOwner: string
  taskId: string
}
export default {
  name: 'CreateGitHubTaskIntegration',
  type: CreateGitHubTaskIntegrationPayload,
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the task to convert to a GH issue'
    },
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The owner/repo string'
    }
  },
  resolve: async (
    _source: any,
    {nameWithOwner, taskId}: CreateGitHubTaskIntegrationMutationVariables,
    context: GQLContext,
    info: GQLResolveInfo
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const task = await r
      .table('Task')
      .get(taskId)
      .run()
    if (!task) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }
    const {teamId, userId} = task
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    if (task.integration) {
      return standardError(
        new Error(`That task is already linked to ${task.integration.service}`),
        {userId: viewerId}
      )
    }
    const {repoOwner, repoName} = GitHubRepoId.split(nameWithOwner)
    if (!repoOwner || !repoName) {
      return standardError(new Error(`${nameWithOwner} is not a valid repository`), {
        userId: viewerId
      })
    }

    const {content: rawContentStr, meetingId} = task
    const [viewerAuth, assigneeAuth, team, teamMembers] = await Promise.all([
      dataLoader.get('githubAuth').load({teamId, userId: viewerId}),
      userId ? dataLoader.get('githubAuth').load({teamId, userId}) : null,
      dataLoader.get('teams').load(teamId),
      dataLoader.get('teamMembersByTeamId').load(teamId)
    ])
    const auth = viewerAuth ?? assigneeAuth
    const accessUserId = viewerAuth ? viewerId : assigneeAuth ? userId : null
    if (!accessUserId) {
      return standardError(
        new Error(`Assignment failed! Neither you nor the assignee has access to GitHub`),
        {userId: viewerId}
      )
    }
    // using teamMembers to get the preferredName as we need the members for the notification part anyways
    const {preferredName: viewerName} = teamMembers.find(({userId}) => userId === viewerId)
    const {preferredName: assigneeName} =
      (userId && teamMembers.find((user) => user.userId === userId)) || {}

    // RESOLUTION
    const {name: teamName} = team
    const teamDashboardUrl = makeAppURL(appOrigin, `team/${teamId}`)
    const createdBySomeoneElseComment =
      userId && userId !== viewerId
        ? makeCreateGitHubTaskComment(viewerName, assigneeName, teamName, teamDashboardUrl)
        : undefined

    const res = await createGitHubTask(
      rawContentStr,
      repoOwner,
      repoName,
      auth,
      context,
      info,
      createdBySomeoneElseComment
    )
    if (res.error) {
      return {error: {message: res.error.message}}
    }
    const {issueNumber} = res

    await r
      .table('Task')
      .get(taskId)
      .update({
        integrationHash: GitHubIssueId.join(nameWithOwner, issueNumber),
        integration: {
          accessUserId,
          service: 'github',
          issueNumber,
          nameWithOwner
        },
        updatedAt: now
      })
      .run()
    const data = {taskId}
    teamMembers.forEach(({userId}) => {
      publish(
        SubscriptionChannel.TASK,
        userId,
        'CreateGitHubTaskIntegrationPayload',
        data,
        subOptions
      )
    })
    segmentIo.track({
      userId: viewerId,
      event: 'Published Task to GitHub',
      properties: {
        teamId,
        meetingId
      }
    })
    return data
  }
}
