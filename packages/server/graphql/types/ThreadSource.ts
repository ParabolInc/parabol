import {GraphQLID, GraphQLNonNull, GraphQLInt, GraphQLString, GraphQLInterfaceType} from 'graphql'
import {ThreadableConnection} from './Threadable'
import resolveThread from '../resolvers/resolveThread'
import {ThreadSourceEnum} from 'parabol-client/types/graphql'
import RetroReflectionGroup from './RetroReflectionGroup'
import AgendaItem from './AgendaItem'
import Story from './Story'
import getThreadSourceType from './getThreadSourceType'
import JiraIssue from './JiraIssue'
import Task from './Task'

export const threadSourceFields = () => ({
  id: {
    type: GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  thread: {
    type: GraphQLNonNull(ThreadableConnection),
    args: {
      first: {
        type: GraphQLNonNull(GraphQLInt)
      },
      after: {
        type: GraphQLString,
        description: 'the incrementing sort order in string format'
      }
    },
    description: 'the comments and tasks created from the discussion',
    resolve: resolveThread
  }
})

const ThreadSource = new GraphQLInterfaceType({
  name: 'ThreadSource',
  description: 'The source of a discusson thread',
  fields: threadSourceFields,
  resolveType: (type) => {
    console.log('TS -=-=-=- type', type)
    const threadSourceType = getThreadSourceType(type)
    const lookup = {
      [ThreadSourceEnum.REFLECTION_GROUP]: RetroReflectionGroup,
      [ThreadSourceEnum.AGENDA_ITEM]: AgendaItem,
      [ThreadSourceEnum.STORY]: Story
      // [ThreadSourceEnum.TASK]: Task,
      // [ThreadSourceEnum.JIRA_ISSUE]: JiraIssue
    }
    return lookup[threadSourceType]
  }
})

export default ThreadSource
