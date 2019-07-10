import publish, {SubOptions} from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import getRethink from 'server/database/rethinkDriver'
import PromoteNewMeetingFacilitatorPayload from 'server/graphql/types/PromoteNewMeetingFacilitatorPayload'

const promoteFirstTeamMember = async (
  meetingId: string,
  teamId: string,
  oldFacilitatorUserId: string,
  subOptions: SubOptions
) => {
  const r = getRethink()
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
  const data = {meetingId, oldFacilitatorUserId}
  publish(TEAM, teamId, PromoteNewMeetingFacilitatorPayload, data, subOptions)
}

export default promoteFirstTeamMember
