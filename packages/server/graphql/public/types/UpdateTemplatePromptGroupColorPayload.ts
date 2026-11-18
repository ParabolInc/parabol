import type {UpdateTemplatePromptGroupColorPayloadResolvers} from '../resolverTypes'

export type UpdateTemplatePromptGroupColorPayloadSource = {
  promptId: string
}

const UpdateTemplatePromptGroupColorPayload: UpdateTemplatePromptGroupColorPayloadResolvers = {
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('templatePrompts').loadNonNull(promptId)
  }
}

export default UpdateTemplatePromptGroupColorPayload
