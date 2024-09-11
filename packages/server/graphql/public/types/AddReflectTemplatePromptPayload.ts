import {AddReflectTemplatePromptPayloadResolvers} from '../resolverTypes'

export type AddReflectTemplatePromptPayloadSource =
  | {
      promptId: string
    }
  | {error: {message: string}}

const AddReflectTemplatePromptPayload: AddReflectTemplatePromptPayloadResolvers = {
  prompt: (source, _args, {dataLoader}) => {
    return 'promptId' in source ? dataLoader.get('reflectPrompts').load(source.promptId) : null
  }
}

export default AddReflectTemplatePromptPayload
