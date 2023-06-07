import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const AutogroupReflectionGroup = new GraphQLObjectType<any, GQLContext>({
  name: 'AutogroupReflectionGroup',
  description: 'A suggested reflection group created by OpenAI',
  fields: () => ({
    groupTitle: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The smart title for the reflection group created by OpenAI'
    },
    reflectionIds: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID))),
      description: 'The ids of the reflections in the group'
    }
  })
})

export default AutogroupReflectionGroup
