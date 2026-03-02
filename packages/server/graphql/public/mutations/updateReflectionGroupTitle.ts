import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import stringScore from 'string-score'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const updateReflectionGroupTitle: MutationResolvers['updateReflectionGroupTitle'] = async (
  _source,
  {reflectionGroupId, title},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const viewerId = getUserId(authToken)
  const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
  if (!reflectionGroup) {
    return standardError(new Error('Reflection group not found'), {userId: viewerId})
  }
  const {meetingId, smartTitle, title: oldTitle} = reflectionGroup
  if (oldTitle === title) return {error: {message: 'Group already renamed'}}
  const [meeting, viewer] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  const {endedAt, phases, teamId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
  if (isPhaseComplete('vote', phases)) {
    return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
  }

  // VALIDATION
  const normalizedTitle = title.trim()
  if (normalizedTitle.length < 1) {
    return standardError(new Error('Reflection group title required'), {userId: viewerId})
  }
  if (normalizedTitle.length > 200) return {error: {message: 'Title is too long'}}

  const allGroups = await dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  const allTitles = allGroups.map((g) => g.title)
  if (allTitles.includes(normalizedTitle)) {
    return standardError(new Error('Group titles must be unique'), {userId: viewerId})
  }

  // RESOLUTION
  dataLoader.get('retroReflectionGroups').clear(reflectionGroupId)
  await pg
    .updateTable('RetroReflectionGroup')
    .set({title: normalizedTitle})
    .where('id', '=', reflectionGroupId)
    .execute()

  if (smartTitle && smartTitle === oldTitle) {
    const similarity = stringScore(smartTitle, normalizedTitle)
    analytics.smartGroupTitleChanged(viewer, similarity, smartTitle, normalizedTitle)
  }

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
