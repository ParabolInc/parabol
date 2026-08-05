import type {AddTeamHealthTemplateQuestionSuccessResolvers} from '../resolverTypes'

export type AddTeamHealthTemplateQuestionSuccessSource = {
  templateId: string
}

const AddTeamHealthTemplateQuestionSuccess: AddTeamHealthTemplateQuestionSuccessResolvers = {
  template: ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  }
}

export default AddTeamHealthTemplateQuestionSuccess
