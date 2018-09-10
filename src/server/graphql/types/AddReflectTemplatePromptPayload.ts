import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import ReflectTemplate from './ReflectTemplate'

const AddReflectTemplatePromptPayload = new GraphQLObjectType({
  name: 'AddReflectTemplatePromptPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    prompt: {
      type: new GraphQLNonNull(ReflectTemplate),
      resolve: ({promptId}, _args, {dataLoader}) => {
        return dataLoader.get('customPhaseItems').load(promptId)
      }
    }
  })
})

export default AddReflectTemplatePromptPayload
