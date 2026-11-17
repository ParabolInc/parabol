import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const addTranscriptionBot: MutationResolvers['addTranscriptionBot'] = async (
  _source,
  {meetingId, videoMeetingURL},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (meeting.meetingType !== 'retrospective') {
    throw new GraphQLError('Meeting type is not retrospective', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  meeting.videoMeetingURL = videoMeetingURL

  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'AddTranscriptionBotSuccess', data, subOptions)

  return {meetingId}
}

export default addTranscriptionBot
