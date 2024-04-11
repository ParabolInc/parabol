import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import RetroReflection from './RetroReflection'
import makeMutationPayload from './makeMutationPayload'

export const AddReactjiToReflectionSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddReactjiToReflectionSuccess',
  fields: () => ({
    reflection: {
      type: new GraphQLNonNull(RetroReflection),
      description: 'the reflection with the updated list of reactjis',
      resolve: async ({reflectionId}, _args: unknown, {dataLoader}) => {
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
