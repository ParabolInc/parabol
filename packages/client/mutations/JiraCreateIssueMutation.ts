import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {
  AddOrDeleteEnum,
  IJiraCreateIssueOnMutationArguments,
  TaskServiceEnum
} from '../types/graphql'
import Atmosphere from '../Atmosphere'
import {LocalHandlers, SharedUpdater} from '../types/relayMutations'
import {JiraCreateIssueMutation_meeting} from '~/__generated__/JiraCreateIssueMutation_meeting.graphql'
import handleJiraCreateIssue from './handlers/handleJiraCreateIssue'
import {JiraCreateIssueMutation as TJiraCreateIssueMutation} from '~/__generated__/JiraCreateIssueMutation.graphql'
import UpdatePokerScopeMutation from './UpdatePokerScopeMutation'
import createProxyRecord from '~/utils/relay/createProxyRecord'

graphql`
  fragment JiraCreateIssueMutation_meeting on JiraCreateIssuePayload {
    issue {
      cloudId
      key
      summary
      url
    }
    meetingId
    teamId
  }
`

const mutation = graphql`
  mutation JiraCreateIssueMutation(
    $cloudId: ID!
    $projectKey: ID!
    $summary: String!
    $teamId: ID!
    $meetingId: ID
  ) {
    jiraCreateIssue(
      cloudId: $cloudId
      projectKey: $projectKey
      summary: $summary
      teamId: $teamId
      meetingId: $meetingId
    ) {
      error {
        message
      }
      ...JiraCreateIssueMutation_meeting @relay(mask: false)
    }
  }
`
export const jiraCreateIssueUpdater: SharedUpdater<JiraCreateIssueMutation_meeting> = (
  payload,
  {store}
) => {
  handleJiraCreateIssue(payload, store)
}

const JiraCreateIssueMutation = (
  atmosphere: Atmosphere,
  variables: IJiraCreateIssueOnMutationArguments,
  {onCompleted, onError}: LocalHandlers
) => {
  return commitMutation<TJiraCreateIssueMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('jiraCreateIssue')
      if (!payload) return
      const context = {atmosphere, store}
      jiraCreateIssueUpdater(payload, context)
    },
    optimisticUpdater: (store) => {
      const {teamId, projectKey, summary} = variables
      const optimisticJiraIssue = createProxyRecord(store, 'JiraIssue', {
        key: `${projectKey}-?`,
        summary,
        url: ''
      })
      const payload = createProxyRecord(store, 'payload', {})
      payload.setLinkedRecord(optimisticJiraIssue, 'issue')
      payload.setValue(teamId, 'teamId')
      handleJiraCreateIssue(payload, store)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const payload = res.jiraCreateIssue as any
      if (payload && onCompleted && onError) {
        const {cloudId, key, meetingId} = payload
        const pokerScopeVariables = {
          meetingId,
          updates: [
            {
              service: TaskServiceEnum.jira,
              serviceTaskId: `${cloudId}:${key}`,
              action: AddOrDeleteEnum.ADD
            }
          ]
        }
        UpdatePokerScopeMutation(atmosphere, pokerScopeVariables, {onError, onCompleted})
      }
    },
    onError
  })
}

export default JiraCreateIssueMutation
