import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import addRecallBot from '../../mutations/helpers/addRecallBot'
import {MutationResolvers} from '../resolverTypes'

const addTranscriptionBot: MutationResolvers['addTranscriptionBot'] = async (
  _source,
  {meetingId, videoMeetingURL},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingRetrospective
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  const {teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    const error = new Error('Not on team')
    return standardError(error)
  }

  await addRecallBot(meetingId, videoMeetingURL)
  meeting.videoMeetingURL = videoMeetingURL
  if (!meetingId) {
    const error = new Error('Unable to add transcription bot')
    return standardError(error)
  }

  return {meetingId}
}

export default addTranscriptionBot
