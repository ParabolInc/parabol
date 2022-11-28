import {GraphQLEnumType} from 'graphql'

export type DiscussionTopicEnum = 'agendaItem' | 'reflectionGroup' | 'task' | 'teamPromptResponse'

const DiscussionTopicTypeEnum = new GraphQLEnumType({
  name: 'DiscussionTopicTypeEnum',
  description: 'The topic being discussed',
  values: {
    agendaItem: {},
    reflectionGroup: {},
    task: {},
    teamPromptResponse: {},
    // deprecated
    githubIssue: {},
    // deprecated
    jiraIssue: {}
  }
})

export default DiscussionTopicTypeEnum
