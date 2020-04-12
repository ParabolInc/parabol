import {GraphQLNonNull, GraphQLID, GraphQLList, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

const ReflectPhaseCompletePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectPhaseCompletePayload',
  fields: () => ({
    emptyReflectionGroupIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'a list of empty reflection groups to remove'
    }
  })
})

export default ReflectPhaseCompletePayload
