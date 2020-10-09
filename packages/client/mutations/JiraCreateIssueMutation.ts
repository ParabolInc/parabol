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
    id
    summary
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
      // const testId = payload.getValue('testId')
      // console.log('testId', testId)
      // const viewer = store.getRoot().getLinkedRecord('viewer')
      // console.log('viewer', viewer)
      const teamId = 'yffSRFTZ_j'
      // console.log('team', team)
      const team = store.get(teamId)
      // console.log('payload', payload)
      // const jiraIssueDescription = payload.getValue('jiraIssueDescription')
      // console.log('jiraIssueDescription', jiraIssueDescription)
      // const id = payload.getValue('id')
      // console.log('id ', id)
      const jiraIssueId = payload.getDataID()
      // console.log('id -->', jiraIssueId)
      const key = jiraIssueId.split(':')[1]
      // console.log('key', key)
      console.log(' key', key)
      const url = payload.getValue('url')
      console.log('url', url)
      // const key = payload.getValue('key')
      const summary = payload.getValue('summary')
      console.log('summary', summary)
      const jiraIssuesConn = getJiraIssuesConn(team as any)
      console.log('jiraIssuesConn', jiraIssuesConn)
      const test = {
        id: jiraIssueId,
        key,
        summary,
        url
      }
      console.log('my Test obj -->', test)
      // const test = {
      //   id: testId,
      //   url: 'dksjds.com',
      //   key: '12309',
      //   summary: jiraIssueDescription
      // }
      const jiraIssueTest = createProxyRecord(store, 'JiraIssue', test)
      console.log('jiraIssueTest', jiraIssueTest)
      // console.log('jiraIssueTest --->', jiraIssueTest)
      // // console.log('jiraIssueTest', jiraIssueTest)
      const now = new Date().toISOString()
      // jiraIssueTest.setValue(now, 'cursor')
      // safePutNodeInConn(jiraIssuesConn, jiraIssueTest, store)
      if (!jiraIssuesConn) return
      const newEdge = ConnectionHandler.createEdge(
        store,
        jiraIssuesConn,
        jiraIssueTest,
        'TimelineEventEdge'
      )
      newEdge.setValue(now, 'cursor')
      console.log('newEdge', newEdge)
      ConnectionHandler.insertEdgeBefore(jiraIssuesConn, newEdge)

      // const viewer = store.getRoot().getLinkedRecord<IUser>('viewer')
      // const payload = store.getRootField('jiraCreateIssue')
      // const teamId = payload.getValue('teamId')
      // console.log("teamId", teamId)
    },
    onCompleted,
    onError
  })
}

export default JiraCreateIssueMutation
