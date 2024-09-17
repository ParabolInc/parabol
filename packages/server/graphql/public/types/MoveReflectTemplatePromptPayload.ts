import {MoveReflectTemplatePromptPayloadResolvers} from '../resolverTypes'

export type MoveReflectTemplatePromptPayloadSource =
  | {
      promptId: string
    }
  | {error: {message: string}}

const MoveReflectTemplatePromptPayload: MoveReflectTemplatePromptPayloadResolvers = {
  prompt: (source, _args, {dataLoader}) => {
    return 'promptId' in source
      ? dataLoader.get('reflectPrompts').loadNonNull(source.promptId)
      : null
  }
}

export default MoveReflectTemplatePromptPayload
