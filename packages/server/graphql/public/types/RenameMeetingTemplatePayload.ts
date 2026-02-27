import type {RenameMeetingTemplatePayloadResolvers} from '../resolverTypes'

export type RenameMeetingTemplatePayloadSource = {templateId: string} | {error: {message: string}}

const RenameMeetingTemplatePayload: RenameMeetingTemplatePayloadResolvers = {
  meetingTemplate: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('meetingTemplates').loadNonNull(source.templateId)
  }
}

export default RenameMeetingTemplatePayload
