import {ContentState, convertFromRaw} from 'draft-js'
import {stateToMarkdown} from 'draft-js-export-markdown'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {
  CreateIssueMutation,
  CreateIssueMutationVariables,
  GetRepoInfoQuery,
  GetRepoInfoQueryVariables
} from '../../types/githubTypes'
import {getUserId, isTeamMember} from '../../utils/authorization'
import createIssueMutation from '../../utils/githubQueries/createIssue.graphql'
import getRepoInfo from '../../utils/githubQueries/getRepoInfo.graphql'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import {GitHubRequest} from '../rootSchema'
import CreateGitHubTaskIntegrationPayload from '../types/CreateGitHubTaskIntegrationPayload'

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
    const [repoOwner, repoName] = nameWithOwner.split('/')
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
    const {accessToken, login} = viewerAuth
    const rawContent = JSON.parse(rawContentStr)
    const {blocks} = rawContent
    let {text: title} = blocks[0]
    // if the title exceeds 256, repeat it in the body because it probably has entities in it
    if (title.length <= 256) {
      blocks.shift()
    } else {
      title = title.slice(0, 256)
    }
    const contentState =
      blocks.length === 0 ? ContentState.createFromText('') : convertFromRaw(rawContent)
    const body = stateToMarkdown(contentState)
    const githubRequest = info.schema.githubRequest as GitHubRequest
    const endpointContext = {accessToken}
    const {data: repoInfo, errors} = await githubRequest<
      GetRepoInfoQuery,
      GetRepoInfoQueryVariables
    >({
      query: getRepoInfo,
      variables: {
        assigneeLogin: login,
        repoName,
        repoOwner
      },
      info,
      endpointContext,
      batchRef: context
    })

    if (errors) {
      return {
        error: {message: errors[0].message}
      }
    }

    const {repository, user} = repoInfo
    if (!repository || !user) {
      return {error: {message: 'GitHub repo/user not found'}}
    }

    const {id: repositoryId} = repository
    const {id: ghAssigneeId} = user
    const {data: createIssueData, errors: createIssueErrors} = await githubRequest<
      CreateIssueMutation,
      CreateIssueMutationVariables
    >({
      query: createIssueMutation,
      variables: {
        input: {
          title,
          body,
          repositoryId,
          assigneeIds: [ghAssigneeId]
        }
      },
      info,
      endpointContext,
      batchRef: context
    })
    if (createIssueErrors instanceof Error) {
      return {error: {message: createIssueErrors[0].message}}
    }

    const {createIssue} = createIssueData
    if (!createIssue) {
      return {error: {message: 'GitHub create issue failed'}}
    }
    const {issue} = createIssue
    if (!issue) {
      return {error: {message: 'GitHub create issue failed'}}
    }

    const {number: issueNumber} = issue

    await r
      .table('Task')
      .get(taskId)
      .update({
        integrationHash: `${nameWithOwner}:${issueNumber}`,
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
