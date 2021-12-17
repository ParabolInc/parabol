import MeetingPoker from '../database/types/MeetingPoker'
import MeetingRetrospective from '../database/types/MeetingRetrospective'
import MeetingAction from '../database/types/MeetingAction'
import GenericMeetingStage from '../database/types/GenericMeetingStage'
import EstimateStage from '../database/types/EstimateStage'

export const isRetroMeeting = (
  meeting: MeetingPoker | MeetingRetrospective | MeetingAction
): meeting is MeetingRetrospective => meeting.meetingType === 'retrospective'

export const isPokerMeeting = (
  meeting: MeetingPoker | MeetingRetrospective | MeetingAction
): meeting is MeetingPoker => meeting.meetingType === 'poker'

export const isActionMeeting = (
  meeting: MeetingPoker | MeetingRetrospective | MeetingAction
): meeting is MeetingAction => meeting.meetingType === 'action'

export const isEstimateStage = (stage: GenericMeetingStage): stage is EstimateStage =>
  stage.phaseType === 'ESTIMATE'
