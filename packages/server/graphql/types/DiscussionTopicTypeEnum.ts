import {GraphQLEnumType} from 'graphql'

const DiscussionTopicTypeEnum = new GraphQLEnumType({
  name: 'DiscussionTopicTypeEnum',
  description: 'The topic being discussed',
  values: {
    agendaItem: {},
    reflectionGroup: {},
    task: {},
    // deprecated
    githubIssue: {},
    // deprecated
    jiraIssue: {}
  }
})

export default DiscussionTopicTypeEnum
