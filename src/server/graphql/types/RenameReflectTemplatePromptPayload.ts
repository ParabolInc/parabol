import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import ReflectTemplate from './ReflectTemplate'

const RenameReflectTemplatePromptPayload = new GraphQLObjectType({
  name: 'RenameReflectTemplatePromptPayload',
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

export default RenameReflectTemplatePromptPayload
