import type {AddTemplatePromptPayloadResolvers} from '../resolverTypes'

export type AddTemplatePromptPayloadSource = {
  promptId: string
}

const AddTemplatePromptPayload: AddTemplatePromptPayloadResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('templatePrompts').loadNonNull(promptId)
  }
}

export default AddTemplatePromptPayload
