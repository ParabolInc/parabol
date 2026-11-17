import type {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import type {UpdateTemplateScopePayloadResolvers} from '../resolverTypes'

export type UpdateTemplateScopePayloadSource = {
  templateId: string
  teamId: string
  clonedTemplateId?: string
  meetingType: MeetingTypeEnum
}

const UpdateTemplateScopePayload: UpdateTemplateScopePayloadResolvers = {
  template: ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  clonedTemplate: async ({clonedTemplateId}, _args, {dataLoader}) => {
    if (!clonedTemplateId) return null
    return (await dataLoader.get('meetingTemplates').load(clonedTemplateId)) ?? null
  },
  settings: async ({teamId, meetingType}, _args, {dataLoader}) => {
    return (
      (await dataLoader.get('meetingSettingsByType').loadNonNull({teamId, meetingType})) ?? null
    )
  }
}

export default UpdateTemplateScopePayload
