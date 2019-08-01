import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import RetroPhaseItem from './RetroPhaseItem'

const AddReflectTemplatePromptPayload = new GraphQLObjectType({
  name: 'AddReflectTemplatePromptPayload',
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

export default AddReflectTemplatePromptPayload
