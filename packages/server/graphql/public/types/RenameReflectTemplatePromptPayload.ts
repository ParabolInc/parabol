import {RenameReflectTemplatePromptPayloadResolvers} from '../resolverTypes'

export type RenameReflectTemplatePromptPayloadSource =
  | {
      promptId: string
    }
  | {error: {message: string}}

const RenameReflectTemplatePromptPayload: RenameReflectTemplatePromptPayloadResolvers = {
  prompt: (source, _args, {dataLoader}) => {
    return 'promptId' in source
      ? dataLoader.get('reflectPrompts').loadNonNull(source.promptId)
      : null
  }
}

export default RenameReflectTemplatePromptPayload
