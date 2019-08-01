import makeRetroGroupTitle from '../../../../../client/utils/autogroup/makeRetroGroupTitle'
import getRethink from '../../../../database/rethinkDriver'
import makeReflectionGroup from './makeReflectionGroup'
import updateGroupTitle from './updateGroupTitle'
import {getUserId} from '../../../../utils/authorization'
import standardError from '../../../../utils/standardError'

const removeReflectionFromGroup = async (reflectionId, {authToken, dataLoader}) => {
  const r = getRethink()
  const now = new Date()
  const reflection = await r.table('RetroReflection').get(reflectionId)
  const viewerId = getUserId(authToken)
  if (!reflection) return standardError(new Error('Reflection not found'), {userId: viewerId})
  const {reflectionGroupId: oldReflectionGroupId, meetingId, retroPhaseItemId} = reflection
  const meeting = await dataLoader.get('newMeetings').load(meetingId)

  // RESOLUTION
  const reflectionGroup = await makeReflectionGroup(meetingId, retroPhaseItemId, 0)
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
  })
  // mutates the dataloader response
  meeting.nextAutoGroupThreshold = null
  const oldReflections = await r
    .table('RetroReflection')
    .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
    .filter({isActive: true})

  const {smartTitle: nextGroupSmartTitle, title: nextGroupTitle} = makeRetroGroupTitle([reflection])
  await updateGroupTitle(reflectionGroupId, nextGroupSmartTitle, nextGroupTitle)

  if (oldReflections.length > 0) {
    const {smartTitle: oldGroupSmartTitle, title: oldGroupTitle} = makeRetroGroupTitle(
      oldReflections
    )
    await updateGroupTitle(oldReflectionGroupId, oldGroupSmartTitle, oldGroupTitle)
  } else {
    await r
      .table('RetroReflectionGroup')
      .get(oldReflectionGroupId)
      .update({
        isActive: false,
        updatedAt: now
      })
  }
  return reflectionGroupId
}

export default removeReflectionFromGroup
