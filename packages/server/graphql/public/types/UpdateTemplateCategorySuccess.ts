import {UpdateTemplateCategorySuccessResolvers} from '../resolverTypes'

export type UpdateTemplateCategorySuccessSource = {
  templateId: string
}

const UpdateTemplateCategorySuccess: UpdateTemplateCategorySuccessResolvers = {
  template: async ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  }
}

export default UpdateTemplateCategorySuccess
