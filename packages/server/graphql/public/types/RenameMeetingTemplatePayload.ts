import type {RenameMeetingTemplatePayloadResolvers} from '../resolverTypes'

export type RenameMeetingTemplatePayloadSource = {templateId: string}

const RenameMeetingTemplatePayload: RenameMeetingTemplatePayloadResolvers = {
  meetingTemplate: (source, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(source.templateId)
  }
}

export default RenameMeetingTemplatePayload
