import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {IJiraCreateIssueOnMutationArguments} from '../types/graphql'
import createProxyRecord from '../utils/relay/createProxyRecord'
import Atmosphere from '../Atmosphere'
import {LocalHandlers, SharedUpdater} from '../types/relayMutations'
import getJiraIssuesConn from './connections/getJiraIssuesConn'
import {ConnectionHandler} from 'relay-runtime'
import {JiraCreateIssueMutation_meeting} from '~/__generated__/JiraCreateIssueMutation_meeting.graphql'

graphql`
  fragment JiraCreateIssueMutation_meeting on JiraCreateIssuePayload {
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
    $projectKey: ID!
    $teamId: ID!
    $meetingId: ID
  ) {
    jiraCreateIssue(
      content: $content
      cloudId: $cloudId
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

const handleJiraCreateIssue = (teamId, key, url, summary, store) => {
  const team = store.get(teamId)
  const jiraIssuesConn = getJiraIssuesConn(team)
  const newJiraIssue = {
    key,
    summary,
    url
  }
  console.log('my Test obj -->', newJiraIssue)
  const jiraIssueProxy = createProxyRecord(store, 'JiraIssue', newJiraIssue)
  console.log('jiraIssueProxy', jiraIssueProxy)
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
  const teamId = payload.getValue('teamId')
  const key = payload.getValue('key')
  const url = payload.getValue('url')
  const summary = payload.getValue('summary')
  handleJiraCreateIssue(teamId, key, url, summary, store)
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
      const {teamId, projectKey, content} = variables
      handleJiraCreateIssue(teamId, projectKey, 'test.com', content, store)
    },
    onCompleted,
    onError
  })
}

export default JiraCreateIssueMutation
