import type {AddTeamHealthTemplateQuestionPayloadResolvers} from '../resolverTypes'

export type AddTeamHealthTemplateQuestionPayloadSource = {
  templateId: string
}

const AddTeamHealthTemplateQuestionPayload: AddTeamHealthTemplateQuestionPayloadResolvers = {
  template: ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  }
}

export default AddTeamHealthTemplateQuestionPayload
