import type {UpdateTemplateCategoryPayloadResolvers} from '../resolverTypes'

export type UpdateTemplateCategoryPayloadSource = {
  templateId: string
}

const UpdateTemplateCategoryPayload: UpdateTemplateCategoryPayloadResolvers = {
  template: async ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  }
}

export default UpdateTemplateCategoryPayload
