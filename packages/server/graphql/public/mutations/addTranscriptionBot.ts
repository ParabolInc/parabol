import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import addRecallBot from '../../mutations/helpers/addRecallBot'
import {MutationResolvers} from '../resolverTypes'

const addTranscriptionBot: MutationResolvers['addTranscriptionBot'] = async (
  _source,
  {meetingId, videoMeetingURL},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  if (meeting.meetingType !== 'retrospective') {
    return {error: {message: 'Meeting type is not retrospective'}}
  }
  const {teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    const error = new Error('Not on team')
    return standardError(error)
  }

  await addRecallBot(meetingId, videoMeetingURL)
  meeting.videoMeetingURL = videoMeetingURL

  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'AddTranscriptionBotSuccess', data, subOptions)

  return {meetingId}
}

export default addTranscriptionBot
