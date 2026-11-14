import type {AnyMeeting} from '../../../../postgres/types/Meeting'

export const getTeamHealthQuestionCount = (meeting: AnyMeeting) => {
  if (meeting.meetingType !== 'teamHealth') return 0
  const responsePhase = meeting.phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')
  return responsePhase?.stages.length ?? 0
}
