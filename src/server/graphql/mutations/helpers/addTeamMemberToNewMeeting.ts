import createMeetingMembers from 'server/graphql/mutations/helpers/createMeetingMembers'
import {CHECKIN, UPDATES} from 'universal/utils/constants'
import getRethink from 'server/database/rethinkDriver'
import CheckInStage from 'server/database/types/CheckInStage'
import UpdatesStage from 'server/database/types/UpdatesStage'
import CheckInPhase from 'server/database/types/CheckInPhase'
import UpdatesPhase from 'server/database/types/UpdatesPhase'

/*
 * NewMeetings have a predefined set of stages, we need to add the new team member manually
 */

const setInPhase = (phase: CheckInPhase | UpdatesPhase, newStage: CheckInStage | UpdatesStage) => {
  const firstStage = phase.stages[0]
  newStage.isNavigable = firstStage.isNavigable
  newStage.isNavigableByFacilitator = firstStage.isNavigableByFacilitator
  phase.stages.push(newStage)
}

const addTeamMemberToNewMeeting = async (teamMember, teamId, dataLoader) => {
  const now = new Date()
  const r = getRethink()
  const team = await dataLoader.get('teams').load(teamId)
  const {meetingId} = team
  if (!meetingId) return false
  // make sure it's a new meeting
  const newMeeting = await r
    .table('NewMeeting')
    .get(meetingId)
    .default(null)
  if (!newMeeting) return false
  const {phases} = newMeeting
  const checkInPhase = phases.find((phase) => phase.phaseType === CHECKIN)
  const updatesPhase = phases.find((phase) => phase.phaseType === UPDATES)
  if (checkInPhase) {
    setInPhase(checkInPhase, new CheckInStage(teamMember.id))
  }
  if (updatesPhase) {
    setInPhase(updatesPhase, new UpdatesStage(teamMember.id))
  }
  const [meetingMember] = await createMeetingMembers(newMeeting, [teamMember], dataLoader)
  await r({
    meeting: r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        phases,
        updatedAt: now
      }),
    member: r.table('MeetingMember').insert(meetingMember)
  })
  return true
}

export default addTeamMemberToNewMeeting
