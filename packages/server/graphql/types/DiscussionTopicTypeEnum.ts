import {GraphQLEnumType} from 'graphql'

const DiscussionTopicTypeEnum = new GraphQLEnumType({
  name: 'DiscussionTopicTypeEnum',
  description: 'The topic being discussed',
  values: {
    agendaItem: {},
    reflectionGroup: {},
    task: {},
    githubIssue: {},
    jiraIssue: {}
  }
})

export default DiscussionTopicTypeEnum
