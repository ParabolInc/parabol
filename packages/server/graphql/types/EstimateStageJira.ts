import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveJiraIssue} from '../resolvers'
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
      resolve: resolveJiraIssue
    }
  })
})

export default EstimateStageJira
