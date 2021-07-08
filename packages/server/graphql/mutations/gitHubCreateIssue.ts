import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isTeamMember} from '../../utils/authorization'
import GitHubServerManager from '../../utils/GitHubServerManager'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import GitHubCreateIssuePayload from '../types/GitHubCreateIssuePayload'

const gitHubCreateIssue = {
  type: GraphQLNonNull(GitHubCreateIssuePayload),
  description: 'Create an issue in GitHub',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the meeting where the GitHub issue is being created'
    },
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The owner/repo string'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team that is creating the issue'
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the GH issue'
    }
  },
  resolve: async (
    _source,
    {
      meetingId,
      nameWithOwner,
      teamId,
      title
    }: {meetingId: string; nameWithOwner: string; teamId: string; title: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const viewerAuth = await dataLoader.get('githubAuth').load({teamId, userId: viewerId})
    if (!viewerAuth?.isActive) {
      return standardError(new Error('The viewer does not have access to GitHub'), {
        userId: viewerId
      })
    }
    const [repoOwner, repoName] = nameWithOwner.split('/')
    if (!repoOwner || !repoName) {
      return standardError(new Error(`${nameWithOwner} is not a valid repository`), {
        userId: viewerId
      })
    }

    // RESOLUTION
    const {accessToken} = viewerAuth
    const manager = new GitHubServerManager(accessToken)
    const repoInfo = await manager.getRepoInfo({
      repoOwner,
      repoName,
      assigneeLogin: viewerAuth.login
    })
    if (repoInfo instanceof Error) {
      return standardError(new Error(repoInfo.message), {userId: viewerId})
    }
    const {repository, user} = repoInfo
    if (!repository || !user) {
      return standardError(new Error(`${nameWithOwner} is not a valid repository`), {
        userId: viewerId
      })
    }

    const {id: repositoryId} = repository
    const {id: ghAssigneeId} = user
    const createIssueRes = await manager.createIssue({
      input: {
        title,
        repositoryId,
        assigneeIds: [ghAssigneeId]
      }
    })
    if (createIssueRes instanceof Error) {
      return standardError(createIssueRes, {userId: viewerId})
    }
    const {createIssue} = createIssueRes
    if (!createIssue) {
      return standardError(new Error(`Failed to create issue`), {
        userId: viewerId
      })
    }
    const {issue} = createIssue
    if (!issue) {
      return standardError(new Error(`Failed to create issue & return issue`), {
        userId: viewerId
      })
    }

    const {id: gitHubIssueId, number: issueNumber} = issue
    const url = `https://github.com/${nameWithOwner}/issues/${issueNumber}`
    const gitHubIssue = {
      id: gitHubIssueId,
      issueNumber,
      summary: title,
      url,
      nameWithOwner
    }

    const data = {meetingId, teamId, gitHubIssue}
    publish(SubscriptionChannel.MEETING, meetingId, 'GitHubCreateIssueSuccess', data, subOptions)
    return data
  }
}

export default gitHubCreateIssue
