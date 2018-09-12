import {GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import ReflectTemplate from './ReflectTemplate'

const MoveReflectTemplatePromptPayload = new GraphQLObjectType({
  name: 'MoveReflectTemplatePromptPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    prompt: {
      type: ReflectTemplate,
      resolve: ({promptId}, _args, {dataLoader}) => {
        if (!promptId) return null
        return dataLoader.get('customPhaseItems').load(promptId)
      }
    }
  })
})

export default MoveReflectTemplatePromptPayload
