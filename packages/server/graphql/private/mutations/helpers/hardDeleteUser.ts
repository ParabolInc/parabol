import {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import getKysely from '../../../../postgres/getKysely'
import {analytics} from '../../../../utils/analytics/analytics'
import blacklistJWT from '../../../../utils/blacklistJWT'
import {toEpochSeconds} from '../../../../utils/epochTime'
import {DataLoaderWorker} from '../../../graphql'
import softDeleteUser from '../../../mutations/helpers/softDeleteUser'

const setFacilitatedUserIdOrDelete = async (
  userIdToDelete: string,
  teamIds: string[],
  dataLoader: DataLoaderInstance
) => {
  const pg = getKysely()
  const facilitatedMeetings = await pg
    .selectFrom('NewMeeting')
    .select('id')
    .where('teamId', 'in', teamIds)
    .where('createdBy', '=', userIdToDelete)
    .execute()

  await Promise.all(
    facilitatedMeetings.map(async (meeting) => {
      const {id: meetingId} = meeting
      const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
      const otherMember = meetingMembers.find(({userId}) => userId !== userIdToDelete)
      if (otherMember) {
        await pg
          .updateTable('NewMeeting')
          .set({facilitatorUserId: otherMember.userId})
          .where('id', '=', meetingId)
          .execute()
      } else {
        // single-person meeting must be deleted because facilitatorUserId must be non-null
        await pg.deleteFrom('NewMeeting').where('id', '=', meetingId).execute()
      }
    })
  )
}

export const hardDeleteUser = async (
  userToDelete: {id: string; email: string},
  reasonText: string,
  dataLoader: DataLoaderWorker
) => {
  const {id: userIdToDelete} = userToDelete
  // get team ids and meetingIds
  const teamMembers = await dataLoader.get('teamMembersByUserId').load(userIdToDelete)
  const teamIds = teamMembers.map(({teamId}) => teamId)

  // soft delete first for side effects
  await softDeleteUser(userIdToDelete, dataLoader)

  const pg = getKysely()
  // all other writes
  if (teamIds.length > 0) {
    await setFacilitatedUserIdOrDelete(userIdToDelete, teamIds, dataLoader)
    await pg
      .updateTable('NewMeeting')
      .set({createdBy: null})
      .where('teamId', 'in', teamIds)
      .where('createdBy', '=', userIdToDelete)
      .execute()
  }

  analytics.accountRemoved(userToDelete, reasonText)

  // User needs to be deleted after children
  await pg.deleteFrom('User').where('id', '=', userIdToDelete).execute()

  await blacklistJWT(userIdToDelete, toEpochSeconds(new Date()))
  return {}
}
