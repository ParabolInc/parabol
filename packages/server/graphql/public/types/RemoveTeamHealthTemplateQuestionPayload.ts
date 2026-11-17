import {CipherId} from '../../../utils/CipherId'
import type {RemoveTeamHealthTemplateQuestionPayloadResolvers} from '../resolverTypes'

export type RemoveTeamHealthTemplateQuestionPayloadSource = {
  templateId: string
  questionIds: number[]
}

const RemoveTeamHealthTemplateQuestionPayload: RemoveTeamHealthTemplateQuestionPayloadResolvers = {
  template: ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  questionIds: ({questionIds}) =>
    questionIds.map((id) => CipherId.toClient(id, 'teamHealthQuestion'))
}

export default RemoveTeamHealthTemplateQuestionPayload
