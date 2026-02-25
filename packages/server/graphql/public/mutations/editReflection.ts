import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const editReflection: MutationResolvers['editReflection'] = async (
  _source,
  {isEditing, meetingId, promptId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const viewerId = getUserId(authToken)

  // AUTH
  const reflectPrompt = await dataLoader.get('reflectPrompts').load(promptId)
  if (!reflectPrompt) {
    return standardError(new Error('Category not found'), {userId: viewerId})
  }
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  const {endedAt, phases} = meeting
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
  if (isPhaseComplete('group', phases)) {
    return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
  }

  // RESOLUTION
  const data = {promptId, editorId: mutatorId, isEditing}
  publish(SubscriptionChannel.MEETING, meetingId, 'EditReflectionPayload', data, subOptions)
  return data
}

export default editReflection
