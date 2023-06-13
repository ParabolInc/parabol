import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import RetroReflectionGroup from './RetroReflectionGroup'

const GroupPhaseInitializedPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'GroupPhaseInitializedPayload',
  fields: () => ({
    emptyReflectionGroupIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'a list of empty reflection groups to remove'
    },
    reflectionGroups: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroReflectionGroup))),
      description: 'The grouped reflections'
    }
  })
})

export default GroupPhaseInitializedPayload
