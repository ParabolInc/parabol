import {ContentState, convertFromRaw} from 'draft-js'
import {stateToMarkdown} from 'draft-js-export-markdown'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import db from '../../db'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import JiraCreateIssuePayload from '../types/JiraCreateIssuePayload'

export default {
  name: 'JiraCreateIssue',
  type: JiraCreateIssuePayload,
  args: {
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The rich text body of the Jira issue'
    },
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The atlassian cloudId for the site'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The atlassian key of the project to put the issue in'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team that is creating the issue'
    },
    meetingId: {
      type: GraphQLID,
      description:
        'The id of the meeting where the Jira issue is being created. Null if it is not being created in a meeting.'
    }
  },
  resolve: async (
    _source: object,
    {content, cloudId, projectKey, teamId, meetingId}: any, // TODO: use correct type
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const userAuths = await Promise.all([dataLoader.get('atlassianAuthByUserId').load(viewerId)])
    console.log('userAuths', userAuths)
    const [viewerAuth, assigneeAuth] = userAuths.map((auths) =>
      auths.find((auth) => auth.teamId === teamId)
    )
    console.log('viewerAuth, assigneeAuth', viewerAuth, assigneeAuth)

    // TODO: prob change assignee
    if (!assigneeAuth || !assigneeAuth.isActive) {
      return standardError(new Error('The assignee does not have access to Jira'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    const rawContent = JSON.parse(content)
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
    console.log('contentState', contentState)
    let markdown = stateToMarkdown(contentState)

    const isViewerAllowed = viewerAuth ? viewerAuth.isActive : false
    if (!isViewerAllowed) {
      const creator = await db.read('User', viewerId)
      const creatorName = creator.preferredName
      markdown = `${markdown}\n\n_Added by ${creatorName}_`
    }
    console.log('markdown', markdown)

    // const tokenUserId = isViewerAllowed ? viewerId : userId
    const accessToken = await dataLoader
      .get('freshAtlassianAccessToken')
      .load({teamId, userId: viewerId})
    const manager = new AtlassianServerManager(accessToken)

    const [sites, issueMetaRes, description] = await Promise.all([
      manager.getAccessibleResources(),
      manager.getCreateMeta(cloudId, [projectKey]),
      manager.convertMarkdownToADF(markdown)
    ] as const)
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
      description,
      // ERROR: Field 'reporter' cannot be set. It is not on the appropriate screen, or unknown.
      assignee: {
        id: assigneeAuth.accountId
      },
      issuetype: {
        id: bestType.id
      }
    }
    const res = await manager.createIssue(cloudId, projectKey, payload)
    if ('message' in res) {
      return standardError(new Error(res.message), {userId: viewerId})
    }
    if ('errors' in res) {
      return standardError(new Error(Object.values(res.errors)[0]), {userId: viewerId})
    }

    // const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const data = payload
    // teamMembers.forEach(({userId}) => {
    //   publish(SubscriptionChannel.TASK, userId, 'JiraCreateIssuePayload', data, subOptions)
    // })
    if (meetingId) {
      publish(SubscriptionChannel.MEETING, meetingId, 'JiraCreateIssuePayload', data, subOptions)
    }
    segmentIo.track({
      userId: viewerId,
      event: 'Published Task to Jira',
      properties: {
        teamId,
        meetingId
      }
    })
    return data
  }
}
