import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GROUP} from 'parabol-client/utils/constants'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import getKysely from '../../../postgres/getKysely'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const setPhaseFocus: MutationResolvers['setPhaseFocus'] = async (
  _source,
  {meetingId, focusedPromptId},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  const {endedAt, phases} = meeting
  if (endedAt) throw new GraphQLError('Meeting already completed', {extensions: {code: 'CONFLICT'}})
  if (isPhaseComplete(GROUP, phases)) {
    throw new GraphQLError('Meeting phase already completed', {extensions: {code: 'CONFLICT'}})
  }
  const reflectPhase = getPhase(meeting.phases, 'reflect')
  if (!reflectPhase) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
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
