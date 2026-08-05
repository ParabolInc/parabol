import {CipherId} from '../../../utils/CipherId'
import type {RemoveTeamHealthTemplateQuestionSuccessResolvers} from '../resolverTypes'

export type RemoveTeamHealthTemplateQuestionSuccessSource = {
  templateId: string
  questionIds: number[]
}

const RemoveTeamHealthTemplateQuestionSuccess: RemoveTeamHealthTemplateQuestionSuccessResolvers = {
  template: ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  questionIds: ({questionIds}) =>
    questionIds.map((id) => CipherId.toClient(id, 'teamHealthQuestion'))
}

export default RemoveTeamHealthTemplateQuestionSuccess
