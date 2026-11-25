import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const editReflection: MutationResolvers['editReflection'] = async (
  _source,
  {isEditing, meetingId, promptId},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const [meetingPrompts, meeting] = await Promise.all([
    dataLoader.get('templatePromptsByMeetingId').load(meetingId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  if (!meetingPrompts.some(({id}) => id === promptId)) {
    throw new GraphQLError('Prompt is not part of this meeting', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const {endedAt, phases} = meeting
  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  if (isPhaseComplete('group', phases)) {
    throw new GraphQLError('Meeting phase already completed', {extensions: {code: 'CONFLICT'}})
  }

  // RESOLUTION
  const data = {promptId, editorId: mutatorId, isEditing}
  publish(SubscriptionChannel.MEETING, meetingId, 'EditReflectionPayload', data, subOptions)
  return data
}

export default editReflection
