import publish, {SubOptions} from '../../../utils/publish'
import getRethink from '../../../database/rethinkDriver'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const promoteFirstTeamMember = async (
  meetingId: string,
  teamId: string,
  oldFacilitatorUserId: string,
  subOptions: SubOptions
) => {
  const r = await getRethink()
  const now = new Date()
  await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      (meeting) => ({
        facilitatorUserId: r
          .table('TeamMember')
          .getAll(teamId, {index: 'teamId'})
          .filter({isNotRemoved: true})
          .eqJoin('userId', r.table('User'))
          .zip()
          .filter((row) =>
            row('connectedSockets')
              .count()
              .ge(1)
          )
          .min((row) => row('checkInOrder').default(1))('userId')
          .default(meeting('facilitatorUserId')),
        updatedAt: now
      }),
      {nonAtomic: true}
    )
    .run()
  const data = {meetingId, oldFacilitatorUserId}
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'PromoteNewMeetingFacilitatorPayload',
    data,
    subOptions
  )
}

export default promoteFirstTeamMember
