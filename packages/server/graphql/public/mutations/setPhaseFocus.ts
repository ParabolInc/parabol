import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GROUP} from 'parabol-client/utils/constants'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const setPhaseFocus: MutationResolvers['setPhaseFocus'] = async (
  _source,
  {meetingId, focusedPromptId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const viewerId = getUserId(authToken)
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  const {endedAt, phases} = meeting
  if (endedAt) return standardError(new Error('Meeting already completed'), {userId: viewerId})
  if (isPhaseComplete(GROUP, phases)) {
    return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
  }
  const reflectPhase = getPhase(meeting.phases, 'reflect')
  if (!reflectPhase) return standardError(new Error('Meeting not found'), {userId: viewerId})
  if (focusedPromptId) {
    const meetingPrompts = await dataLoader.get('templatePromptsByMeetingId').load(meetingId)
    if (!meetingPrompts.some(({id}) => id === focusedPromptId)) {
      throw new GraphQLError('Prompt is not part of the meeting', {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
  }

  // RESOLUTION
  reflectPhase.focusedPromptId = focusedPromptId ?? undefined
  await getKysely()
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases)})
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'SetPhaseFocusPayload', data, subOptions)
  return data
}

export default setPhaseFocus
