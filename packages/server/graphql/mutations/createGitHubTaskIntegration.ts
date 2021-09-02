import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import GitHubIssueId from '../../../client/shared/gqlIds/GitHubIssueId'
import GitHubRepoId from '../../../client/shared/gqlIds/GitHubRepoId'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateGitHubTaskIntegrationPayload from '../types/CreateGitHubTaskIntegrationPayload'
import createGitHubTask from './helpers/createGitHubTask'

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
    info
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
    const {teamId} = task
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

    // RESOLUTION
    const {content: rawContentStr, meetingId} = task
    const viewerAuth = await dataLoader.get('githubAuth').load({teamId, userId: viewerId})

    if (!viewerAuth) {
      return standardError(
        new Error(`Assignment failed! The assignee does not have access to GitHub`),
        {userId: viewerId}
      )
    }

    const res = await createGitHubTask(
      rawContentStr,
      repoOwner,
      repoName,
      viewerAuth,
      context,
      info
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
          accessUserId: viewerId,
          service: 'github',
          issueNumber,
          nameWithOwner
        },
        updatedAt: now
      })
      .run()
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
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
