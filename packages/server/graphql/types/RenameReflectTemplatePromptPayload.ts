import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import RetroPhaseItem from './RetroPhaseItem'

const RenameReflectTemplatePromptPayload = new GraphQLObjectType({
  name: 'RenameReflectTemplatePromptPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    prompt: {
      type: RetroPhaseItem,
      resolve: ({promptId}, _args, {dataLoader}) => {
        if (!promptId) return null
        return dataLoader.get('customPhaseItems').load(promptId)
      }
    }
  })
})

export default RenameReflectTemplatePromptPayload
