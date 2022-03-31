import MeetingPoker from '../database/types/MeetingPoker'
import MeetingRetrospective from '../database/types/MeetingRetrospective'
import MeetingAction from '../database/types/MeetingAction'
import GenericMeetingStage from '../database/types/GenericMeetingStage'
import EstimateStage from '../database/types/EstimateStage'
import {AnyMeeting} from '../postgres/types/Meeting'

export const isRetroMeeting = (meeting: AnyMeeting): meeting is MeetingRetrospective =>
  meeting.meetingType === 'retrospective'

export const isPokerMeeting = (meeting: AnyMeeting): meeting is MeetingPoker =>
  meeting.meetingType === 'poker'

export const isActionMeeting = (meeting: AnyMeeting): meeting is MeetingAction =>
  meeting.meetingType === 'action'

export const isEstimateStage = (stage: GenericMeetingStage): stage is EstimateStage =>
  stage.phaseType === 'ESTIMATE'
