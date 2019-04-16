import {ContentState, convertFromRaw} from 'draft-js'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import CreateJiraIssuePayload from 'server/graphql/types/CreateJiraIssuePayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TASK} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'
import AtlassianManager from 'server/utils/AtlassianManager'

export default {
  name: 'CreateJiraIssue',
  type: CreateJiraIssuePayload,
  args: {
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The atlassian cloudId for the site'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The atlassian key of the project to put the issue in'
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the task to convert to a Jira issue'
    }
  },
  resolve: async (
    _source,
    {cloudId, projectKey, taskId},
    {authToken, dataLoader, socketId: mutatorId}
  ) => {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const task = await r.table('Task').get(taskId)
    if (!task) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }
    const {content: rawContentStr, teamId, userId} = task
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

    const [viewerAuth, assigneeAuth] = await Promise.all([
      dataLoader.get('atlassianAuthByUserId').load(viewerId),
      dataLoader.get('atlassianAuthByUserId').load(userId)
    ])

    if (!assigneeAuth || !assigneeAuth.isActive) {
      return standardError(new Error('The assignee does not have access to Jira'), {userId: viewerId})
    }

    // RESOLUTION
    const rawContent = JSON.parse(rawContentStr)
    const {blocks} = rawContent
    let {text: summary} = blocks[0]
    // if the summary exceeds 256, repeat it in the body because it probably has entities in it
    if (summary.length <= 256) {
      blocks.shift()
    } else {
      summary = summary.slice(0, 256)
    }

    const contentState =
      blocks.length === 0 ? ContentState.createFromText('') : convertFromRaw(rawContent)
    let description = contentState.getPlainText()
    const isViewerAllowed = viewerAuth && viewerAuth.isActive
    if (!isViewerAllowed) {
      const creatorName = await r.table('User').get(viewerId)('preferredName')
      description = `${description}\n\nAdded by ${creatorName}`
    }

    const payload = {
      summary,
      description,
      reporter: {
        id: isViewerAllowed ? viewerAuth.accountId : assigneeAuth.accountId
      },
      assignee: {
        id: assigneeAuth.accountId
      }
      // labels: ['parabol']
    }

    const tokenUserId = isViewerAllowed ? viewerId : userId
    const accessToken = await dataLoader.get('freshAtlassianAccessToken').load({teamId, userId: tokenUserId})
    const manager = new AtlassianManager(accessToken)
    const res = await manager.createIssue(cloudId, projectKey, payload)
    if ('message' in res) {
      return standardError(new Error(res.message), {userId: viewerId})
    }

    await r
      .table('Task')
      .get(taskId)
      .update({
        integration: {
          id: res.id,
          service: 'jira',
          key: res.key
        },
        updatedAt: now
      })
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const data = {taskId}
    teamMembers.forEach(({userId}) => {
      publish(TASK, userId, CreateJiraIssuePayload, data, subOptions)
    })
    return data
  }
}
