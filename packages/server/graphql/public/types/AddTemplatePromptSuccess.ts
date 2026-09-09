import type {AddTemplatePromptSuccessResolvers} from '../resolverTypes'

export type AddTemplatePromptSuccessSource = {
  promptId: string
}

const AddTemplatePromptSuccess: AddTemplatePromptSuccessResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('reflectPrompts').loadNonNull(promptId)
  }
}

export default AddTemplatePromptSuccess
