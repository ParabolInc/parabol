import MeetingTemplate from '../../database/types/MeetingTemplate'

export const createMeetingTemplateAnalyticsParams = (template: MeetingTemplate) => {
  return {
    meetingTemplateId: template.id,
    meetingTemplateName: template.name,
    meetingTemplateScope: template.scope,
    meetingTemplateIsFromParabol: !!template.isStarter
  }
}
