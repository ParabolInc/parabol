import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import getRotationOrder from './helpers/getRotationOrder'
import setFacilitatorRotation from './helpers/setFacilitatorRotation'

const updateFacilitatorRotation: MutationResolvers['updateFacilitatorRotation'] = async (
  _source,
  {meetingId, userIds, autoAssignFacilitator},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId, endedAt, facilitatorUserId} = meeting

  // VALIDATION
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const activeUserIds = getRotationOrder(teamMembers)
  let nextRotation: string[] | undefined
  if (userIds) {
    // reconcile against the live roster rather than erroring on a stale list: anyone who left the
    // team drops out, anyone the client did not know about keeps their turn at the back
    const requested = [...new Set(userIds)].filter((userId) => activeUserIds.includes(userId))
    nextRotation = [...requested, ...activeUserIds.filter((userId) => !requested.includes(userId))]
  }

  // RESOLUTION
  if (autoAssignFacilitator !== null && autoAssignFacilitator !== undefined) {
    await getKysely()
      .updateTable('Team')
      .set({autoAssignFacilitator})
      .where('id', '=', teamId)
      .execute()
    dataLoader.get('teams').clear(teamId)
  }
  if (nextRotation) {
    await setFacilitatorRotation(teamId, nextRotation, dataLoader)
  }

  const newFacilitatorUserId = nextRotation?.[0]
  const isHandoff = !endedAt && !!newFacilitatorUserId && newFacilitatorUserId !== facilitatorUserId
  if (isHandoff) {
    await getKysely()
      .updateTable('NewMeeting')
      .set({facilitatorUserId: newFacilitatorUserId})
      .where('id', '=', meetingId)
      .execute()
    dataLoader.clearAll('newMeetings')
  }

  const data = {teamId, meetingId: isHandoff ? meetingId : null}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateFacilitatorRotationSuccess', data, subOptions)
  if (isHandoff) {
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'UpdateFacilitatorRotationSuccess',
      data,
      subOptions
    )
  }
  return data
}

export default updateFacilitatorRotation
