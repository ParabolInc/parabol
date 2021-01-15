import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import getRethink from '../../../database/rethinkDriver'
import CheckInPhase from '../../../database/types/CheckInPhase'
import CheckInStage from '../../../database/types/CheckInStage'
import TeamMember from '../../../database/types/TeamMember'
import UpdatesPhase from '../../../database/types/UpdatesPhase'
import UpdatesStage from '../../../database/types/UpdatesStage'
import {DataLoaderWorker} from '../../graphql'
import createMeetingMembers from './createMeetingMembers'

/*
 * NewMeetings have a predefined set of stages, we need to add the new team member manually
 */

const setInPhase = (phase: CheckInPhase | UpdatesPhase, newStage: CheckInStage | UpdatesStage) => {
  const isMemberInMeeting = phase.stages.find(
    (stage) => stage.teamMemberId === newStage.teamMemberId
  )
  if (isMemberInMeeting) return
  const firstStage = phase.stages[0]
  const isPhaseComplete = phase.stages.every((stage) => stage.isComplete)
  newStage.isNavigable = firstStage.isNavigable
  newStage.isNavigableByFacilitator = firstStage.isNavigableByFacilitator
  newStage.isComplete = isPhaseComplete
  phase.stages.push(newStage)
}

const addTeamMemberToMeetings = async (
  teamMember: TeamMember,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const now = new Date()
  const r = await getRethink()
  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  await Promise.all(
    activeMeetings.map(async (activeMeeting) => {
      const {id: meetingId, phases} = activeMeeting
      const checkInPhase = phases.find(
        (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.checkin
      ) as CheckInPhase
      const updatesPhase = phases.find(
        (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.updates
      ) as UpdatesPhase
      if (checkInPhase) {
        setInPhase(checkInPhase, new CheckInStage(teamMember.id))
      }
      if (updatesPhase) {
        setInPhase(updatesPhase, new UpdatesStage(teamMember.id))
      }
      const [meetingMember] = createMeetingMembers(activeMeeting, [teamMember])
      await r({
        meeting: r.table('NewMeeting').get(meetingId).update({
          phases,
          updatedAt: now
        }),
        member: r.table('MeetingMember').insert(meetingMember)
      }).run()
    })
  )
}

export default addTeamMemberToMeetings
