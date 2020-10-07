import {GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'
import JiraIssue from './JiraIssue'

const JiraCreateIssuePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraCreateIssuePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    jiraIssue: {
      type: JiraIssue,
      description: 'The Jira issue that has been created'
    }
  })
})

export default JiraCreateIssuePayload
