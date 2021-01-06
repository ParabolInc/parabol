import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import Meeting from '../../../database/types/Meeting'
import segmentIo from '../../../utils/segmentIo'

const sendMeetingJoinToSegment = async (userId: string, newMeeting: Meeting) => {
  const {facilitatorUserId, meetingNumber, meetingType, phases, teamId, id: meetingId} = newMeeting
  segmentIo.track({
    userId,
    event: 'Meeting Joined',
    properties: {
      facilitatorUserId,
      hasIcebreaker: phases[0].phaseType === NewMeetingPhaseTypeEnum.checkin,
      meetingId,
      meetingType,
      meetingNumber,
      teamId
    }
  })
}

export default sendMeetingJoinToSegment
