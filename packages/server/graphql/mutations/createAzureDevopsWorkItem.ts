import {ContentState, convertFromRaw} from 'draft-js'
import {stateToMarkdown} from 'draft-js-export-markdown'
import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {GQLContext} from '../graphql'
import CreateAzureDevopsWorkItemPayload from '../types/CreateAzureDevopsWorkItemPayload'
import AzureDevopsManager from '../../utils/AzureDevopsManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {ICreateAzureDevopsWorkItemOnMutationArguments} from 'parabol-client/types/graphql'
import {TASK} from 'parabol-client/utils/constants'
import sendSegmentEvent from '../../utils/sendSegmentEvent'

export default {
  name: 'CreateAzureDevopsWorkItem',
  type: CreateAzureDevopsWorkItemPayload,
  args: {
    organization: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The Azure Devops organization for the site'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The Azure Devops key of the project to put the work item in'
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the task to convert to an Azure Devops work item'
    }
  },
  resolve: async (
    _source: object,
    {organization, projectKey, taskId}: ICreateAzureDevopsWorkItemOnMutationArguments,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
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
    const {content: rawContentStr, teamId, userId, meetingId} = task
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

    const userAuths = await Promise.all([
      dataLoader.get('azureDevopsAuthByUserId').load(viewerId),
      dataLoader.get('azureDevopsAuthByUserId').load(userId)
    ])
    const [viewerAuth, assigneeAuth] = userAuths.map((auths) =>
      auths.find((auth) => auth.teamId === teamId)
    )

    if (!assigneeAuth || !assigneeAuth.isActive) {
      return standardError(new Error('The assignee does not have access to Azure Devops'), {
        userId: viewerId
      })
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
    let markdown = stateToMarkdown(contentState)

    const isViewerAllowed = viewerAuth ? viewerAuth.isActive : false
    if (!isViewerAllowed) {
      const creatorName = await r.table('User').get(viewerId)('preferredName')
      markdown = `${markdown}\n\n_Added by ${creatorName}_`
    }

    const tokenUserId = isViewerAllowed ? viewerId : userId
    const accessToken = await dataLoader
      .get('freshAzureDevopsAccessToken')
      .load({teamId, userId: tokenUserId})
    const manager = new AzureDevopsManager(accessToken)

    //    const [sites, issueMetaRes, description] = await Promise.all([
    const [sites, issueMetaRes] = await Promise.all([
      manager.getAccessibleResources(),
      manager.getCreateMeta(organization, [projectKey])
      //manager.convertMarkdownToADF(markdown)
    ])
    if ('message' in sites) {
      return standardError(new Error(sites.message), {userId: viewerId})
    }
    if ('message' in issueMetaRes) {
      return standardError(new Error(issueMetaRes.message), {userId: viewerId})
    }
    if ('errors' in issueMetaRes) {
      return standardError(new Error(Object.values(issueMetaRes.errors)[0]), {userId: viewerId})
    }
    const {projects} = issueMetaRes
    // should always be the first and only item in the project arr
    const project = projects.find((project) => project.key === projectKey)!
    const {issuetypes, name: projectName} = project
    const bestType = issuetypes.find((type) => type.name === 'Task') || issuetypes[0]
    const payload = {
      summary,
      // description,
      // ERROR: Field 'reporter' cannot be set. It is not on the appropriate screen, or unknown.
      assignee: {
        id: assigneeAuth.accountId
      },
      issuetype: {
        id: bestType.id
      }
    }
    const res = await manager.createIssue(organization, projectKey, payload)
    if ('message' in res) {
      return standardError(new Error(res.message), {userId: viewerId})
    }
    if ('errors' in res) {
      return standardError(new Error(Object.values(res.errors)[0]), {userId: viewerId})
    }

    const cloud = sites.find((site) => site.id === organization)!
    await r
      .table('Task')
      .get(taskId)
      .update({
        integration: {
          id: res.id,
          service: 'azuredevops',
          projectKey,
          projectName,
          organization,
          cloudName: cloud.name,
          workItemId: res.key
        },
        updatedAt: now
      })
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const data = {taskId}
    teamMembers.forEach(({userId}) => {
      publish(TASK, userId, CreateAzureDevopsWorkItemPayload, data, subOptions)
    })
    sendSegmentEvent('Published Task to Azure Devops', viewerId, {teamId, meetingId}).catch()
    return data
  }
}
