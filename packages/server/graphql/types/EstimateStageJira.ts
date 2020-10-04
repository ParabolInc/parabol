import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId} from '../../utils/authorization'
import sendToSentry from '../../utils/sendToSentry'
import {GQLContext} from '../graphql'
import EstimateStage, {estimateStageFields} from './EstimateStage'
import JiraIssue from './JiraIssue'
import NewMeetingStage from './NewMeetingStage'

const EstimateStageJira = new GraphQLObjectType<any, GQLContext>({
  name: 'EstimateStageJira',
  description: 'The stage where the team estimates & discusses a single jira issue',
  interfaces: () => [NewMeetingStage, EstimateStage],
  isTypeOf: ({service}) => service === 'jira',
  fields: () => ({
    ...estimateStageFields(),
    issue: {
      type: GraphQLNonNull(JiraIssue),
      description: 'the issue straight from Jira',
      resolve: async ({teamId, serviceTaskId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        // we need the access token of a person on this team
        const teamAccessTokens = await dataLoader.get('atlassianAuthByTeamId').load(teamId)
        const [accessToken] = teamAccessTokens
        if (!accessToken) {
          sendToSentry(new Error('No atlassian access token exists for team'), {userId: viewerId})
          return []
        }
        const {cloudId, issueKey} = JSON.parse(serviceTaskId)
        const manager = new AtlassianServerManager(accessToken)
        const issueRes = await manager.getIssue(cloudId, issueKey)
        const data = {cloudId, key: issueKey, summary: '', description: ''}
        if ('message' in issueRes) {
          sendToSentry(new Error(issueRes.message), {userId: viewerId})
          data.summary = issueRes.message
          return data
        }
        if ('errors' in issueRes) {
          const error = issueRes.errors[0]
          sendToSentry(new Error(error), {userId: viewerId})
          data.summary = error
          return data
        }
        Object.assign(data, issueRes.fields)
        return data
      }
    }
  })
})

export default EstimateStageJira
