import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'
import JiraIssue from './JiraIssue'
import {getUserId} from '../../utils/authorization'
import sendToSentry from '../../utils/sendToSentry'
import AtlassianServerManager from '../../utils/AtlassianServerManager'

const JiraCreateIssuePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraCreateIssuePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    issue: {
      type: JiraIssue,
      description: 'The issue straight from Jira',
      resolve: async ({teamId, cloudId, key}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        // we need the access token of a person on this team
        const teamAuths = await dataLoader.get('atlassianAuthByTeamId').load(teamId)
        const [teamAuth] = teamAuths
        if (!teamAuth) {
          sendToSentry(new Error('No atlassian access token exists for team'), {userId: viewerId})
          return null
        }
        const {userId} = teamAuth
        const accessToken = await dataLoader.get('freshAtlassianAccessToken').load({teamId, userId})
        const manager = new AtlassianServerManager(accessToken)
        const issueRes = await manager.getIssue(cloudId, key)
        if ('message' in issueRes) {
          sendToSentry(new Error(issueRes.message), {userId: viewerId})
          return null
        }
        if ('errors' in issueRes) {
          const error = issueRes.errors[0]
          sendToSentry(new Error(error), {userId: viewerId})
          return null
        }
        const data = {
          ...issueRes.fields,
          cloudId,
          key
        }
        return data
      }
    },
    meetingId: {
      type: GraphQLID,
      description: 'The id of the meeting where the Jira issue is being created'
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the team that is creating the Jira issue'
    }
  })
})

export default JiraCreateIssuePayload
