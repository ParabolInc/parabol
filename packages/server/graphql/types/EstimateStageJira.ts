import {GraphQLObjectType} from 'graphql'
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
      type: JiraIssue,
      description: 'the issue straight from Jira',
      resolve: async ({teamId, serviceTaskId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const [cloudId, issueKey] = serviceTaskId.split(':')
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
        const issueRes = await manager.getIssue(cloudId, issueKey)
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
          key: issueKey
        }
        Object.assign(data, issueRes.fields)
        return data
      }
    }
  })
})

export default EstimateStageJira
