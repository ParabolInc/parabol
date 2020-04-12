import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import RetroReflection from './RetroReflection'

export const AddReactjiToReflectionSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddReactjiToReflectionSuccess',
  fields: () => ({
    reflection: {
      type: GraphQLNonNull(RetroReflection),
      description: 'the reflection with the updated list of reactjis',
      resolve: async ({reflectionId}, _args, {dataLoader}) => {
        return dataLoader.get('retroReflections').load(reflectionId)
      }
    }
  })
})

const AddReactjiToReflectionPayload = makeMutationPayload(
  'AddReactjiToReflectionPayload',
  AddReactjiToReflectionSuccess
)

export default AddReactjiToReflectionPayload
