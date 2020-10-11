import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {IJiraCreateIssueOnMutationArguments} from '../types/graphql'
import createProxyRecord from '../utils/relay/createProxyRecord'
import Atmosphere from '../Atmosphere'
import {LocalHandlers} from '../types/relayMutations'
import getJiraIssuesConn from './connections/getJiraIssuesConn'
import {ConnectionHandler} from 'relay-runtime'

graphql`
  fragment JiraCreateIssueMutation_task on JiraCreateIssuePayload {
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
      ...JiraCreateIssueMutation_task @relay(mask: false)
    }
  }
`

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
      const teamId = payload.getValue('teamId')
      const team = store.get(teamId)
      const key = payload.getValue('key')
      const url = payload.getValue('url')
      const summary = payload.getValue('summary')
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
    },
    onCompleted,
    onError
  })
}

export default JiraCreateIssueMutation
