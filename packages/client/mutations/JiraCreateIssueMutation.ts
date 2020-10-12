import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {
  AddOrDeleteEnum,
  IJiraCreateIssueOnMutationArguments,
  TaskServiceEnum
} from '../types/graphql'
import createProxyRecord from '../utils/relay/createProxyRecord'
import Atmosphere from '../Atmosphere'
import {LocalHandlers, SharedUpdater} from '../types/relayMutations'
import getJiraIssuesConn from './connections/getJiraIssuesConn'
import {ConnectionHandler} from 'relay-runtime'
import {JiraCreateIssueMutation_meeting} from '~/__generated__/JiraCreateIssueMutation_meeting.graphql'
import UpdatePokerScopeMutation from './UpdatePokerScopeMutation'
import AtlassianManager from '~/utils/AtlassianManager'

graphql`
  fragment JiraCreateIssueMutation_meeting on JiraCreateIssuePayload {
    id
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

interface HandleJiraCreateVariables {
  jiraIssueId: string
  summary: string
  teamId: string
  url: string
}

const getJiraIssueId = (cloudId: string, projectKey: string) => {
  return `${cloudId}:${projectKey}`
}

const handleJiraCreateIssue = (
  {jiraIssueId, teamId, summary, url}: HandleJiraCreateVariables,
  store
) => {
  const team = store.get(teamId)
  if (!team) return
  const jiraIssuesConn = getJiraIssuesConn(team)
  const key = jiraIssueId.split(':')[1] || ''
  const newJiraIssue = {
    id: jiraIssueId,
    key,
    summary,
    url
  }
  const jiraIssueProxy = createProxyRecord(store, 'JiraIssue', newJiraIssue)
  const now = new Date().toISOString()
  if (!jiraIssuesConn) return
  const newEdge = ConnectionHandler.createEdge(
    store,
    jiraIssuesConn,
    jiraIssueProxy,
    'JiraIssueEdge'
  )
  newEdge.setValue(now, 'cursor')
  ConnectionHandler.insertEdgeBefore(jiraIssuesConn, newEdge)
}

export const jiraCreateIssueUpdater: SharedUpdater<JiraCreateIssueMutation_meeting> = (
  payload,
  {store}
) => {
  const jiraIssueId = payload.getValue('id') as string
  const summary = payload.getValue('summary')
  const teamId = payload.getValue('teamId')
  const url = payload.getValue('url')
  const jiraIssueVariables = {
    jiraIssueId,
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
      const {cloudId, cloudName, teamId, projectKey, content} = variables
      const url = `https://${cloudName}.atlassian.net/browse/${projectKey}`
      const jiraIssueId = getJiraIssueId(cloudId, projectKey)
      const jiraIssueVariables = {
        jiraIssueId,
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
