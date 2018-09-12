import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem'

const RenameReflectTemplatePromptPayload = new GraphQLObjectType({
  name: 'RenameReflectTemplatePromptPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    prompt: {
      type: new GraphQLNonNull(RetroPhaseItem),
      resolve: ({promptId}, _args, {dataLoader}) => {
        return dataLoader.get('customPhaseItems').load(promptId)
      }
    }
  })
})

export default RenameReflectTemplatePromptPayload
