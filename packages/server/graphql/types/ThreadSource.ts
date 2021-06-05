import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import AgendaItem from './AgendaItem'
import getThreadSourceType from './getThreadSourceType'
import RetroReflectionGroup from './RetroReflectionGroup'
import Story from './Story'

export const threadSourceFields = () => ({
  id: {
    type: GraphQLNonNull(GraphQLID),
    description: 'shortid'
  }
  // thread: {
  //   type: GraphQLNonNull(ThreadableConnection),
  //   args: {
  //     first: {
  //       type: GraphQLNonNull(GraphQLInt)
  //     },
  //     after: {
  //       type: GraphQLString,
  //       description: 'the incrementing sort order in string format'
  //     }
  //   },
  //   description: 'the comments and tasks created from the discussion',
  //   resolve: resolveThread
  // }
})

const ThreadSource = new GraphQLInterfaceType({
  name: 'ThreadSource',
  description: 'The source of a discusson thread',
  fields: threadSourceFields,
  resolveType: (type) => {
    const threadSourceType = getThreadSourceType(type)
    const lookup = {
      REFLECTION_GROUP: RetroReflectionGroup,
      AGENDA_ITEM: AgendaItem,
      STORY: Story
    } as const
    return lookup[threadSourceType]
  }
})

export default ThreadSource
