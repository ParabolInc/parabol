import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateReflectionGroupTitle: MutationResolvers['updateReflectionGroupTitle'] = async (
  _source,
  {reflectionGroupId, title},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
  if (!reflectionGroup) {
    throw new GraphQLError('Reflection group not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {meetingId, title: oldTitle} = reflectionGroup
  if (oldTitle === title)
    throw new GraphQLError('Group already renamed', {extensions: {code: 'CONFLICT'}})
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {endedAt, phases} = meeting
  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  if (isPhaseComplete('vote', phases)) {
    throw new GraphQLError('Meeting phase already completed', {extensions: {code: 'CONFLICT'}})
  }

  // VALIDATION
  const normalizedTitle = title.trim()
  if (normalizedTitle.length < 1) {
    throw new GraphQLError('Reflection group title required', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (normalizedTitle.length > 200)
    throw new GraphQLError('Title is too long', {extensions: {code: 'BAD_USER_INPUT'}})

  const allGroups = await dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  const allTitles = allGroups.map((g) => g.title)
  if (allTitles.includes(normalizedTitle)) {
    throw new GraphQLError('Group titles must be unique', {extensions: {code: 'CONFLICT'}})
  }

  // RESOLUTION
  dataLoader.get('retroReflectionGroups').clear(reflectionGroupId)
  await pg
    .updateTable('RetroReflectionGroup')
    .set({title: normalizedTitle})
    .where('id', '=', reflectionGroupId)
    .execute()

  const data = {meetingId, reflectionGroupId}
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'UpdateReflectionGroupTitlePayload',
    data,
    subOptions
  )
  return data
}

export default updateReflectionGroupTitle
