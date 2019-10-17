import getGroupSmartTitle from 'parabol-client/utils/autogroup/getGroupSmartTitle'
import getRethink from '../../../../database/rethinkDriver'
import updateSmartGroupTitle from './updateSmartGroupTitle'
import {getUserId} from '../../../../utils/authorization'
import standardError from '../../../../utils/standardError'
import ReflectionGroup from '../../../../database/types/ReflectionGroup'

const removeReflectionFromGroup = async (reflectionId, {authToken, dataLoader}) => {
  const r = await getRethink()
  const now = new Date()
  const reflection = await r
    .table('RetroReflection')
    .get(reflectionId)
    .run()
  const viewerId = getUserId(authToken)
  if (!reflection) return standardError(new Error('Reflection not found'), {userId: viewerId})
  const {reflectionGroupId: oldReflectionGroupId, meetingId, retroPhaseItemId} = reflection
  const meeting = await dataLoader.get('newMeetings').load(meetingId)

  // RESOLUTION
  const reflectionGroup = new ReflectionGroup({meetingId, retroPhaseItemId})
  await r
    .table('RetroReflectionGroup')
    .insert(reflectionGroup)
    .run()
  const {id: reflectionGroupId} = reflectionGroup
  await r({
    reflection: r
      .table('RetroReflection')
      .get(reflectionId)
      .update({
        sortOrder: 0,
        reflectionGroupId,
        updatedAt: now
      }),
    meeting: r
      .table('NewMeeting')
      .get(meetingId)
      .update({nextAutoGroupThreshold: null})
  }).run()
  // mutates the dataloader response
  meeting.nextAutoGroupThreshold = null
  const oldReflections = await r
    .table('RetroReflection')
    .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
    .filter({isActive: true})
    .run()

  const nextTitle = getGroupSmartTitle([reflection])
  await updateSmartGroupTitle(reflectionGroupId, nextTitle)

  if (oldReflections.length > 0) {
    const oldTitle = getGroupSmartTitle(oldReflections)
    await updateSmartGroupTitle(oldReflectionGroupId, oldTitle)
  } else {
    await r
      .table('RetroReflectionGroup')
      .get(oldReflectionGroupId)
      .update({
        isActive: false,
        updatedAt: now
      })
      .run()
  }
  return reflectionGroupId
}

export default removeReflectionFromGroup
