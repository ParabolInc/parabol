import MeetingTemplate from '../../../database/types/MeetingTemplate'
import segmentIo from '../../../utils/segmentIo'

const sendTemplateEventToSegment = async (
  userId: string,
  template: MeetingTemplate,
  event: string
) => {
  segmentIo.track({
    userId,
    event,
    properties: {
      meetingTemplateId: template.id,
      meetingTemplateType: template.type,
      meetingTemplateName: template.name,
      meetingTemplateScope: template.scope,
      teamId: template.teamId
    }
  })
}

export default sendTemplateEventToSegment
