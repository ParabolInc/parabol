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

graphql`
  fragment JiraCreateIssueMutation_meeting on JiraCreateIssuePayload {
    cloudId
    cloudName
    key
    meetingId
    summary
    teamId
    url
  }
`

const mutation = graphql`
  mutation JiraCreateIssueMutation(
    $cloudId: ID!
    $cloudName: String!
    $projectKey: ID!
    $summary: String!
    $teamId: ID!
    $meetingId: ID
  ) {
    jiraCreateIssue(
      cloudId: $cloudId
      cloudName: $cloudName
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
  const cloudName = payload.getValue('cloudName')
  const key = payload.getValue('key')
  const summary = payload.getValue('summary')
  const teamId = payload.getValue('teamId')
  const url = payload.getValue('url')
  const jiraIssueVariables = {
    cloudName,
    key,
    summary,
    teamId,
    url
  }
  handleJiraCreateIssue(jiraIssueVariables, store)
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
      const {cloudName, teamId, projectKey, summary} = variables
      const url = `https://${cloudName}.atlassian.net/browse/${projectKey}`
      const team = store.get(teamId)
      const jiraIssues = team?.getLinkedRecord('jiraIssues', {
        first: 100,
        isJQL: false
      })
      const edges = jiraIssues?.getLinkedRecords('edges')

      let largestKeyCount = 1
      edges?.forEach((edge) => {
        const jiraIssue = edge.getLinkedRecord('node')
        const key = jiraIssue?.getValue('key') as string
        const keyCountStr = key.split('-')[1]
        const keyCount = parseInt(keyCountStr)
        if (keyCount > largestKeyCount) {
          largestKeyCount = keyCount
        }
      })
      const jiraIssueVariables = {
        cloudName,
        key: `TES-${largestKeyCount + 1}`,
        summary,
        url,
        teamId
      }
      handleJiraCreateIssue(jiraIssueVariables, store)
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
