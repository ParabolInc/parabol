import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {IJiraCreateIssueOnMutationArguments} from '../types/graphql'
import Atmosphere from '../Atmosphere'
import {LocalHandlers, SharedUpdater} from '../types/relayMutations'
import {JiraCreateIssueMutation_meeting} from '~/__generated__/JiraCreateIssueMutation_meeting.graphql'
import handleJiraCreateIssue from './handlers/handleJiraCreateIssue'
import createProxyRecord from '~/utils/relay/createProxyRecord'

graphql`
  fragment JiraCreateIssueMutation_meeting on JiraCreateIssuePayload {
    cloudName
    key
    summary
    teamId
    url
  }
`

const mutation = graphql`
  mutation JiraCreateIssueMutation(
    $content: String!
    $cloudId: ID!
    $cloudName: String!
    $projectKey: ID!
    $teamId: ID!
    $meetingId: ID
  ) {
    jiraCreateIssue(
      content: $content
      cloudId: $cloudId
      cloudName: $cloudName
      projectKey: $projectKey
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
  return commitMutation<any>(atmosphere, {
    // TJiraCreateIssueMutation
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('jiraCreateIssue')
      if (!payload) return
      const context = {atmosphere, store}
      jiraCreateIssueUpdater(payload, context)
    },
    optimisticUpdater: (store) => {
      const {cloudName, teamId, projectKey, content} = variables
      const url = `https://${cloudName}.atlassian.net/browse/${projectKey}`
      const jiraIssueVariables = {
        cloudName,
        key: projectKey,
        summary: content,
        url,
        teamId
      }
      handleJiraCreateIssue(jiraIssueVariables, store)
    },
    onCompleted,
    onError
  })
}

export default JiraCreateIssueMutation
